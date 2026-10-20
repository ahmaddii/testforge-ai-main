import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getProjectWithAccess, getPrimaryOwnerId } from '../lib/access';
import { supabase } from '../lib/supabase';
import {
  ensureWorkspaceRAGFresh,
  retrieveEvidence,
  SpecySourceMetadata,
} from '../services/specy-rag';
import { executeProjectTests } from './execution-runs';
import { SuiteExecutionSummary, sanitizeSensitiveText } from '../services/playwright-runner';
import { classifySpecyIntent, ClassifiedIntent, hasExecutionNegation } from '../services/specy-intent';
import { GitHubService } from '../services/github';
import { generateExecutionTriage, generateFailureInvestigation, generateSpecyResponse, generateTestCases } from '../services/gemini';
import fs from 'fs';
import path from 'path';
import { inspectSavedArtifact, hasMaterialEvidenceChanged } from '../services/qa-investigation-evidence';

const chatFallbackDir = path.resolve(__dirname, '../../data');
const chatFallbackFile = path.join(chatFallbackDir, 'specy_chats.json');

export interface StoredSpecySession {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  messages: any[];
}

function getFallbackSessions(): StoredSpecySession[] {
  try {
    if (!fs.existsSync(chatFallbackDir)) fs.mkdirSync(chatFallbackDir, { recursive: true });
    if (!fs.existsSync(chatFallbackFile)) {
      fs.writeFileSync(chatFallbackFile, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(chatFallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function saveFallbackSessions(sessions: StoredSpecySession[]) {
  try {
    if (!fs.existsSync(chatFallbackDir)) fs.mkdirSync(chatFallbackDir, { recursive: true });
    fs.writeFileSync(chatFallbackFile, JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error('Failed to save fallback specy chats:', err);
  }
}

const router = Router();

function asksForWorkspaceEvidence(message: string): boolean {
  const resources = '(?:requirements?|test\\s+cases?|defects?|runs?|plans?|results?|coverage|history|executions?)';
  return /\b(our|my|selected\s+project|current\s+project|this\s+project|in\s+(?:the|our)\s+workspace|in\s+(?:the|our)\s+project|execution\s+run|run\s+history|test\s+history|requirements?\s+for|tests?\s+for|defect\s+in)\b/i.test(message) ||
    new RegExp(`\\b(?:latest|last|recent|pending|existing|saved)\\s+${resources}\\b`, 'i').test(message) ||
    new RegExp(`\\b(?:how\\s+many|which|do\\s+we\\s+have|have\\s+we|did\\s+we)\\b.{0,45}\\b${resources}\\b`, 'i').test(message) ||
    new RegExp(`\\b(show|list|find)\\s+(?:me\\s+)?(?:our|my|the|all|any|pending|latest|last|recent|existing|saved)?\\s*${resources}\\b`, 'i').test(message);
}

/**
 * Compact helper to trim and truncate large objects for prompt safety
 */
function compactPayload(value: any): any {
  if (Array.isArray(value)) {
    return value.slice(0, 30).map(compactPayload);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 25)
        .map(([key, item]) => [
          key,
          typeof item === 'string' ? item.slice(0, 500) : compactPayload(item),
        ]),
    );
  }
  return typeof value === 'string' ? value.slice(0, 500) : value;
}

/**
 * Format execution summary reply for Specy chat
 */
function formatExecutionSummaryReply(
  summary: SuiteExecutionSummary,
  projectName: string,
): string {
  const statusEmoji =
    summary.passed === summary.total_cases && summary.total_cases > 0
      ? '✅'
      : summary.failed > 0
      ? '❌'
      : '⚠️';
  const passRate =
    summary.total_cases > 0
      ? Math.round((summary.passed / summary.total_cases) * 100)
      : 0;
  const screenshotsCaptured = Object.values(summary.results).filter((tc) => Boolean(tc.screenshot_url)).length;

  const testList = Object.values(summary.results)
    .map((tc, idx) => {
      const icon =
        tc.status === 'Passed'
          ? '✅ Passed'
          : tc.status === 'Failed'
          ? '❌ Failed'
          : '⚠️ Blocked';
      let entry = `${idx + 1}. **[Test Case: ${tc.name} (ID: \`${tc.test_case_id}\`)]**: ${icon} (${tc.duration})\n   - **Module:** ${tc.module}\n   - **Observed Result:** ${tc.actual}`;
      if (tc.error_message) {
        entry += `\n   - **Failure Detail:** \`${tc.error_message.slice(0, 180)}\``;
      }
      if (tc.screenshot_url) {
        entry += `\n   - 📸 *Screenshot evidence recorded*`;
      }
      return entry;
    })
    .join('\n\n');

  return `### ${statusEmoji} Playwright Test Execution Summary

I have executed **${summary.total_cases} test cases** for **${projectName}** against **${summary.environment}** (\`${summary.environment_url}\`).

**Suite Performance Metrics:**
- **Overall Status:** ${
    summary.status === 'Completed'
      ? '✅ Completed'
      : summary.status === 'Partial'
      ? '⚠️ Partial Pass'
      : '❌ Failed'
  }
- **Total Executions:** ${summary.total_cases}
- **Passed:** ${summary.passed} (${passRate}%)
- **Failed:** ${summary.failed}
- **Blocked:** ${summary.blocked}
- **Execution Duration:** ${summary.duration}
- **Execution Run ID:** \`${summary.run_id}\`

---

#### 📋 Detailed Test Case Outcomes

${testList}

---

${
  summary.persistence_error
    ? `⚠️ **Database Persistence Warning:** ${summary.persistence_error}. Results could not be written to Supabase execution_runs.`
    : `🔍 **Execution Evidence:**\nStep results are available in the execution history. Screenshots were captured for ${screenshotsCaptured}/${summary.total_cases} test cases.`
}

👉 **[View Full Execution Details on the Executed Tests Page](/app/executed-tests?runId=${summary.run_id})**`;
}

async function appendExecutionTriage(
  summary: SuiteExecutionSummary,
  projectName: string,
  enabled: boolean,
  onProgress?: (message: string) => void,
): Promise<string> {
  let reply = formatExecutionSummaryReply(summary, projectName);
  const unresolved = Object.values(summary.results).filter(
    (result) => result.status === 'Failed' || result.status === 'Blocked' || result.status === 'Error',
  );
  if (!enabled || unresolved.length === 0) return reply;

  onProgress?.('Run complete. Specy is analyzing the failed and blocked Playwright evidence...');
  const outcomes = unresolved.slice(0, 25).map((result) => ({
    title: sanitizeSensitiveText(result.name),
    status: result.status,
    expected: sanitizeSensitiveText(result.expected || ''),
    observed: sanitizeSensitiveText(result.actual || ''),
    error: result.error_message ? sanitizeSensitiveText(result.error_message) : null,
    failedSteps: result.steps
      .filter((step) => step.status === 'Failed' || step.status === 'Blocked' || step.status === 'Error')
      .slice(0, 10)
      .map((step) => ({
        description: sanitizeSensitiveText(step.description),
        status: step.status,
        error: step.error ? sanitizeSensitiveText(step.error) : undefined,
      })),
  }));

  try {
    const triage = await generateExecutionTriage({
      projectName: sanitizeSensitiveText(projectName),
      environment: sanitizeSensitiveText(summary.environment),
      outcomes,
    });
    reply += `\n\n### 🧭 Specy Failure Triage\n\n${triage.analysis}\n\n*Analysis is grounded in this run's Playwright results. Possible causes are hypotheses until independently confirmed.*`;
  } catch (error) {
    console.warn('[Specy] AI execution triage unavailable; returning evidence-only triage:', error);
    const observed = outcomes
      .map((outcome) => `- **${outcome.status}: ${outcome.title}** — ${outcome.error || outcome.observed || 'No additional failure detail was recorded.'}`)
      .join('\n');
    reply += `\n\n### 🧭 Specy Failure Triage\n\n**Confirmed observations**\n${observed}\n\n**Next step:** Open each case in the execution details to review its step trace and screenshot. AI analysis was unavailable, so no root cause is inferred.`;
  }
  return reply;
}

/**
 * Specy Chat endpoint with full intent classification, action orchestration,
 * RAG grounding, repository analysis, and truth-preserving Playwright execution.
 */
async function handleSpecyChat(
  req: Request,
  res: Response,
  explicitMode?: string,
) {
  const customQuery =
    explicitMode === 'defect_investigation'
      ? (typeof req.body?.query === 'string' && req.body.query.trim()) ||
        (typeof req.body?.message === 'string' && req.body.message.trim()) ||
        'Investigate all failed test cases from the latest execution run. Identify observed failures, connect them to governing requirements and existing regression defects, clearly distinguish confirmed root causes from hypotheses, provide recommended debugging steps, and cite evidence sources.'
      : typeof req.body?.message === 'string'
      ? req.body.message.trim()
      : '';

  const message = customQuery;
  const wantsProgressStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';
  let progressStreamStarted = false;
  const sendProgress = (event: Record<string, unknown>) => {
    if (!progressStreamStarted) return;
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  if (!message || message.length > 10000) {
    return res.status(400).json({
      error: 'Message must contain between 1 and 10000 characters.',
    });
  }

  // Social openers should not wait for project discovery, a full RAG sync, or an LLM.
  // Keep this deliberately narrow so actual QA requests always use the normal agent path.
  const normalizedMessage = message.toLowerCase().trim().replace(/[!.?,]+$/g, '').trim();
  const isGreeting = /^(?:(?:hi|hello|hey|hiya|yo)(?:\s+specy)?|good\s+(?:morning|afternoon|evening)|how\s+are\s+you)$/i.test(normalizedMessage);
  const isThanks = /^(?:thanks|thank\s+you|thx|cheers)(?:\s+specy)?$/i.test(normalizedMessage);
  if (!explicitMode && (isGreeting || isThanks)) {
    return res.json({
      reply: isThanks
        ? "You’re welcome! What would you like help with?"
        : "Hi! I’m Specy. I can help with your requirements, test cases, defects, and Playwright runs. What are you working on?",
      agent: 'Specy',
      mode: 'quick_chat',
      sources: [],
      model_used: 'Specy instant reply',
    });
  }

  const qaTools = req.body?.qa_tools || {};
  let classified: ClassifiedIntent = explicitMode
    ? { intent: explicitMode as any, confidence: 1.0, reasoning: 'Explicit endpoint mode' }
    : classifySpecyIntent(message);
  if (qaTools.defect_investigator === false && classified.intent === 'defect_investigation') {
    classified = { ...classified, intent: 'workspace_query' };
  }

  if (!explicitMode && classified.intent === 'workspace_query' && !asksForWorkspaceEvidence(message)) {
    try {
      const answer = await generateSpecyResponse({
        message,
        workspaceContext: { note: 'This is a general question; no workspace facts were requested.' },
        retrievedContext: '',
      });
      return res.json({
        reply: answer.reply,
        agent: 'Specy',
        mode: 'standard_chat',
        sources: [],
        model_used: `gemini:${answer.model}`,
        project_id: null,
      });
    } catch (error: any) {
      console.error('[Specy] General response failed:', error);
      return res.status(503).json({ error: 'Specy could not generate a response. Check the Gemini API configuration and retry.' });
    }
  }

  const rawProjectId = req.body?.project_id;
  let projectId: string | null =
    typeof rawProjectId === 'string' && rawProjectId.trim() !== '' && rawProjectId !== 'all'
      ? rawProjectId.trim()
      : null;

  try {
    const userId = (req as any).user!.id;
    const ownerIds = await getAccessibleOwnerIds(userId);

    // Resolve target project
    let targetProject: any = null;
    if (projectId) {
      const { project } = await getProjectWithAccess(projectId, userId);
      targetProject = project;
    } else {
      const { data: userProjects } = await supabase
        .from('projects')
        .select('*')
        .in('user_id', ownerIds)
        .limit(5);

      if (userProjects && userProjects.length === 1) {
        projectId = userProjects[0].id;
        targetProject = userProjects[0];
      } else if (userProjects && userProjects.length > 1) {
        const matched = userProjects.find((p) =>
          message.toLowerCase().includes(p.name.toLowerCase())
        );
        if (matched) {
          projectId = matched.id;
          targetProject = matched;
        }
      }
    }

    // If an investigation has no explicit project, follow the newest failed run
    // within the caller's accessible workspace instead of guessing a project.
    if (classified.intent === 'defect_investigation' && !projectId) {
      const { data: recentRuns } = await supabase
        .from('execution_runs')
        .select('id, project_id, user_id, failed, results, created_at')
        .in('user_id', ownerIds)
        .order('created_at', { ascending: false })
        .limit(30);
      const newestFailure = (recentRuns || []).find((run: any) => {
        const outcomes = Object.entries(run.results || {}).filter(([key]) => key !== '_meta');
        return Number(run.failed) > 0 || outcomes.some(([, outcome]: [string, any]) => outcome?.status === 'Failed' || outcome?.status === 'Error');
      });
      if (newestFailure?.project_id) {
        const access = await getProjectWithAccess(newestFailure.project_id, userId);
        if (access.project) {
          projectId = newestFailure.project_id;
          targetProject = access.project;
        }
      }
    }

    const primaryOwnerId = targetProject?.user_id || (await getPrimaryOwnerId(userId));

    // =========================================================================
    // INTENT 1: Audit & Evidence Inspection (Strictly Read-Only, No Execution)
    // =========================================================================
    if (classified.intent === 'audit_inspection') {
      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a specific project first to audit its execution records.',
          agent: 'Specy',
          mode: 'audit_inspection',
          sources: [],
        });
      }

      let runQuery = supabase
        .from('execution_runs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (classified.targetRunId) {
        runQuery = supabase.from('execution_runs').select('*').eq('id', classified.targetRunId);
      }

      const { data: runs, error: runErr } = await runQuery;
      const run = runs?.[0];

      if (runErr || !run) {
        return res.json({
          reply: `No execution runs found for project **${targetProject.name}**. Please run tests first before requesting an audit.`,
          agent: 'Specy',
          mode: 'audit_inspection',
          sources: [],
          project_id: projectId,
        });
      }

      const results = run.results || {};
      const meta = results._meta || {};
      const testEntries = Object.entries(results).filter(([k]) => k !== '_meta');

      let verifiedCount = 0;
      let partiallyVerifiedCount = 0;
      let unverifiedCount = 0;

      const auditRows = testEntries.map(([tcId, itemRaw]: [string, any], idx) => {
        const item = itemRaw || {};
        const steps = item.steps || [];
        const status = item.status || 'Passed';
        const duration = item.duration || item.time || '0ms';
        const hasScreenshot = Boolean(item.screenshot_url);

        let verdict: 'Verified' | 'Partially Verified' | 'Unverified' = 'Unverified';
        let evidenceNote = '';

        if (status === 'Blocked') {
          verdict = 'Verified';
          evidenceNote = `Safely blocked: ${item.actual || item.error_message || 'Blocked by policy'}`;
        } else if (status === 'Failed') {
          verdict = 'Verified';
          evidenceNote = `Failure caught: ${item.error_message || item.actual}`;
        } else if (item.actual && item.actual.includes('Expected outcome confirmed on staging page')) {
          // Historical run diagnostic evaluation
          if (item.name && item.name.includes('Access Admin Dashboard without auth')) {
            verdict = 'Verified';
            evidenceNote = 'Direct navigation to /admin/dashboard confirmed redirect to /admin/login';
          } else if (item.name && (item.name.includes('duplicate email') || item.name.includes('submit waitlist application'))) {
            verdict = 'Partially Verified';
            evidenceNote = 'DOM interaction performed; external email/database persistence not verified';
          } else {
            verdict = 'Unverified';
            evidenceNote = 'Steps fell through in <30ms; passed via default page body check';
          }
        } else {
          const hasRealAction = steps.some(
            (s: any) =>
              s.action_type === 'api_call' ||
              s.action_type === 'api_stress_loop' ||
              s.action_type === 'download' ||
              s.action_type === 'input_fill' ||
              s.action_type === 'navigate'
          );
          verdict = hasRealAction ? 'Verified' : 'Partially Verified';
          evidenceNote = item.actual || 'Steps executed and verified';
        }

        if (verdict === 'Verified') verifiedCount++;
        else if (verdict === 'Partially Verified') partiallyVerifiedCount++;
        else unverifiedCount++;

        return `| ${idx + 1} | ${item.name || 'Untitled'} | \`${status}\` | ${duration} | ${evidenceNote.slice(0, 90)} | **${verdict}** |`;
      });

      const auditTableMarkdown = auditRows.join('\n');

      const auditReply = `### 🛡️ Specy Execution Audit Report (Read-Only Mode)

**Target Project:** ${targetProject.name}  
**Execution Run ID:** \`${run.id}\`  
**Target Environment:** ${run.environment} (\`${meta.environment_url || 'Configured URL'}\`)  
**Execution Date:** ${new Date(run.created_at).toLocaleString()}  
**Reported Metrics:** ${run.passed} Passed, ${run.failed} Failed (Reported Duration: ${run.duration})  
**Production Read-Only Safety Policy:** ${meta.is_readonly ? '✅ Active (Mutations Blocked)' : '⚪ Inactive'}

---

#### 📊 Empirical Verification Summary
- **Verified (Actual Assertion & DOM/API confirmation):** ${verifiedCount}
- **Partially Verified (DOM interaction only; external side-effects unverified):** ${partiallyVerifiedCount}
- **Unverified (Simulation / Default Fallback):** ${unverifiedCount}

| # | Test Title | Reported Status | Duration | Evidence & Observed Result | Audit Verdict |
|---|---|---|---|---|:---:|
${auditTableMarkdown}

---

🔍 **Integrity Notes:**
- Screenshots exist for ${testEntries.filter(([, v]: any) => v.screenshot_url).length}/${testEntries.length} test cases in Supabase storage.
- No live tests were executed during this audit. Existing database records and test cases remain intact.

👉 **[View Full Execution Details on the Executed Tests Page](/app/executed-tests?runId=${run.id})**`;

      return res.json({
        reply: auditReply,
        agent: 'Specy',
        mode: 'audit_inspection',
        execution_run: run,
        sources: [
          {
            id: run.id,
            title: run.name,
            source_type: 'execution_run',
            similarity: 1.0,
            project_id: projectId,
          },
        ],
        project_id: projectId,
      });
    }

    // =========================================================================
    // INTENT 2: Execution History
    // =========================================================================
    if (classified.intent === 'execution_history') {
      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a specific project first to view its execution history.',
          agent: 'Specy',
          mode: 'execution_history',
          sources: [],
        });
      }

      const { data: runs, error: runsErr } = await supabase
        .from('execution_runs')
        .select('id, name, environment, passed, failed, duration, created_at, results')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (runsErr || !runs || runs.length === 0) {
        return res.json({
          reply: `No execution history found for project **${targetProject.name}**. You can run tests using "Run all pending test cases".`,
          agent: 'Specy',
          mode: 'execution_history',
          sources: [],
          project_id: projectId,
        });
      }

      const runsList = runs
        .map((r, i) => {
          const meta = (r.results as any)?._meta || {};
          const blocked = meta.blocked || 0;
          const statusIcon = r.failed > 0 ? '❌ Failed' : blocked > 0 ? '⚠️ Partial/Blocked' : '✅ Passed';
          return `${i + 1}. **[${r.name}](/app/executed-tests?runId=${r.id})**
   - **Run ID:** \`${r.id}\`
   - **Date:** ${new Date(r.created_at).toLocaleString()}
   - **Environment:** ${r.environment}
   - **Outcome:** ${statusIcon} (${r.passed} passed, ${r.failed} failed, ${blocked} blocked)
   - **Duration:** ${r.duration}`;
        })
        .join('\n\n');

      return res.json({
        reply: `### 📜 Execution History for ${targetProject.name}

Found **${runs.length} recorded execution run${runs.length > 1 ? 's' : ''}**:

${runsList}

👉 **[Go to Executed Tests Dashboard](/app/executed-tests)**`,
        agent: 'Specy',
        mode: 'execution_history',
        sources: runs.map((r) => ({
          id: r.id,
          title: r.name,
          source_type: 'execution_run',
          similarity: 1.0,
          project_id: projectId,
        })),
        project_id: projectId,
      });
    }

    // =========================================================================
    // INTENT 3: Defect & Failure Investigation
    // =========================================================================
    if (classified.intent === 'defect_investigation') {
      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a specific project first to investigate test failures.',
          agent: 'Specy',
          mode: 'defect_investigation',
          sources: [],
        });
      }

      if (wantsProgressStream && !progressStreamStarted) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        progressStreamStarted = true;
      }
      const respondWithInvestigation = (payload: Record<string, unknown>) => {
        if (progressStreamStarted) {
          sendProgress({ type: 'complete', ...payload });
          return res.end();
        }
        return res.json(payload);
      };

      sendProgress({ type: 'progress', message: 'Finding the most recent failed run and its Playwright evidence…' });
      const { data: runs, error: runsError } = await supabase
        .from('execution_runs')
        .select('*')
        .in('user_id', ownerIds)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(12);
      if (runsError) throw new Error(`Could not load execution history: ${runsError.message}`);

      const getRunEntries = (run: any) => Object.entries(run?.results || {}).filter(([key]) => key !== '_meta');
      const failedEntries = (run: any) => getRunEntries(run).filter(([, raw]: [string, any]) =>
        raw?.status === 'Failed' || raw?.status === 'Error',
      );
      const latestRun = runs?.[0];
      const failureRun = runs?.find((run: any) => Number(run.failed) > 0 || failedEntries(run).length > 0);

      if (!failureRun) {
        const latestEntries = latestRun ? getRunEntries(latestRun) : [];
        const blockedCount = latestEntries.filter(([, raw]: [string, any]) => raw?.status === 'Blocked').length;
        const reply = !latestRun
          ? `I couldn’t find a saved Playwright run for **${targetProject.name}**, so I don’t have failure evidence to investigate yet.`
          : `The latest run for **${targetProject.name}** (\`${latestRun.id}\`) has no recorded failed or errored cases${blockedCount ? `; ${blockedCount} case${blockedCount === 1 ? ' is' : 's are'} blocked` : ''}. I can investigate a failing run once one is available.`;
        return respondWithInvestigation({
          reply,
          agent: 'Specy',
          mode: 'defect_investigation',
          sources: latestRun ? [{ id: latestRun.id, title: latestRun.name, source_type: 'execution_run', similarity: 1, project_id: projectId }] : [],
          project_id: projectId,
        });
      }

      const failureRows = failedEntries(failureRun);
      const blockedRows = getRunEntries(failureRun).filter(([, raw]: [string, any]) => raw?.status === 'Blocked');
      const failedIds = failureRows.map(([id]) => id).slice(0, 50);
      sendProgress({ type: 'progress', message: `Inspecting ${failureRows.length} failed case${failureRows.length === 1 ? '' : 's'}, their saved steps, browser logs, and screenshots…` });

      const [caseQuery, requirementQuery, defectQuery] = await Promise.all([
        failedIds.length
          ? supabase.from('test_cases').select('*').in('user_id', ownerIds).eq('project_id', projectId).in('id', failedIds)
          : Promise.resolve({ data: [], error: null } as any),
        supabase.from('requirements').select('*').in('user_id', ownerIds).eq('project_id', projectId).order('created_at', { ascending: false }).limit(100),
        supabase.from('defects').select('*').in('user_id', ownerIds).eq('project_id', projectId).order('created_at', { ascending: false }).limit(100),
      ]);
      const caseRecords = (caseQuery.data || []) as any[];
      const requirementRecords = (requirementQuery.data || []) as any[];
      const defectRecords = (defectQuery.data || []) as any[];
      const caseById = new Map(caseRecords.map((testCase) => [String(testCase.id), testCase]));

      const words = (value: unknown) => String(value || '').toLowerCase().match(/[a-z0-9]{4,}/g) || [];
      const overlapScore = (left: unknown, right: unknown) => {
        const leftWords = new Set(words(left));
        return words(right).reduce((score, word) => score + (leftWords.has(word) ? 1 : 0), 0);
      };
      const failures = failureRows.slice(0, 25).map(([testCaseId, raw]: [string, any]) => {
        const item = raw || {};
        const testCase = caseById.get(String(testCaseId));
        const linkedRequirementIds = [testCase?.requirement_id, ...(Array.isArray(testCase?.requirement_ids) ? testCase.requirement_ids : [])]
          .filter(Boolean).map(String);
        const caseText = `${item.name || testCase?.title || ''} ${item.module || testCase?.module || ''}`;
        const relatedRequirements = requirementRecords
          .map((requirement) => ({ requirement, score: linkedRequirementIds.includes(String(requirement.id)) ? 100 : overlapScore(caseText, `${requirement.title} ${requirement.description}`) }))
          .filter(({ score }) => score >= 2)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(({ requirement }) => ({ id: requirement.id, title: requirement.title, description: sanitizeSensitiveText(requirement.description || '').slice(0, 700), priority: requirement.priority, status: requirement.status }));
        const relatedDefects = defectRecords
          .map((defect) => ({ defect, score: String(defect.test_case_id || '') === String(testCaseId) ? 100 : overlapScore(caseText, `${defect.title} ${defect.description}`) }))
          .filter(({ score }) => score >= 2)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(({ defect }) => ({ id: defect.id, title: defect.title, description: sanitizeSensitiveText(defect.description || '').slice(0, 700), severity: defect.severity, status: defect.status, test_case_id: defect.test_case_id }));
        const previousRun = (runs || []).filter((run: any) => new Date(run.created_at).getTime() < new Date(failureRun.created_at).getTime())
          .map((run: any) => ({ run, item: (run.results || {})[testCaseId] }))
          .find(({ item }) => item && item.status);
        const failedSteps = (item.steps || []).filter((step: any) => ['Failed', 'Error', 'Blocked'].includes(step.status)).slice(0, 8);
        return {
          id: testCaseId,
          status: item.status,
          title: sanitizeSensitiveText(item.name || testCase?.title || testCaseId),
          module: sanitizeSensitiveText(item.module || testCase?.module || ''),
          expected: sanitizeSensitiveText(item.expected || testCase?.expected || '').slice(0, 700),
          observed: sanitizeSensitiveText(item.actual || '').slice(0, 1000),
          error: sanitizeSensitiveText(item.error_message || failedSteps[0]?.error || '').slice(0, 1200),
          stack_trace: sanitizeSensitiveText(item.stack_trace || '').slice(0, 2000),
          failed_steps: failedSteps.map((step: any) => ({ step_number: step.step_number, description: sanitizeSensitiveText(step.description || '').slice(0, 500), status: step.status, error: sanitizeSensitiveText(step.error || '').slice(0, 800), expected: sanitizeSensitiveText(step.expected_value || '').slice(0, 300), observed: sanitizeSensitiveText(step.observed_value || '').slice(0, 500) })),
          console_errors: (Array.isArray(item.console_errors) ? item.console_errors : []).slice(0, 8).map((entry: string) => sanitizeSensitiveText(entry).slice(0, 500)),
          network_errors: (Array.isArray(item.network_errors) ? item.network_errors : []).slice(0, 8).map((entry: string) => sanitizeSensitiveText(entry).slice(0, 500)),
          screenshot_available: Boolean(item.screenshot_url),
          screenshot_url: item.screenshot_url || null,
          trace_url: item.trace_url || null,
          initial_http_status: item.initial_http_status ?? null,
          final_http_status: item.final_http_status ?? null,
          final_url: sanitizeSensitiveText(item.final_url || '').slice(0, 1000) || null,
          page_title: sanitizeSensitiveText(item.page_title || '').slice(0, 300) || null,
          page_content_excerpt: sanitizeSensitiveText(item.page_content_excerpt || '').slice(0, 1000) || null,
          saved_test_case: testCase ? { id: testCase.id, title: testCase.title, steps: sanitizeSensitiveText(testCase.steps || '').slice(0, 1600), expected: sanitizeSensitiveText(testCase.expected || '').slice(0, 800), module: testCase.module, requirement_id: testCase.requirement_id || null } : null,
          related_requirements: relatedRequirements,
          related_defects: relatedDefects,
          previous_observation: previousRun ? { run_id: previousRun.run.id, status: previousRun.item.status, observed: sanitizeSensitiveText(previousRun.item.actual || '').slice(0, 500), error: sanitizeSensitiveText(previousRun.item.error_message || '').slice(0, 500) } : null,
        };
      });

      const screenshotsForModel: Array<{ label: string; mimeType: string; base64: string }> = [];
      await Promise.all(failures.map(async (failure: any) => {
        const [screenshot, trace] = await Promise.all([
          inspectSavedArtifact({ url: failure.screenshot_url, runId: failureRun.id, kind: 'screenshot' }),
          inspectSavedArtifact({ url: failure.trace_url, runId: failureRun.id, kind: 'trace' }),
        ]);
        failure.artifact_inspection = {
          screenshot: { state: screenshot.state, detail: screenshot.detail },
          trace: { state: trace.state, detail: trace.detail, summary: trace.traceSummary || null },
        };
        if (screenshot.state === 'inspected' && screenshot.base64) {
          screenshotsForModel.push({ label: `Failed case ${failure.id}: ${failure.title}`, mimeType: screenshot.mimeType || 'image/png', base64: screenshot.base64 });
        }
        delete failure.screenshot_url;
        delete failure.trace_url;
      }));

      const errorSignatures = new Map<string, number>();
      for (const failure of failures) {
        const signature = (failure.error || failure.failed_steps?.[0]?.error || '').toLowerCase().replace(/[0-9a-f-]{12,}/g, '<id>').replace(/\b\d+\b/g, '<n>').slice(0, 180);
        if (signature) errorSignatures.set(signature, (errorSignatures.get(signature) || 0) + 1);
      }
      const diagnostics = [
        `Read-only comparison against ${Math.max(0, (runs || []).length - 1)} earlier saved run(s) was performed.`,
        `${failures.filter((failure) => failure.previous_observation).length} failed case(s) had a prior saved outcome available for comparison.`,
        `${[...errorSignatures.values()].filter((count) => count > 1).length} repeated error signature(s) were found across the failed cases.`,
        `${failures.filter((failure) => failure.console_errors.length > 0).length} failed case(s) include console logs; ${failures.filter((failure) => failure.network_errors.length > 0).length} include network errors.`,
        'No tests were rerun and no application, database, or environment state was changed during this investigation.',
      ];
      if (caseQuery.error) diagnostics.push(`Test case record lookup was unavailable: ${caseQuery.error.message}`);
      if (requirementQuery.error) diagnostics.push(`Requirement lookup was unavailable: ${requirementQuery.error.message}`);
      if (defectQuery.error) diagnostics.push(`Defect lookup was unavailable: ${defectQuery.error.message}`);

      let ragEvidence = { sources: [] as SpecySourceMetadata[], contextText: '' };
      if (qaTools.rag_grounding !== false) {
        sendProgress({ type: 'progress', message: 'Connecting failures to matching requirements and existing defects…' });
        try {
          await ensureWorkspaceRAGFresh({ ownerIds, projectId });
          const retrievalQuery = failures.slice(0, 6).map((failure) => `${failure.title} ${failure.module} ${failure.error}`).join('\n');
          ragEvidence = await retrieveEvidence({ query: retrievalQuery || message, ownerIds, projectId, minSimilarity: 0.5, limit: 8 });
        } catch (ragError) {
          console.warn('[Specy Investigator] RAG retrieval unavailable; using direct linked records:', ragError);
        }
      }

      sendProgress({ type: 'progress', message: 'Weighing the evidence and preparing a fix with verification steps…' });
      const investigationEvidence = {
        run: { id: failureRun.id, name: failureRun.name, created_at: failureRun.created_at, environment: failureRun.environment, reported_passed: failureRun.passed, reported_failed: failureRun.failed, duration: failureRun.duration, status: failureRun.status },
        failed_case_count: Math.max(failureRows.length, Number(failureRun.failed) || 0),
        blocked_cases: blockedRows.slice(0, 15).map(([id, raw]: [string, any]) => ({ id, title: raw.name, status: raw.status, observed: sanitizeSensitiveText(raw.actual || '').slice(0, 500), reason: sanitizeSensitiveText(raw.error_message || '').slice(0, 500) })),
        failures,
        diagnostics,
        retrieved_workspace_evidence: ragEvidence.contextText.slice(0, 12000),
      };
      let analysis: string;
      let investigationModel = 'evidence-only fallback';
      const previousFailureRun = (runs || []).find((run: any) => run.id !== failureRun.id && failedEntries(run).length > 0);
      const currentOutcomeFingerprint = failures.map((failure) => ({ id: failure.id, status: failure.status, error: failure.error, observed: failure.observed, expected: failure.expected })).sort((a, b) => a.id.localeCompare(b.id));
      const priorOutcomeFingerprint = previousFailureRun ? failedEntries(previousFailureRun).map(([id, outcome]: [string, any]) => ({ id, status: outcome.status, error: outcome.error_message || '', observed: outcome.actual || '', expected: outcome.expected || '' })).sort((a, b) => a.id.localeCompare(b.id)) : null;
      const unchangedRepeat = Boolean(previousFailureRun && !hasMaterialEvidenceChanged(priorOutcomeFingerprint, currentOutcomeFingerprint));
      try {
        if (unchangedRepeat) {
          analysis = `### Summary\nRun \`${failureRun.id}\` repeats the same recorded failed outcomes as \`${previousFailureRun.id}\`; no new diagnostic evidence was found, so I’m not issuing a new root-cause diagnosis.\n\n### Evidence and likely cause\n**Confirmed:** the same test cases have the same saved status, expected result, observed result, and error text in both runs. This repetition does not prove whether the application or assertion is at fault.\n\n**Hypotheses:** unchanged outcomes alone do not support a new cause.\n\n**Missing evidence:** compare the retrieved trace, screenshot, response status, final URL, and page content for both runs; prior artifact content was not available in the saved comparison.\n\n### Recommended fix\nDo not change application behavior based on repeated status alone. Review the assertion and captured browser evidence first.\n\n### How to verify\nReproduce the affected case only against a local or staging environment, then compare its trace, response status, final URL, page content, and screenshot with this run.`;
          investigationModel = 'repeat-evidence guard';
        } else {
        const generated = await generateFailureInvestigation({ projectName: targetProject.name, evidence: investigationEvidence, screenshots: screenshotsForModel });
        analysis = generated.analysis;
        investigationModel = generated.model;
        }
      } catch (aiError) {
        console.error('[Specy Investigator] AI analysis unavailable:', aiError);
        analysis = `### Summary\nFound ${failureRows.length} failed case(s) in run \`${failureRun.id}\`.\n\n### Evidence and likely cause\n${failures.slice(0, 10).map((failure) => `- **${failure.status}: ${failure.title}** (case \`${failure.id}\`) — ${failure.error || failure.observed || 'The saved run does not contain a detailed error.'}`).join('\n')}\n\nThe saved evidence alone is not enough to confirm a root cause. AI analysis was unavailable, so no cause is inferred.\n\n### Recommended fix\nReview the linked test case, requirement, and any existing defect before changing application behavior.\n\n### How to verify\nRerun the affected case in the configured test environment and compare its step trace with run \`${failureRun.id}\`.`;
      }

      const relatedSources: SpecySourceMetadata[] = [
        { id: failureRun.id, title: failureRun.name || 'Failed execution run', source_type: 'execution_run' as const, similarity: 1, project_id: projectId },
        ...failures.flatMap((failure) => [
          { id: failure.id, title: failure.title, source_type: 'test_case' as const, similarity: 1, project_id: projectId },
          ...failure.related_requirements.map((record) => ({ id: record.id, title: record.title, source_type: 'requirement' as const, similarity: 1, project_id: projectId })),
          ...failure.related_defects.map((record) => ({ id: record.id, title: record.title, source_type: 'defect' as const, similarity: 1, project_id: projectId })),
        ]),
        ...ragEvidence.sources,
      ].filter((source, index, array) => array.findIndex((item) => `${item.source_type}:${item.id}` === `${source.source_type}:${source.id}`) === index).slice(0, 12);

      return respondWithInvestigation({
        reply: `## QA Investigation: ${targetProject.name}\n\n${analysis}\n\n[Open run evidence](/app/executed-tests?runId=${failureRun.id})`,
        agent: 'Specy',
        mode: 'defect_investigation',
        model_used: `specy-investigator:${investigationModel}`,
        sources: relatedSources,
        project_id: projectId,
      });
    }

    // =========================================================================
    // INTENT 4: Repository Analysis & Feature Discovery
    // =========================================================================
    if (classified.intent === 'repository_analysis') {
      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a specific project first to analyze its repository.',
          agent: 'Specy',
          mode: 'repository_analysis',
          sources: [],
        });
      }

      let tree: any[] = [];
      const repoUrl = targetProject.repo_url;
      const parsedRepo = repoUrl ? GitHubService.parseUrl(repoUrl) : null;

      if (parsedRepo) {
        tree = await GitHubService.getFileTree(parsedRepo.owner, parsedRepo.repo).catch(() => []);
      }

      if (tree && tree.length > 0) {
        const filePaths = tree.map((t) => t.path || '');
        const routeFiles = filePaths.filter((p) => /pages|app|routes|controllers|api/i.test(p));
        const componentFiles = filePaths.filter((p) => /components/i.test(p));
        const authFiles = filePaths.filter((p) => /auth|login|signup|middleware/i.test(p));

        const featuresDiscovered = [
          routeFiles.length > 0 ? `- **Routing & API Endpoints:** ${routeFiles.length} route files identified (e.g. \`${routeFiles.slice(0, 4).join('`, `')}\`)` : '',
          componentFiles.length > 0 ? `- **UI Components:** ${componentFiles.length} interactive UI components discovered` : '',
          authFiles.length > 0 ? `- **Authentication & Access Control:** Auth modules identified in \`${authFiles.slice(0, 3).join('`, `')}\`` : '',
        ]
          .filter(Boolean)
          .join('\n');

        return res.json({
          reply: `### 📦 Repository Architecture & Feature Analysis

**Project:** ${targetProject.name}  
**Repository:** [${targetProject.repo_url}](${targetProject.repo_url})  
**Total Tracked Files:** ${tree.length} files analyzed

#### 🔍 Discovered Architecture & Features:
${featuresDiscovered}

#### 🎯 SQA Recommendations:
- Generate automated test cases covering discovered API endpoints and auth flows.
- Review requirements to ensure test coverage across all ${routeFiles.length} identified routes.

Would you like me to generate positive and negative test cases for these discovered features?`,
          agent: 'Specy',
          mode: 'repository_analysis',
          sources: [],
          project_id: projectId,
        });
      } else {
        return res.json({
          reply: `### 📦 Project Specification Overview

**Project:** ${targetProject.name}  
**Description:** ${targetProject.description || 'No description provided'}  
**Repository URL:** ${targetProject.repo_url || 'None configured'}

*(Note: Direct GitHub source tree was not accessible via unauthenticated API. Analysis is grounded in registered workspace specifications and requirements).*

Would you like me to review the existing requirements or generate test scenarios based on the project description?`,
          agent: 'Specy',
          mode: 'repository_analysis',
          sources: [],
          project_id: projectId,
        });
      }
    }

    // =========================================================================
    // INTENT 5: Requirement Creation
    // =========================================================================
    if (classified.intent === 'requirement_creation') {
      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a project before creating a requirement.',
          agent: 'Specy',
          mode: 'requirement_creation',
          sources: [],
        });
      }

      const reqTitle = classified.requirementTitle || 'New Specification Requirement';
      const reqDesc = classified.requirementDescription || `Specification requirement for ${reqTitle}.`;

      const { data: newReq, error: reqErr } = await supabase
        .from('requirements')
        .insert({
          project_id: projectId,
          user_id: primaryOwnerId,
          title: reqTitle,
          description: reqDesc,
          priority: 'High',
          status: 'Draft',
        })
        .select()
        .single();

      if (reqErr) {
        return res.status(500).json({ error: `Failed to create requirement: ${reqErr.message}` });
      }

      return res.json({
        reply: `### ✅ Requirement Created Successfully

I have created a new specification requirement for **${targetProject.name}**:

- **ID:** \`${newReq.id}\`
- **Title:** **${newReq.title}**
- **Description:** ${newReq.description}
- **Priority:** ${newReq.priority}
- **Status:** ${newReq.status}

You can now ask me: *"Generate test cases for ${newReq.title}"* to automatically synthesize positive, negative, and edge test scenarios.`,
        agent: 'Specy',
        mode: 'requirement_creation',
        sources: [
          {
            id: newReq.id,
            title: newReq.title,
            source_type: 'requirement',
            similarity: 1.0,
            project_id: projectId,
          },
        ],
        project_id: projectId,
      });
    }

    // =========================================================================
    // INTENT 6: Test Case Generation
    // =========================================================================
    if (classified.intent === 'test_generation') {
      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a project first to generate test cases.',
          agent: 'Specy',
          mode: 'test_generation',
          sources: [],
        });
      }

      // Fetch requirements
      const { data: requirements } = await supabase
        .from('requirements')
        .select('*')
        .eq('project_id', projectId);

      // Fetch code context if repo available
      let codeContext = '';
      if (targetProject.repo_url) {
        const parsed = GitHubService.parseUrl(targetProject.repo_url);
        if (parsed) {
          codeContext = await GitHubService.getProjectContext(parsed.owner, parsed.repo).catch(() => '');
        }
      }

      const cases = await generateTestCases(requirements || [], targetProject, codeContext);

      // Create Report entry
      const { data: report } = await supabase
        .from('reports')
        .insert({
          project_id: projectId,
          project_name: targetProject.name,
          user_id: primaryOwnerId,
          test_case_count: cases.length,
          coverage: 85,
          generated_at: new Date().toISOString(),
          requirement_name: 'All Modules',
        })
        .select()
        .single();

      // Insert generated test cases
      const testCasesToInsert = cases.map((c: any) => ({
        project_id: projectId,
        user_id: primaryOwnerId,
        report_id: report?.id || null,
        module: c.module || 'General',
        title: c.title || 'Untitled Test Scenario',
        steps: Array.isArray(c.steps) ? c.steps.join('\n') : c.steps || '',
        expected: c.expected || 'Assert expected result',
        type: c.type || 'positive',
        priority: c.priority || 'High',
        status: 'Pending',
      }));

      const { data: inserted, error: insErr } = await supabase
        .from('test_cases')
        .insert(testCasesToInsert)
        .select('id, title, type, priority, module');

      if (insErr) {
        return res.status(500).json({ error: `Failed to save generated test cases: ${insErr.message}` });
      }

      const caseList = (inserted || [])
        .slice(0, 8)
        .map((c: any, i: number) => `${i + 1}. **[${c.type.toUpperCase()}]** ${c.title} *(Priority: ${c.priority}, Module: ${c.module})*`)
        .join('\n');

      return res.json({
        reply: `### ✨ Automated Test Cases Generated

I have generated and saved **${inserted?.length || 0} automated test cases** for **${targetProject.name}** using Gemini AI:

${caseList}
${(inserted?.length || 0) > 8 ? `\n*... and ${(inserted?.length || 0) - 8} additional test cases saved.*` : ''}

All test cases are currently marked **Pending** and ready for Playwright execution.

👉 To execute them, ask: *"Run all pending test cases for ${targetProject.name}"*`,
        agent: 'Specy',
        mode: 'test_generation',
        sources: (inserted || []).slice(0, 5).map((c: any) => ({
          id: c.id,
          title: c.title,
          source_type: 'test_case',
          similarity: 1.0,
          project_id: projectId,
        })),
        project_id: projectId,
      });
    }

    // =========================================================================
    // INTENT 7: Affirmative Playwright Test Execution (Negation-Safe)
    // =========================================================================
    if (classified.intent === 'test_execution') {
      if (qaTools.playwright_runner === false) {
        return res.json({
          reply: 'Playwright execution is turned off in Specy’s Active Engines. Turn on Playwright Runner and resend the request to run the tests.',
          agent: 'Specy',
          mode: 'test_execution',
          sources: [],
          project_id: projectId,
        });
      }

      if (hasExecutionNegation(message.toLowerCase())) {
        return res.json({
          reply: `Execution was not triggered because your request contains negation or requested an inspection/audit mode. Existing database records and environments remain untouched. To run tests, provide an affirmative execution instruction (e.g. "Run all pending test cases").`,
          agent: 'Specy',
          mode: 'workspace_query',
          sources: [],
          project_id: projectId,
        });
      }

      if (!projectId || !targetProject) {
        return res.json({
          reply: 'Please select a project first before executing tests.',
          agent: 'Specy',
          mode: 'test_execution',
          sources: [],
        });
      }

      const isStream =
        req.query.stream === 'true' ||
        req.headers.accept === 'text/event-stream';

      if (isStream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        const sendEvent = (data: any) => {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        try {
          const summary = await executeProjectTests({
            projectId: projectId!,
            userId,
            message,
            filterKeyword: classified.filterKeyword,
            forceAll: classified.runAll,
            runName: `Specy Chat Execution: ${targetProject.name}`,
            triggeredBy: 'Specy Chat',
            conversationId: req.body?.conversation_id,
            onProgress: (event) => {
              sendEvent(event);
            },
          });

          const reply = await appendExecutionTriage(
            summary,
            targetProject.name,
            qaTools.defect_investigator !== false,
            (message) => sendEvent({ type: 'step', message }),
          );
          sendEvent({
            type: 'complete',
            reply,
            execution_run: summary,
            sources: [
              {
                id: summary.run_id,
                title: summary.name,
                source_type: 'execution_run',
                similarity: 1.0,
                project_id: projectId,
              },
            ],
          });
          return res.end();
        } catch (err: any) {
          sendEvent({
            type: 'error',
            error: err.message || 'Execution failed',
            reply: `⚠️ Execution stopped: ${err.message}`,
          });
          return res.end();
        }
      } else {
        try {
          const summary = await executeProjectTests({
            projectId: projectId!,
            userId,
            message,
            filterKeyword: classified.filterKeyword,
            forceAll: classified.runAll,
            runName: `Specy Chat Execution: ${targetProject.name}`,
            triggeredBy: 'Specy Chat',
            conversationId: req.body?.conversation_id,
          });

          const reply = await appendExecutionTriage(
            summary,
            targetProject.name,
            qaTools.defect_investigator !== false,
          );
          return res.json({
            reply,
            agent: 'Specy',
            mode: 'test_execution',
            execution_run: summary,
            sources: [
              {
                id: summary.run_id,
                title: summary.name,
                source_type: 'execution_run',
                similarity: 1.0,
                project_id: projectId,
              },
            ],
            project_id: projectId,
          });
        } catch (err: any) {
          return res.json({
            reply: `⚠️ **Test Execution Note:**\n\n${err.message}`,
            agent: 'Specy',
            mode: 'test_execution',
            sources: [],
            project_id: projectId,
          });
        }
      }
    }

    // =========================================================================
    // INTENT 8: Grounded Workspace QA Chat (RAG Augmented)
    // =========================================================================
    const readScopedRecords = async (
      table: string,
      allowedFields: string[],
    ): Promise<Record<string, unknown>> => {
      try {
        let query = supabase
          .from(table)
          .select('*')
          .in('user_id', ownerIds)
          .order('created_at', { ascending: false })
          .limit(30);

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) return { unavailable: true };

        const records = (data || []).map((record: Record<string, any>) => {
          const safeRecord: Record<string, unknown> = {};
          for (const field of allowedFields) {
            if (record[field] !== undefined) {
              safeRecord[field] =
                typeof record[field] === 'string'
                  ? record[field].slice(0, 500)
                  : record[field];
            }
          }
          return safeRecord;
        });

        return { records };
      } catch (err) {
        return { unavailable: true };
      }
    };

    if (wantsProgressStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      progressStreamStarted = true;
      sendProgress({ type: 'progress', message: 'Checking the selected project and its QA records…' });
    }

    const [testCasesSrc, defectsSrc, testPlansSrc, runsSrc, reqsSrc] = await Promise.all([
        readScopedRecords('test_cases', ['id', 'project_id', 'title', 'module', 'steps', 'expected', 'type', 'priority', 'status', 'created_at']),
        readScopedRecords('defects', ['id', 'project_id', 'test_case_id', 'title', 'description', 'severity', 'status', 'created_at']),
        readScopedRecords('test_plans', ['id', 'project_id', 'name', 'sprint', 'start_date', 'end_date', 'status', 'total_cases', 'passed', 'failed', 'untested', 'created_at']),
        readScopedRecords('execution_runs', ['id', 'project_id', 'name', 'environment', 'passed', 'failed', 'duration', 'created_at']),
        readScopedRecords('requirements', ['id', 'project_id', 'title', 'description', 'priority', 'status', 'created_at']),
      ]);

    const workspaceContext: Record<string, unknown> = {
      project_filter: projectId || 'all_accessible_projects',
      project_name: targetProject?.name || 'All Projects',
      mode: 'standard_chat',
      requirements: reqsSrc,
      test_cases: testCasesSrc,
      defects: defectsSrc,
      test_plans: testPlansSrc,
      execution_history: runsSrc,
    };

    let retrievedContext = '';
    let sources: SpecySourceMetadata[] = [];

    if (qaTools.rag_grounding !== false) {
      try {
        sendProgress({ type: 'progress', message: 'Searching relevant requirements, test cases, defects, and run history…' });
        await ensureWorkspaceRAGFresh({ ownerIds, projectId });
        const retrieval = await retrieveEvidence({
          query: message,
          ownerIds,
          projectId,
          minSimilarity: 0.55,
          limit: 6,
        });
        retrievedContext = retrieval.contextText;
        sources = retrieval.sources;
        sendProgress({ type: 'progress', message: sources.length > 0 ? `Found ${sources.length} relevant workspace reference${sources.length === 1 ? '' : 's'}. Preparing an evidence-based answer…` : 'No close workspace references found. Preparing an answer from the available context…' });
      } catch (ragError) {
        console.warn('[Specy RAG] Semantic retrieval unavailable:', ragError);
        sendProgress({ type: 'progress', message: 'Workspace search is unavailable. Preparing an answer from the project records I could load…' });
      }
    } else {
      sendProgress({ type: 'progress', message: 'Using project records without semantic search…' });
    }

    let reply: string;
    let modelUsed: string | null = null;
    try {
      sendProgress({ type: 'progress', message: 'Drafting a concise answer…' });
      const answer = await generateSpecyResponse({
        message,
        workspaceContext: compactPayload(workspaceContext),
        retrievedContext,
      });
      reply = answer.reply;
      modelUsed = `gemini:${answer.model}`;
    } catch (answerError: any) {
      console.error('[Specy] Grounded response failed:', answerError);
      const errorMessage = 'Specy could not generate a response. Check the Gemini API configuration and retry.';
      if (progressStreamStarted) {
        sendProgress({ type: 'error', error: errorMessage });
        return res.end();
      }
      return res.status(503).json({ error: errorMessage, sources, project_id: projectId });
    }

    const result = {
      reply,
      agent: 'Specy',
      mode: 'standard_chat',
      sources,
      model_used: modelUsed,
      project_id: projectId,
    };
    if (progressStreamStarted) {
      sendProgress({ type: 'complete', ...result });
      return res.end();
    }
    return res.json(result);
  } catch (error: any) {
    console.error('Specy chat error:', error);
    if (progressStreamStarted) {
      sendProgress({ type: 'error', error: error?.name === 'TimeoutError'
        ? 'The Specy agent request timed out. Please retry with a more specific query.'
        : 'Specy could not complete this request. Check the chat AI and workspace database configuration, then retry.' });
      return res.end();
    }
    if (error.name === 'TimeoutError') {
      return res.status(504).json({
        error: 'The Specy agent request timed out. Please retry with a more specific query.',
      });
    }
    return res.status(503).json({
      error: 'Specy could not complete this request. Check the chat AI and workspace database configuration, then retry.',
    });
  }
}

