import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'test_plans.json');

const getFallbackTestPlans = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialPlans: any[] = [];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialPlans, null, 2));
      return initialPlans;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackTestPlans = (plans: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(plans, null, 2));
  } catch (err) {
    console.error('Failed to save fallback test plans:', err);
  }
};

// GET /api/test-plans
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('test_plans')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /test-plans (Supabase):', error);
    const fallback = getFallbackTestPlans();
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/test-plans
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

  const newPlan = {
    project_id: validProjectId,
    name: req.body.name || 'Core QA Plan',
    sprint: req.body.sprint || 'Sprint 1',
    start_date: req.body.start_date || new Date().toISOString().split('T')[0],
    end_date: req.body.end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: req.body.status || 'In Progress',
    total_cases: req.body.total_cases ?? 24,
    passed: req.body.passed ?? 0,
    failed: req.body.failed ?? 0,
    untested: req.body.untested ?? 24,
    user_id: ownerId,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('test_plans')
    .insert(newPlan)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /test-plans (Supabase):', error);
    const plans = getFallbackTestPlans();
    const created = { id: `tp-${Date.now()}`, ...newPlan };
    saveFallbackTestPlans([created, ...plans]);
    return res.status(201).json(created);
  }

  res.status(201).json(data);
});

// DELETE /api/test-plans/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('test_plans')
    .delete()
    .eq('id', id);

  if (error) {
    const plans = getFallbackTestPlans();
    const updated = plans.filter((p: any) => p.id !== id);
    saveFallbackTestPlans(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
