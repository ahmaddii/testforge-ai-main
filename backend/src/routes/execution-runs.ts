import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import {
  PlaywrightExecutionService,
  TestCaseExecutionInput,
  SuiteExecutionSummary,
} from '../services/playwright-runner';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'execution_runs.json');
const evidenceDir = path.join(fallbackDir, 'evidence');

const getFallbackRuns = (): any[] => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialRuns: any[] = [];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialRuns, null, 2));
      return initialRuns;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackRuns = (runs: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(runs, null, 2));
  } catch (err) {
    console.error('Failed to save fallback execution runs:', err);
  }
};

export interface EnvironmentResolutionResult {
  environmentName: string;
  environmentUrl: string;
  isProduction: boolean;
  isReadOnly: boolean;
  environmentId?: string;
  resolutionSource: 'explicit_message' | 'explicit_payload' | 'project_environment' | 'workspace_environment';
}

/**
 * Extract first HTTP/HTTPS URL from arbitrary message text
 */
export function extractUrlFromText(text?: string): string | null {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/https?:\/\/[^\s"'<>\)]+/i);
  if (!match) return null;
  let urlStr = match[0].trim();
  urlStr = urlStr.replace(/[.,;!?]+$/, '');
  try {
    const parsed = new URL(urlStr);
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Resolve target environment for a project with strict project-affinity,
 * explicit URL precedence, production read-only safeguarding, and NO silent fallback.
 */
export async function resolveProjectEnvironment(params: {
  projectId: string;
  projectName: string;
  projectRepoUrl?: string;
  userId: string;
  ownerIds: string[];
  message?: string;
  environmentId?: string;
  environmentUrl?: string;
}): Promise<EnvironmentResolutionResult> {
  const {
    projectId,
    projectName,
    projectRepoUrl,
    userId,
    ownerIds,
    message,
    environmentId,
    environmentUrl,
  } = params;

  // 1. Fetch all accessible environments for the user
  const { data: envsFromDb } = await supabase
    .from('environments')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  let allEnvs: any[] = envsFromDb || [];
  if (allEnvs.length === 0) {
    try {
      const localEnvFile = path.join(fallbackDir, 'environments.json');
      if (fs.existsSync(localEnvFile)) {
        allEnvs = JSON.parse(fs.readFileSync(localEnvFile, 'utf-8'));
      }
    } catch (_) {}
  }

  // 2. Check for explicit URL in payload or message
  const explicitUrl = environmentUrl || extractUrlFromText(message);
  if (explicitUrl) {
    let normalizedUrl = explicitUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    const parsed = new URL(normalizedUrl);
    const origin = parsed.origin.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    // Check if this URL matches any registered environment
    const matchingEnv = allEnvs.find((e: any) => {
      try {
        const eOrigin = new URL(e.url.startsWith('http') ? e.url : `https://${e.url}`).origin.toLowerCase();
        return eOrigin === origin;
      } catch {
        return false;
      }
    });

    if (matchingEnv) {
      const isProd = matchingEnv.type === 'Production';
      return {
        environmentName: matchingEnv.name,
        environmentUrl: normalizedUrl,
        isProduction: isProd,
        isReadOnly: isProd,
        environmentId: matchingEnv.id,
        resolutionSource: environmentUrl ? 'explicit_payload' : 'explicit_message',
      };
    }

    // Verify whether the URL is compatible with the project
    const cleanProjectName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const matchesProjectName = cleanProjectName.length > 2 && hostname.includes(cleanProjectName);
    const matchesRepo = projectRepoUrl && projectRepoUrl.toLowerCase().includes(hostname.split('.')[0]);
    const isVercelOrPreview = hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app') || hostname.endsWith('.pages.dev');

    if (isLocalhost || matchesProjectName || matchesRepo || isVercelOrPreview) {
      const isProd = !hostname.includes('staging') && !hostname.includes('dev') && !hostname.includes('test') && !isLocalhost;
      return {
        environmentName: `Target (${hostname})`,
        environmentUrl: normalizedUrl,
        isProduction: isProd,
        isReadOnly: isProd,
        resolutionSource: environmentUrl ? 'explicit_payload' : 'explicit_message',
      };
    }

    // Unrelated domain: throw clear validation error to avoid hitting wrong hosts
    throw new Error(
      `The requested URL (${normalizedUrl}) does not match project "${projectName}" or any registered workspace environment. Please register it in the Environments tab or confirm the target URL.`
    );
  }

  // 3. If explicit environmentId was provided
  if (environmentId) {
    const specificEnv = allEnvs.find((e: any) => e.id === environmentId);
    if (specificEnv) {
      if (specificEnv.project_id && specificEnv.project_id !== projectId) {
        throw new Error(
          `Environment "${specificEnv.name}" belongs to a different project and cannot be used for "${projectName}".`
        );
      }
      const isProd = specificEnv.type === 'Production';
      let envUrl = specificEnv.url.trim();
      if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) envUrl = `https://${envUrl}`;
      return {
        environmentName: specificEnv.name,
        environmentUrl: envUrl,
        isProduction: isProd,
        isReadOnly: isProd,
        environmentId: specificEnv.id,
        resolutionSource: 'project_environment',
      };
    }
  }

  // 4. Resolve from environment records for this project
  // Filter out environments that explicitly belong to a DIFFERENT project
  const eligibleEnvs = allEnvs.filter((e: any) => !e.project_id || e.project_id === projectId);

  // 4a. Check environments explicitly linked to this project
  const projectSpecificEnvs = eligibleEnvs.filter((e: any) => e.project_id === projectId);
  if (projectSpecificEnvs.length > 0) {
    const preferred =
      projectSpecificEnvs.find((e: any) => e.type === 'Staging') ||
      projectSpecificEnvs.find((e: any) => e.type === 'Development') ||
      projectSpecificEnvs[0];

    const isProd = preferred.type === 'Production';
    let envUrl = preferred.url.trim();
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) envUrl = `https://${envUrl}`;
    return {
      environmentName: preferred.name,
      environmentUrl: envUrl,
      isProduction: isProd,
      isReadOnly: isProd,
      environmentId: preferred.id,
      resolutionSource: 'project_environment',
    };
  }

  // 4b. Check workspace-level environments (project_id is null) that match this project by name or URL
  const cleanProj = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameMatchedEnvs = eligibleEnvs.filter((e: any) => {
    const eName = (e.name || '').toLowerCase();
    const eUrl = (e.url || '').toLowerCase();
    return (
      (cleanProj.length > 2 && (eName.includes(cleanProj) || eUrl.includes(cleanProj))) ||
      eName.includes(projectName.toLowerCase())
    );
  });

  if (nameMatchedEnvs.length > 0) {
    const preferred =
      nameMatchedEnvs.find((e: any) => e.type === 'Staging') ||
      nameMatchedEnvs.find((e: any) => e.type === 'Development') ||
      nameMatchedEnvs[0];

    const isProd = preferred.type === 'Production';
    let envUrl = preferred.url.trim();
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) envUrl = `https://${envUrl}`;
    return {
      environmentName: preferred.name,
      environmentUrl: envUrl,
      isProduction: isProd,
      isReadOnly: isProd,
      environmentId: preferred.id,
      resolutionSource: 'workspace_environment',
    };
  }

  // 4c. If the user only has 1 environment in their workspace and no project conflict
  if (eligibleEnvs.length === 1) {
    const singleEnv = eligibleEnvs[0];
    const isProd = singleEnv.type === 'Production';
    let envUrl = singleEnv.url.trim();
    if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) envUrl = `https://${envUrl}`;
    return {
      environmentName: singleEnv.name,
      environmentUrl: envUrl,
      isProduction: isProd,
      isReadOnly: isProd,
      environmentId: singleEnv.id,
      resolutionSource: 'workspace_environment',
    };
  }

  // 4d. If multiple unassigned environments exist without a clear project match, do NOT guess!
  if (eligibleEnvs.length > 1) {
    const envChoices = eligibleEnvs.map((e: any) => `"${e.name}" (${e.type}: ${e.url})`).join(', ');
    throw new Error(
      `Multiple environments are registered in your workspace (${envChoices}), but none are linked to project "${projectName}". Please link an environment or specify the target URL in chat (e.g. "Run tests against https://vehloom.vercel.app/").`
    );
  }

  // 5. No environment configured at all
  // NEVER fall back to 'https://staging.speclane.com'!
  throw new Error(
    `No target environment URL is configured for project "${projectName}". Please register a staging or production URL in the Environments tab, or specify the target URL in your message (e.g. "Run pending test cases against https://vehloom.vercel.app").`
  );
}

