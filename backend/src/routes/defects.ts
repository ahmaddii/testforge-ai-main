import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getProjectWithAccess, getPrimaryOwnerId } from '../lib/access';
import { SlackService } from '../services/slack';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'defects.json');

const getFallbackDefects = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialDefects: any[] = [];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialDefects, null, 2));
      return initialDefects;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackDefects = (defects: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(defects, null, 2));
  } catch (err) {
    console.error('Failed to save fallback defects:', err);
  }
};

/**
 * GET /defects
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('defects')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('SQL Error in GET /defects (Supabase):', error);
    const fallback = getFallbackDefects();
    return res.json(fallback);
  }
  res.json(data || []);
});

/**
 * POST /defects
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { test_case_id, title, description, severity, status } = req.body;
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

  const newDefect = { 
    project_id: validProjectId, 
    test_case_id: test_case_id || null, 
    title: title || 'New Defect', 
    description: description || '', 
    severity: severity || 'Major', 
    status: status || 'Open',
    user_id: ownerId,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('defects')
    .insert(newDefect)
    .select()
    .single();
  
  if (error) {
    console.error('SQL Error in POST /defects (Supabase):', error);
    const defects = getFallbackDefects();
    const created = { id: `defect-${Date.now()}`, ...newDefect };
    saveFallbackDefects([created, ...defects]);
    return res.status(201).json(created);
  }
  
  res.status(201).json(data);

  // Background notification
  if (validProjectId) {
    getProjectWithAccess(validProjectId, req.user!.id).then(({ project }) => {
      if (project?.slack_webhook_url) {
        SlackService.notifyDefectReported(
          project.slack_webhook_url, 
          project.name, 
          title, 
          severity
        ).catch(err => console.error('Slack Notify Error:', err));
      }
    });
  }
});

/**
 * PATCH /defects/:id
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const { title, description, severity, status } = req.body;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('defects')
    .update({ title, description, severity, status })
    .eq('id', req.params.id)
    .in('user_id', ownerIds)
    .select()
    .single();
  
  if (error) {
    const defects = getFallbackDefects();
    const updated = defects.map((d: any) => d.id === req.params.id ? { ...d, ...req.body } : d);
    saveFallbackDefects(updated);
    const target = updated.find((d: any) => d.id === req.params.id);
    return res.json(target || { id: req.params.id, ...req.body });
  }
  res.json(data);
});

/**
 * DELETE /defects/:id
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { error } = await supabase
    .from('defects')
    .delete()
    .eq('id', req.params.id)
    .in('user_id', ownerIds);
  
  if (error) {
    const defects = getFallbackDefects();
    const updated = defects.filter((d: any) => d.id !== req.params.id);
    saveFallbackDefects(updated);
    return res.json({ message: 'Defect deleted' });
  }
  res.json({ message: 'Defect deleted' });
});

export default router;
