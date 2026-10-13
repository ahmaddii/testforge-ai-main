import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'notifications.json');

const getFallbackNotifs = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialNotifs = [
        {
          id: `notif-1-${Date.now()}`,
          user_id: 'default',
          title: "AI Analysis Complete",
          message: "Gemini 2.5 successfully synthesized 12 automated test scenarios for Sprint 8 Release.",
          type: "success",
          read: false,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: `notif-2-${Date.now()}`,
          user_id: 'default',
          title: "Critical Defect Logged",
          message: "BUG-402: Payment gateway webhook timeout during concurrent load testing.",
          type: "defect",
          read: false,
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
        {
          id: `notif-3-${Date.now()}`,
          user_id: 'default',
          title: "Staging Pod Alert",
          message: "High memory utilization detected on APAC Staging Pod cluster.",
          type: "alert",
          read: true,
          created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        },
        {
          id: `notif-4-${Date.now()}`,
          user_id: 'default',
          title: "Sprint Signoff Required",
          message: "QA signoff deadline for Release v2.8.0 is scheduled for tomorrow 17:00 UTC.",
          type: "sprint",
          read: true,
          created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        }
      ];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialNotifs, null, 2));
      return initialNotifs;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackNotifs = (notifs: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(notifs, null, 2));
  } catch (err) {
    console.error('Failed to save fallback notifs:', err);
  }
};

const userMetaCache: Record<string, { name: string; avatar: string; email: string }> = {};

export const getUserMetadata = async (userId: string) => {
  if (!userId || userId === 'default') return { name: 'Alex QA Manager', avatar: '', email: 'fyp.tester@testforge.com' };
  if (userMetaCache[userId]) return userMetaCache[userId];

  try {
    const { data: userObj } = await (supabase.auth.admin as any).getUserById(userId);
    if (userObj?.user) {
      const meta = userObj.user.user_metadata || {};
      const info = {
        name: meta.full_name || meta.name || userObj.user.email?.split('@')[0] || 'Team Member',
        avatar: meta.avatar_url || meta.avatar || '',
        email: userObj.user.email || ''
      };
      userMetaCache[userId] = info;
      return info;
    }
  } catch (err) {
    // Ignore error
  }

  const fallback = { name: 'Team Member', avatar: '', email: '' };
  userMetaCache[userId] = fallback;
  return fallback;
};

export const unpackNotification = (notif: any, fallbackUser?: { name: string; avatar: string; email: string }) => {
  if (!notif) return notif;
  let text = notif.message || '';
  let actorName = fallbackUser?.name || '';
  let actorAvatar = fallbackUser?.avatar || '';
  let actorEmail = fallbackUser?.email || '';
  let actorId = notif.user_id || '';
  let action = '';

  if (typeof notif.message === 'string' && notif.message.trim().startsWith('{') && notif.message.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(notif.message);
      if (parsed && typeof parsed === 'object') {
        text = parsed.text || text;
        actorName = parsed.actor_name || actorName;
        actorAvatar = parsed.actor_avatar || actorAvatar;
        actorEmail = parsed.actor_email || actorEmail;
        actorId = parsed.actor_id || actorId;
        action = parsed.action || action;
      }
    } catch {
      // not JSON
    }
  }

  return {
    ...notif,
    message: text,
    actor_name: actorName || 'Team Member',
    actor_avatar: actorAvatar || '',
    actor_email: actorEmail || '',
    actor_id: actorId,
    action: action || notif.title || 'Workspace Update'
  };
};

// GET /api/notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /notifications (Supabase):', error);
    const fallback = getFallbackNotifs();
    const enriched = await Promise.all(fallback.map(async (n: any) => {
      const meta = await getUserMetadata(n.user_id);
      return unpackNotification(n, meta);
    }));
    return res.json(enriched);
  }

  const rows = data || [];
  const enriched = await Promise.all(rows.map(async (n: any) => {
    const meta = await getUserMetadata(n.user_id);
    return unpackNotification(n, meta);
  }));

  res.json(enriched);
});

// POST /api/notifications
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

  const userMeta = await getUserMetadata(req.user!.id);
  const actorName = req.body.actor_name || userMeta.name;
  const actorAvatar = req.body.actor_avatar || userMeta.avatar;
  const actorEmail = req.body.actor_email || userMeta.email || req.user?.email || '';
  const rawMessage = req.body.message || req.body.description || '';
  const action = req.body.action || req.body.title || 'Workspace Update';

  // Package message with actor metadata safely
  const messagePayload = JSON.stringify({
    text: rawMessage,
    actor_name: actorName,
    actor_avatar: actorAvatar,
    actor_email: actorEmail,
    actor_id: req.user!.id,
    action
  });

  const newNotif = {
    title: req.body.title || 'New Alert',
    message: messagePayload,
    type: req.body.type || 'info',
    project_id: validProjectId,
    user_id: ownerId,
    read: false,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(newNotif)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /notifications (Supabase):', error);
    const notifs = getFallbackNotifs();
    const created = { id: `notif-${Date.now()}`, ...newNotif };
    saveFallbackNotifs([created, ...notifs]);
    return res.status(201).json(unpackNotification(created, { name: actorName, avatar: actorAvatar, email: actorEmail }));
  }

  res.status(201).json(unpackNotification(data, { name: actorName, avatar: actorAvatar, email: actorEmail }));
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const notifs = getFallbackNotifs();
    const updated = notifs.map((n: any) => n.id === id ? { ...n, read: true } : n);
    saveFallbackNotifs(updated);
    const target = updated.find((n: any) => n.id === id);
    const meta = await getUserMetadata(target?.user_id || req.user!.id);
    return res.json(unpackNotification(target || { id, read: true }, meta));
  }

  const meta = await getUserMetadata(data?.user_id || req.user!.id);
  res.json(unpackNotification(data, meta));
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .in('user_id', ownerIds)
    .eq('read', false);

  if (error) {
    const notifs = getFallbackNotifs();
    const updated = notifs.map((n: any) => ({ ...n, read: true }));
    saveFallbackNotifs(updated);
    return res.json({ success: true, count: updated.length });
  }

  res.json({ success: true });
});

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    const notifs = getFallbackNotifs();
    const updated = notifs.filter((n: any) => n.id !== id);
    saveFallbackNotifs(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
