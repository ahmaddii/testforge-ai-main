import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'releases.json');

const getFallbackReleases = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialReleases: any[] = [];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialReleases, null, 2));
      return initialReleases;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackReleases = (releases: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(releases, null, 2));
  } catch (err) {
    console.error('Failed to save fallback releases:', err);
  }
};

// GET /api/releases
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /releases (Supabase):', error);
    const fallback = getFallbackReleases();
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/releases
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

  const newRelease = {
    project_id: validProjectId,
    version: req.body.version || 'v1.0.0',
    title: req.body.title || 'Product Release',
    release_date: req.body.release_date || new Date().toISOString().split('T')[0],
    readiness_score: req.body.readiness_score ?? 85,
    status: req.body.status || 'Testing',
    runs_executed: req.body.runs_executed ?? 12,
    blocking_defects: req.body.blocking_defects ?? 0,
    coverage: req.body.coverage ?? 90,
    user_id: ownerId,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('releases')
    .insert(newRelease)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /releases (Supabase):', error);
    const releases = getFallbackReleases();
    const created = { id: `rel-${Date.now()}`, ...newRelease };
    saveFallbackReleases([created, ...releases]);
    return res.status(201).json(created);
  }

  res.status(201).json(data);
});

// PATCH /api/releases/:id
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('releases')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const releases = getFallbackReleases();
    const updated = releases.map((r: any) => r.id === id ? { ...r, ...req.body } : r);
    saveFallbackReleases(updated);
    const target = updated.find((r: any) => r.id === id);
    return res.json(target || { id, ...req.body });
  }

  res.json(data);
});

// DELETE /api/releases/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('releases')
    .delete()
    .eq('id', id);

  if (error) {
    const releases = getFallbackReleases();
    const updated = releases.filter((r: any) => r.id !== id);
    saveFallbackReleases(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
