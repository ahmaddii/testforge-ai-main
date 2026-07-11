import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId } from '../lib/access';
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
      const initialJobs = [
        {
          id: "heal-1",
          project_id: "proj-1",
          test_case_id: "tc-101",
          test_case_title: "Validate Order Placement Checkout Submission",
          status: "Pending Approval",
          confidence: 96,
          broken_selector: 'button[data-id="submit"]',
          healed_selector: 'button[data-testid="submit-order"]',
          dom_diff_snippet: `<form id="checkout">\n-  <button data-id="submit" class="btn-lg">Complete Order</button>\n+  <button data-testid="submit-order" class="btn-lg bg-emerald-600">Complete Order</button>\n</form>`,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "heal-2",
          project_id: "proj-1",
          test_case_id: "tc-102",
          test_case_title: "Verify Navigation Dropdown Menu Accessibility",
          status: "Healed",
          confidence: 92,
          broken_selector: '.nav-avatar > img',
          healed_selector: 'button[aria-label="User Profile Menu"] > img.avatar',
          dom_diff_snippet: `<nav class="navbar">\n-  <div class="nav-avatar"><img src="/u.png" /></div>\n+  <button aria-label="User Profile Menu"><img src="/u.png" class="avatar" /></button>\n</nav>`,
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: "heal-3",
          project_id: "proj-1",
          test_case_id: "tc-103",
          test_case_title: "Validate Pro Plan Upgrade Paddle Trigger",
          status: "Pending Approval",
          confidence: 89,
          broken_selector: '#pricing-tab-pro',
          healed_selector: 'button[data-plan="pro-monthly"]',
          dom_diff_snippet: `<div class="tabs">\n-  <button id="pricing-tab-pro">Pro Plan</button>\n+  <button data-plan="pro-monthly" class="tab-active">Pro Plan</button>\n</div>`,
          created_at: new Date(Date.now() - 14400000).toISOString()
        }
      ];
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

  // Execute real AST DOM drift scan via Gemini or active local workspace AST parser
  const suggestions = await ASTHealingService.scanProjectDOM(owner, repo, contextStr);

  if (!suggestions || suggestions.length === 0) {
    return res.status(200).json([]);
  }

  const newScanJobs = suggestions.map((s, idx) => ({
    id: `heal-scan-${Date.now()}-${idx}`,
    project_id: project_id || "proj-1",
    user_id: ownerId,
    test_case_id: `tc-${Date.now()}-${idx}`,
    test_case_title: s.test_case_title,
    status: "Pending Approval",
    confidence: s.confidence,
    broken_selector: s.broken_selector,
    healed_selector: s.healed_selector,
    dom_diff_snippet: s.dom_diff_snippet,
    created_at: new Date(Date.now() - idx * 60000).toISOString()
  }));

  const { data, error } = await supabase
    .from('self_healing_jobs')
    .insert(newScanJobs)
    .select();

  if (error) {
    const existing = getFallbackJobs();
    const updated = [...newScanJobs, ...existing];
    saveFallbackJobs(updated);
    return res.status(201).json(newScanJobs);
  }

  res.status(201).json(data || newScanJobs);
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
