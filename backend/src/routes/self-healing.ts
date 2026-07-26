import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId } from '../lib/access';
import { PlaywrightHealingService } from '../services/playwright-healing';
import { ASTHealingService } from '../services/ast-healing';
import { GitHubService } from '../services/github';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'self-healing.json');

const getFallbackJobs = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
        const initialJobs: any[] = [];
        fs.writeFileSync(fallbackFile, JSON.stringify(initialJobs, null, 2));
        return initialJobs;
      }
      return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackJobs = (jobs: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(jobs, null, 2));
  } catch (err) {
    console.error('Failed to save fallback jobs:', err);
  }
};

/**
 * GET /self-healing
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('self_healing_jobs')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });
  
  if (error) {
    const fallback = getFallbackJobs();
    return res.json(fallback);
  }
  res.json(data || []);
});

/**
 * POST /self-healing/scan
 * Trigger autonomous production healing scan across real AST trees
 */
router.post('/scan', authenticate, async (req: Request, res: Response) => {
  const ownerId = await getPrimaryOwnerId(req.user!.id);
  const { project_id } = req.body;

  let owner = "malikahmadrasheed";
  let repo = "testforge-ai-main";
  let contextStr = "";

  if (project_id) {
    const { data: pData } = await supabase.from('projects').select('*').eq('id', project_id).single();
    if (pData?.repo_url) {
      const parsed = GitHubService.parseUrl(pData.repo_url);
      if (parsed) {
        owner = parsed.owner;
        repo = parsed.repo;
        contextStr = await GitHubService.getProjectContext(owner, repo).catch(() => "");
      }
    }
  }

  // Autonomous scan is deprecated in favor of real CI/CD Playwright Webhooks
  return res.status(200).json([]);

});

/**
 * POST /self-healing/webhook
 * Public endpoint to simulate a CI/CD Webhook for failed tests.
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const { projectId } = req.query;
  const project_id = typeof projectId === 'string' ? projectId : undefined;
  
  const { 
    branch, commitSha, workflowName, actor, 
    testTitle, errorMessage, failedSelector, htmlSnapshot, screenshotUrl, traceUrl 
  } = req.body;

  let ownerId = null;

  if (project_id) {
    const { data: pData } = await supabase.from('projects').select('*').eq('id', project_id).single();
    if (pData) {
      ownerId = pData.user_id;
    }
  }

  const failureInfo = {
    testTitle: testTitle || "Unknown Test",
    errorMessage: errorMessage || "Unknown error occurred",
    failedSelector: failedSelector || "Unknown",
    htmlSnapshot: htmlSnapshot || "<html><body><!-- No HTML Snapshot Available --></body></html>",
    screenshotUrl,
    traceUrl
  };

  const suggestion = await PlaywrightHealingService.analyzeFailure(failureInfo);
  const suggestions = suggestion ? [suggestion] : [];

  if (suggestions.length === 0) {
    return res.status(200).json({ status: "No drift detected." });
  }

  const newScanJobs = suggestions.map((s, idx) => ({
    id: `webhook-heal-${Date.now()}-${idx}`,
    project_id: project_id || "proj-1",
    user_id: ownerId || "demo-user",
    test_case_id: `tc-webhook-${Date.now()}-${idx}`,
    test_case_title: s.test_case_title,
    status: "Pending Approval",
    confidence: s.confidence,
    broken_selector: s.broken_selector,
    healed_selector: s.healed_selector,
    dom_diff_snippet: s.dom_diff_snippet,
    error_message: s.error_message,
    screenshot_url: s.screenshot_url,
    trace_url: s.trace_url,
    branch: branch || "main",
    commit_sha: commitSha || "a1b2c3d",
    workflow_name: workflowName || "CI Pipeline",
    actor: actor || "github-actions",
    created_at: new Date(Date.now() - idx * 60000).toISOString()
  }));

  console.log(`[Webhook] Preparing to insert jobs for project_id: ${project_id}, ownerId: ${ownerId}`);
  console.log(`[Webhook] newScanJobs before insertion:`, JSON.stringify(newScanJobs, null, 2));

  const { data, error } = await supabase
    .from('self_healing_jobs')
    .insert(newScanJobs)
    .select();

  if (error) {
    console.error(`[Webhook] Supabase insert failed:`, JSON.stringify(error, null, 2));
    const existing = getFallbackJobs();
    const updated = [...newScanJobs, ...existing];
    saveFallbackJobs(updated);
  } else {
    console.log(`[Webhook] Supabase insert succeeded. Inserted data:`, JSON.stringify(data, null, 2));
  }

  res.status(201).json({ status: "Webhook processed, healing jobs created.", jobs: data || newScanJobs });
});

/**
 * PATCH /self-healing/:id/apply
 */
router.patch('/:id/apply', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);

  const { data, error } = await supabase
    .from('self_healing_jobs')
    .update({ status: "Healed" })
    .eq('id', id)
    .in('user_id', ownerIds)
    .select()
    .single();

  if (error) {
    const jobs = getFallbackJobs();
    const updated = jobs.map((j: any) => j.id === id ? { ...j, status: "Healed" } : j);
    saveFallbackJobs(updated);
    const target = updated.find((j: any) => j.id === id);
    return res.json(target || { id, status: "Healed" });
  }

  res.json(data);
});

/**
 * PATCH /self-healing/:id/reject
 */
router.patch('/:id/reject', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);

  const { data, error } = await supabase
    .from('self_healing_jobs')
    .update({ status: "Failed" })
    .eq('id', id)
    .in('user_id', ownerIds)
    .select()
    .single();

  if (error) {
    const jobs = getFallbackJobs();
    const updated = jobs.map((j: any) => j.id === id ? { ...j, status: "Failed" } : j);
    saveFallbackJobs(updated);
    const target = updated.find((j: any) => j.id === id);
    return res.json(target || { id, status: "Failed" });
  }

  res.json(data);
});

export default router;
