import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['Member', 'Manager']).default('Member'),
  project_id: z.string().uuid().optional().nullable(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const email = req.user?.email || '';

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .or(`owner_id.eq.${userId},member_id.eq.${userId},email.eq.${email}`)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  const rows = data || [];

  // Enrich with owner email (best-effort) so member can see who invited them.
  const ownerIds = Array.from(new Set(rows.map((r: any) => r.owner_id).filter(Boolean)));
  const ownerEmailById: Record<string, string> = {};
  for (const ownerId of ownerIds) {
    try {
      const { data: ownerUser } = await (supabase.auth.admin as any).getUserById(ownerId);
      if (ownerUser?.user?.email) ownerEmailById[ownerId] = ownerUser.user.email;
    } catch {
      // ignore
    }
  }

  // Enrich with project name if project_id exists
  const projectIds = Array.from(new Set(rows.map((r: any) => r.project_id).filter(Boolean)));
  const projectNameById: Record<string, string> = {};
  if (projectIds.length > 0) {
    const { data: projectRows } = await supabase.from('projects').select('id, name').in('id', projectIds);
    for (const p of projectRows || []) {
      projectNameById[p.id] = p.name;
    }
  }

  const enriched = rows.map((r: any) => ({
    ...r,
    owner_email: ownerEmailById[r.owner_id] || null,
    project_name: r.project_id ? (projectNameById[r.project_id] || 'Specific Project') : 'All Projects'
  }));

  // Also include a synthetic "Owner" entry for members, so they can see who owns the workspace.
  const syntheticOwners: any[] = [];
  for (const ownerId of ownerIds) {
    const ownerEmail = ownerEmailById[ownerId] || null;
    if (!ownerEmail) continue;

    const hasOwnerRow = enriched.some((r: any) => r.owner_id === ownerId && r.email === ownerEmail);
    if (!hasOwnerRow) {
      syntheticOwners.push({
        id: `owner-${ownerId}`,
        owner_id: ownerId,
        member_id: ownerId,
        email: ownerEmail,
        role: 'Owner',
        status: 'active',
        invited_by: ownerId,
        accepted_at: null,
        created_at: null,
        owner_email: ownerEmail,
        project_name: 'All Projects',
        synthetic: true,
      });
    }
  }

  res.json([...syntheticOwners, ...enriched]);
});

router.post('/invite', authenticate, async (req: Request, res: Response) => {
  try {
    const { email, role, project_id } = inviteSchema.parse(req.body);
    const ownerId = req.user!.id;
    const frontendUrl =
      (process.env.FRONTEND_URL || process.env.SITE_URL || 'http://localhost:8080').replace(/\/+$/, '');

    if ((req.user?.email || '').toLowerCase() === email.toLowerCase()) {
      return res.status(400).json({ error: 'You cannot invite yourself.' });
    }

    const insertPayload: any = {
      owner_id: ownerId,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      invited_by: ownerId,
    };
    if (project_id) {
      insertPayload.project_id = project_id;
    }

    let { data, error } = await supabase
      .from('team_members')
      .insert(insertPayload)
      .select()
      .single();

    if (error && error.message.includes('project_id')) {
      delete insertPayload.project_id;
      const retry = await supabase.from('team_members').insert(insertPayload).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return res.status(500).json({ error: error.message });

    // Invitation email through Supabase Auth.
    let emailSent = false;
    let emailError: string | null = null;
    try {
      await (supabase.auth.admin as any).inviteUserByEmail(email, {
        data: { invited_workspace_owner: ownerId },
        redirectTo: `${frontendUrl}/auth/callback?next=/set-password`,
      });
      emailSent = true;
    } catch (e: any) {
      emailError = e?.message || 'Failed to send invite email';
    }

    res.status(201).json({ ...data, email_sent: emailSent, email_error: emailError });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    res.status(500).json({ error: 'Failed to invite team member' });
  }
});

router.post('/:inviteId/accept', authenticate, async (req: Request, res: Response) => {
  const { inviteId } = req.params;
  const userId = req.user!.id;
  const userEmail = (req.user?.email || '').toLowerCase();

  const { data: invite, error: inviteErr } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', inviteId)
    .single();

  if (inviteErr || !invite) return res.status(404).json({ error: 'Invite not found' });
  if ((invite.email || '').toLowerCase() !== userEmail) return res.status(403).json({ error: 'Invite email mismatch' });

  const { data, error } = await supabase
    .from('team_members')
    .update({ member_id: userId, status: 'active', accepted_at: new Date().toISOString() })
    .eq('id', inviteId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /team/:id - Update member role or assigned project
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { role, project_id } = req.body;

    const { data: member, error: fetchErr } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !member) return res.status(404).json({ error: 'Team member not found' });

    if (member.owner_id !== userId && member.invited_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this team member' });
    }

    const updatePayload: any = {};
    if (role && (role === 'Member' || role === 'Manager')) {
      updatePayload.role = role;
    }
    if (project_id !== undefined) {
      updatePayload.project_id = project_id || null;
    }

    let { data, error } = await supabase
      .from('team_members')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error && error.message.includes('project_id')) {
      delete updatePayload.project_id;
      const retry = await supabase.from('team_members').update(updatePayload).eq('id', id).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update team member' });
  }
});

// DELETE /team/:id - Revoke invitation or remove member from workspace
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: member, error: fetchErr } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !member) return res.status(404).json({ error: 'Team member not found' });

    // Ensure only the workspace owner or inviter can remove
    if (member.owner_id !== userId && member.invited_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to remove this member' });
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: 'Team member removed from workspace' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove team member' });
  }
});

export default router;
