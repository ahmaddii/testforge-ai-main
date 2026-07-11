import { Router, Request, Response } from 'express';
import express from 'express';
import { authenticate } from '../middleware/auth';
import { GitHubAgent } from '../services/githubAgent';
import { getProjectWithAccess } from '../lib/access';
import { supabase } from '../lib/supabase';
import axios from 'axios';
import crypto from 'crypto';

const router = Router();

/**
 * POST /github-agent/run
 * Manually trigger the GitHub Agent on a specific PR
 */
router.post('/run', authenticate, async (req: Request, res: Response) => {
  try {
    const { projectId, owner, repo, pullNumber } = req.body;
    
    // Verify project access
    const { project } = await getProjectWithAccess(projectId, req.user!.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (!process.env.GITHUB_TOKEN || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GitHub Token or Gemini Key is missing in backend env.' });
    }

    const agent = new GitHubAgent(
      process.env.GITHUB_TOKEN,
      process.env.GEMINI_API_KEY,
      process.cwd() 
    );

    const metrics = await agent.processPullRequest(owner, repo, Number(pullNumber));

    // Save to DB
    await supabase.from('github_agent_runs').insert({
      project_id: projectId,
      pull_request_number: pullNumber,
      repo_name: `${owner}/${repo}`,
      tests_passed: metrics.passedCount,
      tests_fixed: metrics.autoFixedCount,
      bugs_found: metrics.realBugsCount,
      status: 'Completed'
    });

    res.json({ success: true, message: 'Agent completed successfully' });
  } catch (error: any) {
    console.error('GitHub Agent Route Error:', error);
    
    // Log failure
    try {
      if (req.body.projectId && req.body.owner && req.body.repo && req.body.pullNumber) {
        await supabase.from('github_agent_runs').insert({
          project_id: req.body.projectId,
          pull_request_number: req.body.pullNumber,
          repo_name: `${req.body.owner}/${req.body.repo}`,
          status: 'Failed'
        });
      }
    } catch (e) {}

    res.status(500).json({ error: error.message || 'Failed to run GitHub Agent' });
  }
});

/**
 * GET /github-agent/runs
 * Fetch all automated PR test runs across all user's projects
 */
router.get('/runs', authenticate, async (req: Request, res: Response) => {
  try {
    const { data: projects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', req.user!.id);
      
    if (!projects || projects.length === 0) return res.json([]);
    const projectIds = projects.map(p => p.project_id);

    const { data, error } = await supabase
      .from('github_agent_runs')
      .select('*, projects(name)')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch runs' });
  }
});

/**
 * GET /github-agent/runs/:projectId
 * Fetch historical automated PR test runs for specific project
 */
router.get('/runs/:projectId', authenticate, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { project } = await getProjectWithAccess(projectId, req.user!.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { data, error } = await supabase
      .from('github_agent_runs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch runs' });
  }
});

// ==========================================
// 1. GitHub OAuth Flow
// ==========================================

router.get('/oauth/connect', authenticate, (req: Request, res: Response) => {
  const { projectId } = req.query;
  const state = Buffer.from(JSON.stringify({ projectId, userId: req.user!.id })).toString('base64');
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(backendUrl + '/api/github-agent/oauth/callback')}&scope=repo,admin:repo_hook&state=${state}`;
  
  res.json({ url: githubAuthUrl });
});

router.get('/oauth/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  try {
    const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
    const { projectId } = decodedState;

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, { headers: { accept: 'application/json' } });

    const accessToken = tokenResponse.data.access_token;

    await supabase.from('projects').update({ github_access_token: accessToken }).eq('id', projectId);

    res.redirect(`${process.env.FRONTEND_URL}/app/integrations?github_connected=true`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/app/integrations?error=github_auth_failed`);
  }
});

// ==========================================
// 2. Automated Webhook Setup
// ==========================================

router.post('/setup-webhook', authenticate, async (req: Request, res: Response) => {
  const { projectId, owner, repo } = req.body;
  const { project } = await getProjectWithAccess(projectId, req.user!.id);
  
  if (!project?.github_access_token) return res.status(400).json({ error: 'GitHub not connected' });

  try {
    const secret = crypto.randomBytes(20).toString('hex');
    await supabase.from('projects').update({ github_webhook_secret: secret, repo_url: `https://github.com/${owner}/${repo}` }).eq('id', projectId);

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    await axios.post(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
      name: 'web',
      active: true,
      events: ['pull_request'],
      config: {
        url: `${backendUrl}/api/github-agent/webhook`,
        content_type: 'json',
        secret: secret
      }
    }, {
      headers: { Authorization: `token ${project.github_access_token}` }
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data?.message || 'Failed to setup webhook' });
  }
});

// ==========================================
// 3. Automated Webhook Listener
// ==========================================

router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  // Parse payload depending on content type
  const payload = req.body instanceof Buffer ? JSON.parse(req.body.toString()) : req.body;
  
  if (payload.action === 'opened' || payload.action === 'synchronize') {
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const pullNumber = payload.pull_request.number;

    const { data: project } = await supabase.from('projects').select('id, github_access_token').ilike('repo_url', `%${owner}/${repo}%`).single();
    
    if (project) {
      res.json({ received: true }); 

      try {
        const agent = new GitHubAgent(project.github_access_token, process.env.GEMINI_API_KEY!, process.cwd());
        
        const metrics = await agent.processPullRequest(owner, repo, pullNumber);
        
        await supabase.from('github_agent_runs').insert({
          project_id: project.id,
          pull_request_number: pullNumber,
          repo_name: `${owner}/${repo}`,
          tests_passed: metrics.passedCount,
          tests_fixed: metrics.autoFixedCount,
          bugs_found: metrics.realBugsCount,
          status: 'Completed'
        });

      } catch (e) {
        console.error('Agent failed in background', e);
        await supabase.from('github_agent_runs').insert({
          project_id: project.id,
          pull_request_number: pullNumber,
          repo_name: `${owner}/${repo}`,
          status: 'Failed'
        });
      }
      return;
    }
  }
  
  res.json({ ignored: true });
});

export default router;
