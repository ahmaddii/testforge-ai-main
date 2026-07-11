import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'execution_runs.json');

const getFallbackRuns = () => {
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

// GET /api/execution-runs
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('execution_runs')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /execution-runs (Supabase):', error);
    const fallback = getFallbackRuns();
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/execution-runs
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
    created_at: new Date().toISOString()
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
  const { error } = await supabase
    .from('execution_runs')
    .delete()
    .eq('id', id);

  if (error) {
    const runs = getFallbackRuns();
    const updated = runs.filter((r: any) => r.id !== id);
    saveFallbackRuns(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
