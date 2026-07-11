import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { GitHubService } from '../services/github';
import { getAccessibleOwnerIds, getProjectWithAccess, getPrimaryOwnerId } from '../lib/access';
import { assertFeatureAccess, assertProjectLimit, isBillingLimitError, sendBillingError } from '../lib/billing';

const router = Router();

/**
 * GET /projects
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/**
 * POST /projects
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, repo_url, description } = req.body;
    const workspaceOwnerId = await getPrimaryOwnerId(req.user!.id);
    await assertProjectLimit(workspaceOwnerId);

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, repo_url, description, user_id: workspaceOwnerId })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    if (isBillingLimitError(err)) return sendBillingError(res, err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * PATCH /projects/:id
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, repo_url, description, slack_webhook_url } = req.body;
    const { project } = await getProjectWithAccess(req.params.id, req.user!.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (slack_webhook_url) {
      // Integrations are now free, no feature access check required.
    }

    const { data, error } = await supabase
      .from('projects')
      .update({ name, repo_url, description, slack_webhook_url })
      .eq('id', req.params.id)
      .eq('user_id', project.user_id)
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    if (isBillingLimitError(err)) return sendBillingError(res, err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * DELETE /projects/:id
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { project } = await getProjectWithAccess(req.params.id, req.user!.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', project.user_id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Project deleted' });
});

/**
 * GET /projects/:id/files
 * Fetches the file tree from GitHub for a specific project
 */
router.get('/:id/files', authenticate, async (req: Request, res: Response) => {
  try {
    const { id: projectId } = req.params;

    // 1. Fetch Project Info
    const { project, error: pError } = await getProjectWithAccess(projectId, req.user!.id);

    if (pError || !project) return res.status(404).json({ error: 'Project not found' });

    // 2. Parse URL and Fetch Tree
    const repoInfo = GitHubService.parseUrl(project.repo_url);
    if (!repoInfo) return res.status(400).json({ error: 'Invalid repository URL' });

    const files = await GitHubService.getFileTree(repoInfo.owner, repoInfo.repo);
    
    // Sort files to put directories first
    const sortedFiles = files.sort((a, b) => {
      if (a.type === b.type) return a.path.localeCompare(b.path);
      return a.type === 'dir' ? -1 : 1;
    });

    res.json(sortedFiles);
  } catch (err) {
    console.error('File Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch repository files' });
  }
});

export default router;
