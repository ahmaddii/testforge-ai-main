import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getProjectWithAccess, getPrimaryOwnerId } from '../lib/access';
import { normalizeTestType, normalizeTestPriority } from './generate';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'test_cases.json');

const getFallbackTestCases = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initial: any[] = [];
      fs.writeFileSync(fallbackFile, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackTestCases = (cases: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(cases, null, 2));
  } catch (err) {
    console.error('Failed to save fallback test cases:', err);
  }
};

// Get all test cases accessible to the user
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /test-cases (Supabase):', error);
    const fallback = getFallbackTestCases();
    return res.json(fallback);
  }
  res.json(data || []);
});

// Get test cases for a project
router.get('/:projectId', authenticate, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('project_id', projectId)
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    const fallback = getFallbackTestCases();
    const filtered = fallback.filter((t: any) => t.project_id === projectId);
    return res.json(filtered);
  }
  res.json(data);
});

// Update a test case (e.g. status)
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('test_cases')
    .update(req.body)
    .eq('id', id)
    .in('user_id', ownerIds)
    .select()
    .single();

  if (error) {
    const fallback = getFallbackTestCases();
    const updated = fallback.map((t: any) => t.id === id ? { ...t, ...req.body } : t);
    saveFallbackTestCases(updated);
    const target = updated.find((t: any) => t.id === id);
    return res.json(target || { id, ...req.body });
  }
  res.json(data);
});

// Delete a test case
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { error } = await supabase
    .from('test_cases')
    .delete()
    .eq('id', id)
    .in('user_id', ownerIds);

  if (error) {
    const fallback = getFallbackTestCases();
    const updated = fallback.filter((t: any) => t.id !== id);
    saveFallbackTestCases(updated);
    return res.status(204).send();
  }
  res.status(204).send();
});

// Create a test case
router.post('/', authenticate, async (req: Request, res: Response) => {
  let ownerId = await getPrimaryOwnerId(req.user!.id);
  let validProjectId = req.body?.project_id;
  if (validProjectId) {
    const { project } = await getProjectWithAccess(validProjectId, req.user!.id);
    if (project) {
      ownerId = project.user_id;
    } else {
      validProjectId = null;
    }
  }

  const newCase = {
    ...req.body,
    id: req.body.id || `tc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    project_id: validProjectId,
    user_id: ownerId,
    type: normalizeTestType(req.body?.type, req.body?.title, req.body?.expected),
    priority: normalizeTestPriority(req.body?.priority),
    status: (req.body?.status === 'Passed' || req.body?.status === 'Failed') ? req.body.status : 'Pending',
    created_at: req.body?.created_at || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('test_cases')
    .insert(newCase)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /test-cases (Supabase):', error);
    const fallback = getFallbackTestCases();
    saveFallbackTestCases([newCase, ...fallback]);
    return res.status(201).json(newCase);
  }
  res.status(201).json(data);
});

export default router;
