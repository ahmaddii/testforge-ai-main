import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'reports.json');

const getFallbackReports = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialReports: any[] = [];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialReports, null, 2));
      return initialReports;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackReports = (reports: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(reports, null, 2));
  } catch (err) {
    console.error('Failed to save fallback reports:', err);
  }
};

// GET /api/reports
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .in('user_id', ownerIds)
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /reports (Supabase):', error);
    const fallback = getFallbackReports();
    return res.json(fallback);
  }

  res.json(data || []);
});

// GET /api/reports/project/:projectId
router.get('/project/:projectId', authenticate, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('project_id', projectId)
    .in('user_id', ownerIds)
    .order('generated_at', { ascending: false });

  if (error) {
    const fallback = getFallbackReports().filter((r: any) => r.project_id === projectId);
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/reports
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

  const newReport = {
    project_id: validProjectId,
    project_name: req.body.project_name || 'Project Test Report',
    requirement_name: req.body.requirement_name || 'Full Suite',
    coverage: req.body.coverage || Math.floor(Math.random() * 20) + 80,
    test_case_count: req.body.test_case_count || 12,
    user_id: ownerId,
    generated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(newReport)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /reports (Supabase):', error);
    const reports = getFallbackReports();
    const created = { id: `rep-${Date.now()}`, ...newReport };
    saveFallbackReports([created, ...reports]);
    return res.status(201).json(created);
  }

  res.status(201).json(data);
});

// DELETE /api/reports/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) {
    const reports = getFallbackReports();
    const updated = reports.filter((r: any) => r.id !== id);
    saveFallbackReports(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
