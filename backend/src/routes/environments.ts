import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'environments.json');

const getFallbackEnvs = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackEnvs = (envs: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(envs, null, 2));
  } catch (err) {
    console.error('Failed to save fallback envs:', err);
  }
};

// GET /api/environments
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);

  // Clean up any demo cards previously seeded into database
  await supabase
    .from('environments')
    .delete()
    .in('name', ["Production Cluster US-East", "Staging Sandbox EU", "Developer Integration Ring"]);

  const { data, error } = await supabase
    .from('environments')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /environments (Supabase):', error);
    const fallback = getFallbackEnvs();
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/environments
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

  const newEnv = {
    project_id: validProjectId,
    name: req.body.name || 'Core Staging Cluster',
    type: req.body.type || 'Staging',
    url: req.body.url || 'https://staging.speclane.com',
    status: req.body.status || 'Healthy',
    last_verified: req.body.last_verified || 'Just now',
    active_runners: req.body.active_runners || 1,
    success_rate: req.body.success_rate ?? 100,
    user_id: ownerId,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('environments')
    .insert(newEnv)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /environments (Supabase):', error);
    const envs = getFallbackEnvs();
    const created = { id: `env-${Date.now()}`, ...newEnv };
    saveFallbackEnvs([created, ...envs]);
    return res.status(201).json(created);
  }

  res.status(201).json(data);
});

// PATCH /api/environments/:id
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('environments')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const envs = getFallbackEnvs();
    const updated = envs.map((e: any) => e.id === id ? { ...e, ...req.body } : e);
    saveFallbackEnvs(updated);
    const target = updated.find((e: any) => e.id === id);
    return res.json(target || { id, ...req.body });
  }

  res.json(data);
});

// DELETE /api/environments/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('environments')
    .delete()
    .eq('id', id);

  if (error) {
    const envs = getFallbackEnvs();
    const updated = envs.filter((e: any) => e.id !== id);
    saveFallbackEnvs(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