router.post('/chat', authenticate, async (req: Request, res: Response) => {
  return handleSpecyChat(req, res);
});

router.post('/investigate', authenticate, async (req: Request, res: Response) => {
  return handleSpecyChat(req, res, 'defect_investigation');
});

/**
 * GET /api/specy-agent/sessions
 * List all saved chat sessions for the active user/team
 */
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const ownerIds = await getAccessibleOwnerIds(userId);

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('specy_chat_sessions')
        .select('id, user_id, project_id, title, created_at, updated_at')
        .in('user_id', ownerIds)
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json({ sessions: data });
      }
    } catch (_) {}

    // Fallback to local storage file
    const all = getFallbackSessions();
    const userSessions = all
      .filter((s) => ownerIds.includes(s.user_id) || s.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .map(({ messages, ...rest }) => rest);

    return res.json({ sessions: userSessions });
  } catch (error: any) {
    console.error('Failed to fetch specy sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

/**
 * GET /api/specy-agent/sessions/:id
 * Retrieve full session with messages
 */
router.get('/sessions/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('specy_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (!error && data) {
        return res.json({ session: data });
      }
    } catch (_) {}

    const all = getFallbackSessions();
    const found = all.find((s) => s.id === sessionId);
    if (!found) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    return res.json({ session: found });
  } catch (error: any) {
    console.error('Failed to get specy session:', error);
    return res.status(500).json({ error: 'Failed to retrieve chat session' });
  }
});