/**
 * Core test execution helper reusable by both the REST endpoint and Specy Chat
 */
export async function executeProjectTests(params: {
  projectId: string;
  userId: string;
  environmentId?: string;
  environmentUrl?: string;
  message?: string;
  testCaseIds?: string[];
  filterKeyword?: string;
  forceAll?: boolean;
  requirePersistence?: boolean;
  runName?: string;
  triggeredBy?: string;
  conversationId?: string;
  onProgress?: (event: any) => void;
}): Promise<SuiteExecutionSummary> {
  const {
    projectId,
    userId,
    environmentId,
    environmentUrl,
    message,
    testCaseIds,
    filterKeyword,
    forceAll = false,
    requirePersistence = false,
    runName,
    triggeredBy = 'Specy Chat',
    conversationId,
    onProgress,
  } = params;

  // 1. Verify project access
  const { project, error: accessErr } = await getProjectWithAccess(projectId, userId);
  if (accessErr || !project) {
    throw new Error('Project not found or access denied.');
  }

  const ownerIds = await getAccessibleOwnerIds(userId);
  const primaryOwnerId = project.user_id || (await getPrimaryOwnerId(userId));

  // 2. Fetch target test cases
  let testCasesQuery = supabase
    .from('test_cases')
    .select('*')
    .eq('project_id', projectId)
    .in('user_id', ownerIds);

  if (testCaseIds && testCaseIds.length > 0) {
    testCasesQuery = testCasesQuery.in('id', testCaseIds);
  } else if (!forceAll && !filterKeyword) {
    // Default to pending test cases
    testCasesQuery = testCasesQuery.eq('status', 'Pending');
  }

  let { data: testCases, error: tcErr } = await testCasesQuery;

  // Fallback to local test cases file if Supabase fails or returned nothing
  if (tcErr || !testCases || testCases.length === 0) {
    try {
      const localTcFile = path.join(fallbackDir, 'test_cases.json');
      if (fs.existsSync(localTcFile)) {
        const allLocal = JSON.parse(fs.readFileSync(localTcFile, 'utf-8'));
        testCases = allLocal.filter((tc: any) => {
          if (tc.project_id !== projectId) return false;
          if (testCaseIds && testCaseIds.length > 0) return testCaseIds.includes(tc.id);
          if (forceAll || filterKeyword) return true;
          return tc.status === 'Pending' || !tc.status;
        });
      }
    } catch (_) {}
  }

  // If a filterKeyword was requested (e.g. "login"), filter by title or module
  if (filterKeyword && testCases && testCases.length > 0) {
    const kw = filterKeyword.toLowerCase();
    const matched = testCases.filter((tc: any) =>
      (tc.title && tc.title.toLowerCase().includes(kw)) ||
      (tc.module && tc.module.toLowerCase().includes(kw))
    );
    if (matched.length === 0) {
      throw new Error(`No test cases found matching keyword "${filterKeyword}" for project "${project.name}".`);
    }
    testCases = matched;
  }

  if (!testCases || testCases.length === 0) {
    // Check if there are ANY test cases for this project to provide informative response
    const { data: allCases } = await supabase
      .from('test_cases')
      .select('id, status')
      .eq('project_id', projectId);

    if (allCases && allCases.length > 0) {
      throw new Error(
        `All ${allCases.length} test cases for "${project.name}" have already been executed (none are currently in Pending status). You can ask me to re-run all test cases or run a specific subset (e.g. "Run login tests").`
      );
    }
    throw new Error(`No test cases found for project "${project.name}".`);
  }

  // 3. Resolve Environment (honoring explicit URLs, project configuration, and production safety)
  const resolvedEnv = await resolveProjectEnvironment({
    projectId,
    projectName: project.name,
    projectRepoUrl: project.repo_url,
    userId,
    ownerIds,
    message,
    environmentId,
    environmentUrl,
  });

  const envName = resolvedEnv.environmentName;
  const envUrl = resolvedEnv.environmentUrl;

  // 4. Run Playwright Suite
  const summary = await PlaywrightExecutionService.runSuite({
    projectId,
    userId: primaryOwnerId,
    environmentName: envName,
    environmentUrl: envUrl,
    isReadOnly: resolvedEnv.isReadOnly,
    testCases: testCases as TestCaseExecutionInput[],
    runName: runName || `${project.name} ${resolvedEnv.isProduction ? 'Production Smoke' : 'Staging'} Execution`,
    triggeredBy,
    conversationId,
    onProgress,
  });

  // Attach metadata into results._meta
  const resultsPayload: Record<string, any> = {
    _meta: {
      blocked: summary.blocked,
      triggered_by: summary.triggered_by,
      conversation_id: summary.conversation_id || null,
      status: summary.status,
      environment_url: summary.environment_url,
      total_cases: summary.total_cases,
      is_production: resolvedEnv.isProduction,
      is_readonly: resolvedEnv.isReadOnly,
      resolution_source: resolvedEnv.resolutionSource,
    },
    ...summary.results,
  };

  const newRunRecord = {
    id: summary.run_id,
    project_id: projectId,
    name: summary.name,
    environment: summary.environment,
    passed: summary.passed,
    failed: summary.failed,
    duration: summary.duration,
    results: resultsPayload,
    user_id: primaryOwnerId,
    created_at: summary.created_at,
  };

  // 5. Persist to Supabase execution_runs
  const { error: insertErr } = await supabase
    .from('execution_runs')
    .insert(newRunRecord);

  if (insertErr) {
    console.error('[ExecutionRuns] Supabase insert error, saving to fallback:', insertErr.message);
    summary.persistence_error = insertErr.message;
    const runs = getFallbackRuns();
    saveFallbackRuns([newRunRecord, ...runs]);
    if (requirePersistence) {
      throw new Error(`Database persistence failed: ${insertErr.message}`);
    }
  }

  // 6. Update test cases status in database
  for (const tc of testCases) {
    const outcome = summary.results[tc.id];
    if (outcome) {
      const nextStatus = outcome.status === 'Passed' ? 'Passed' : 'Failed';
      try {
        await supabase
          .from('test_cases')
          .update({ status: nextStatus })
          .eq('id', tc.id);
      } catch (_) {}
    }
  }

  // 7. Log Activity
  try {
    await supabase.from('activity_logs').insert({
      user_id: primaryOwnerId,
      project_id: projectId,
      action: 'Executed Playwright Tests',
      category: 'Execution',
      details: `Executed ${summary.total_cases} test cases against ${envName}: ${summary.passed} Passed, ${summary.failed} Failed, ${summary.blocked} Blocked (${summary.duration}).`,
      created_at: new Date().toISOString(),
    });
  } catch (_) {}

  return summary;
}

