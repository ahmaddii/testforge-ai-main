import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

// Get current user role and permissions
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userEmail = (req.user?.email || '').toLowerCase();
    const isSuperAdmin = userEmail === 'admin@speclane.com' || userEmail === (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase();

    const { data: teamInfo } = await supabase
      .from('team_members')
      .select('owner_id,role')
      .eq('member_id', userId)
      .eq('status', 'active')
      .limit(1)
      .single();

    const isInvitedMember = teamInfo?.owner_id && teamInfo.owner_id !== userId;
    const role = isInvitedMember ? teamInfo.role : 'Owner';
    const isAdmin = role === 'Owner' || role === 'Manager';

    res.json({
      id: userId,
      email: req.user?.email,
      role,
      isAdmin,
      isSuperAdmin
    });
  } catch (err: any) {
    const userEmail = (req.user?.email || '').toLowerCase();
    const isSuperAdmin = userEmail === 'admin@speclane.com' || userEmail === (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase();

    res.json({
      id: req.user!.id,
      email: req.user?.email,
      role: 'Owner',
      isAdmin: true,
      isSuperAdmin
    });
  }
});

// Ensure profiles bucket exists and is public
router.post('/init-storage', authenticate, async (req: Request, res: Response) => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const profileBucket = buckets.find(b => b.name === 'profiles');

    if (!profileBucket) {
      const { error: createError } = await supabase.storage.createBucket('profiles', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB
      });
      if (createError) throw createError;
    }

    res.json({ success: true, message: 'Storage initialized' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to initialize storage' });
  }
});

export default router;