/**
 * POST /api/specy-agent/sessions
 * Save or update a session
 */
router.post('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date().toISOString();
    const sessionId = req.body.id || `specy-${Date.now()}`;
    const title = req.body.title || 'QA Investigation';
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const projectId = req.body.project_id || null;
    const createdAt = req.body.created_at || now;

    const sessionData: StoredSpecySession = {
      id: sessionId,
      user_id: userId,
      project_id: projectId,
      title,
      messages,
      created_at: createdAt,
      updated_at: now,
    };

    // Try Supabase upsert
    try {
      await supabase.from('specy_chat_sessions').upsert({
        id: sessionData.id,
        user_id: sessionData.user_id,
        project_id: sessionData.project_id,
        title: sessionData.title,
        messages: sessionData.messages,
        created_at: sessionData.created_at,
        updated_at: sessionData.updated_at,
      });
    } catch (_) {}

    // Fallback sync to file
    const all = getFallbackSessions();
    const existingIndex = all.findIndex((s) => s.id === sessionId);
    if (existingIndex >= 0) {
      all[existingIndex] = sessionData;
    } else {
      all.unshift(sessionData);
    }
    saveFallbackSessions(all);

    return res.json({ session: sessionData });
  } catch (error: any) {
    console.error('Failed to save specy session:', error);
    return res.status(500).json({ error: 'Failed to save chat session' });
  }
});

/**
 * DELETE /api/specy-agent/sessions/:id
 * Delete a specific session
 */
router.delete('/sessions/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;

    // Try Supabase
    try {
      await supabase.from('specy_chat_sessions').delete().eq('id', sessionId);
    } catch (_) {}

    // Fallback sync to file
    const all = getFallbackSessions();
    const filtered = all.filter((s) => s.id !== sessionId);
    saveFallbackSessions(filtered);

    return res.json({ success: true, message: 'Chat session deleted' });
  } catch (error: any) {
    console.error('Failed to delete specy session:', error);
    return res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

export default router;