// GET /api/execution-runs
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { projectId } = req.query;
  const filterProjectId =
    typeof projectId === 'string' && projectId !== 'all' ? projectId : null;

  let query = supabase
    .from('execution_runs')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (projectId && typeof projectId === 'string' && projectId !== 'all') {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  const scopedFallback = getFallbackRuns().filter((run: any) =>
    ownerIds.includes(run.user_id) &&
    (!filterProjectId || run.project_id === filterProjectId),
  );

  if (error) {
    console.error('SQL Error in GET /execution-runs (Supabase):', error);
    return res.json(scopedFallback);
  }

  const runsById = new Map<string, any>();
  for (const run of [...(data || []), ...scopedFallback]) {
    if (run?.id) runsById.set(run.id, run);
  }
  res.json(
    [...runsById.values()].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
    ),
  );
});

// GET /api/execution-runs/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);

  const { data, error } = await supabase
    .from('execution_runs')
    .select('*')
    .eq('id', id)
    .in('user_id', ownerIds)
    .single();

  if (error || !data) {
    const runs = getFallbackRuns();
    const found = runs.find((r: any) => r.id === id && ownerIds.includes(r.user_id));
    if (found) return res.json(found);
    return res.status(404).json({ error: 'Execution run not found.' });
  }

  res.json(data);
});

