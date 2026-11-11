import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';
import { getAccessibleOwnerIds, getProjectWithAccess, getPrimaryOwnerId } from '../lib/access';

const router = Router();

const requirementSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Draft', 'Approved', 'Implemented']).default('Draft'),
});

// Get all requirements accessible to the user
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Get requirements for a project
router.get('/:projectId', authenticate, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('requirements')
    .select('*')
    .eq('project_id', projectId)
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add a requirement
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const validated = requirementSchema.parse(req.body);
    let ownerId = await getPrimaryOwnerId(req.user!.id);
    if (validated.project_id) {
      const { project } = await getProjectWithAccess(validated.project_id, req.user!.id);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      ownerId = project.user_id;
    }

    // If no project_id was provided, auto-assign the user's first project
    // to satisfy the NOT NULL constraint on the requirements table.
    let finalProjectId = validated.project_id;
    if (!finalProjectId) {
      const ownerIds = await getAccessibleOwnerIds(req.user!.id);
      const { data: firstProject } = await supabase
        .from('projects')
        .select('id')
        .in('user_id', ownerIds)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstProject) {
        finalProjectId = firstProject.id;
      }
    }

    if (!finalProjectId) {
      return res.status(400).json({ error: 'Please create a project first before adding requirements.' });
    }

    const { data, error } = await supabase
      .from('requirements')
      .insert({
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        status: validated.status,
        project_id: finalProjectId,
        user_id: ownerId,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a requirement
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('requirements')
    .update(req.body)
    .eq('id', id)
    .in('user_id', ownerIds)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete a requirement
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { error } = await supabase
    .from('requirements')
    .delete()
    .eq('id', id)
    .in('user_id', ownerIds);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default router;
