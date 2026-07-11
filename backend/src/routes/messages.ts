import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId } from '../lib/access';
import { assertFeatureAccess, isBillingLimitError, sendBillingError } from '../lib/billing';

const router = Router();

/**
 * GET /messages
 * Fetch team chat messages for the shared workspace
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      user_id,
      created_at
    `)
    .in('workspace_owner_id', ownerIds)
    .order('created_at', { ascending: true })
    .limit(100);
  
  if (error) return res.status(500).json({ error: error.message });

  const rows = data || [];
  
  // Enrich with user emails manually
  const userIds = Array.from(new Set(rows.map((r: any) => r.user_id)));
  const userEmailById: Record<string, string> = {};
  for (const uid of userIds) {
    try {
      const { data: userObj } = await (supabase.auth.admin as any).getUserById(uid);
      if (userObj?.user?.email) userEmailById[uid] = userObj.user.email;
    } catch {
      // ignore errors for missing users
    }
  }

  const enriched = rows.map((r: any) => ({
    ...r,
    profiles: { email: userEmailById[r.user_id] || 'Team Member' }
  }));

  res.json(enriched);
});

/**
 * POST /messages
 * Send a new chat message to the shared workspace
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const workspaceOwnerId = await getPrimaryOwnerId(req.user!.id);
    await assertFeatureAccess(
      workspaceOwnerId,
      'teamCollaboration',
      'Team chat is available on the Pro and Business plans.'
    );

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: req.user!.id,
        workspace_owner_id: workspaceOwnerId
      })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    if (isBillingLimitError(err)) return sendBillingError(res, err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