// POST /api/execution-runs/execute
// Execute Playwright test suite with optional SSE streaming
router.post('/execute', authenticate, async (req: Request, res: Response) => {
  const {
    project_id,
    environment_id,
    environment_url,
    message,
    test_case_ids,
    force_all = false,
    run_name,
    triggered_by = 'Executed Tests Dashboard',
    conversation_id,
  } = req.body;

  if (!project_id) {
    return res.status(400).json({ error: 'project_id is required.' });
  }

  const isStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';

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
        projectId: project_id,
        userId: (req as any).user!.id,
        environmentId: environment_id,
        environmentUrl: environment_url,
        message,
        testCaseIds: test_case_ids,
        forceAll: force_all,
        runName: run_name,
        triggeredBy: triggered_by,
        conversationId: conversation_id,
        onProgress: (event) => {
          sendEvent(event);
        },
      });

      sendEvent({ type: 'complete', summary });
      res.end();
    } catch (err: any) {
      sendEvent({ type: 'error', error: err.message || 'Execution failed' });
      res.end();
    }
  } else {
    try {
      const summary = await executeProjectTests({
        projectId: project_id,
        userId: (req as any).user!.id,
        environmentId: environment_id,
        environmentUrl: environment_url,
        message,
        testCaseIds: test_case_ids,
        forceAll: force_all,
        runName: run_name,
        triggeredBy: triggered_by,
        conversationId: conversation_id,
      });

      return res.status(201).json(summary);
    } catch (err: any) {
      console.error('Execution run error:', err);
      return res.status(500).json({ error: err.message || 'Execution failed' });
    }
  }
});

// GET /api/execution-runs/evidence/:runId/:filename
// Serve locally stored Playwright evidence securely (PNG screenshots and ZIP traces).
router.get('/evidence/:runId/:filename', (req: Request, res: Response) => {
  const { runId, filename } = req.params;

  // Sanitize path against directory traversal
  const sanitizedRunId = path.basename(runId);
  const sanitizedFilename = path.basename(filename);
  const targetFile = path.join(evidenceDir, sanitizedRunId, sanitizedFilename);

  if (!fs.existsSync(targetFile)) {
    return res.status(404).send('Evidence file not found.');
  }

  res.setHeader('Content-Type', sanitizedFilename.endsWith('.zip') ? 'application/zip' : 'image/png');
  res.sendFile(targetFile);
});

// POST /api/execution-runs (Manual or simulated run creation)
router.post('/', authenticate, async (req: Request, res: Response) => {
  let ownerId = await getPrimaryOwnerId(req.user!.id);
  let validProjectId = req.body.project_id;
  if (validProjectId) {
    const { project } = await getProjectWithAccess(validProjectId, req.user!.id);
    if (project) {
      ownerId = project.user_id;
    } else {
      validProjectId = null;
    }
  }

  const newRun = {
    project_id: validProjectId,
    name: req.body.name || `Execution Run #${Math.floor(Math.random() * 8999 + 1000)}`,
    environment: req.body.environment || 'Staging Cluster',
    passed: req.body.passed ?? 0,
    failed: req.body.failed ?? 0,
    duration: req.body.duration || '1m 24s',
    results: req.body.results || {},
    user_id: ownerId,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('execution_runs')
    .insert(newRun)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /execution-runs (Supabase):', error);
    const runs = getFallbackRuns();
    const created = { id: `run-${Date.now()}`, ...newRun };
    saveFallbackRuns([created, ...runs]);
    return res.status(201).json(created);
  }

  res.status(201).json(data);
});

// DELETE /api/execution-runs/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { error } = await supabase
    .from('execution_runs')
    .delete()
    .eq('id', id)
    .in('user_id', ownerIds);

  const runs = getFallbackRuns();
  const updated = runs.filter(
    (run: any) => run.id !== id || !ownerIds.includes(run.user_id),
  );
  if (updated.length !== runs.length) saveFallbackRuns(updated);

  if (error) {
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
