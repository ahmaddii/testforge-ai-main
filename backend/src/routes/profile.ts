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

    // Fetch user metadata for name and avatar
    let fullName = '';
    let avatarUrl = '';
    try {
      const { data: userObj } = await (supabase.auth.admin as any).getUserById(userId);
      if (userObj?.user?.user_metadata) {
        const meta = userObj.user.user_metadata;
        fullName = meta.full_name || meta.name || '';
        avatarUrl = meta.avatar_url || meta.avatar || '';
      }
    } catch {}

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
    const workspaceOwnerId = teamInfo?.owner_id || userId;

    res.json({
      id: userId,
      email: req.user?.email,
      name: fullName || req.user?.email?.split('@')[0] || 'User',
      avatar: avatarUrl,
      avatar_url: avatarUrl,
      role,
      isAdmin,
      isSuperAdmin,
      workspaceOwnerId
    });
  } catch (err: any) {
    const userEmail = (req.user?.email || '').toLowerCase();
    const isSuperAdmin = userEmail === 'admin@speclane.com' || userEmail === (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase();

    res.json({
      id: req.user!.id,
      email: req.user?.email,
      name: req.user?.email?.split('@')[0] || 'User',
      avatar: '',
      avatar_url: '',
      role: 'Owner',
      isAdmin: true,
      isSuperAdmin,
      workspaceOwnerId: req.user!.id
    });
  }
});

// Upload and update user avatar profile picture
router.post('/avatar', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    let publicUrl = '';
    if (typeof image === 'string' && image.startsWith('http')) {
      publicUrl = image;
    } else if (typeof image === 'string' && image.includes('base64,')) {
      const parts = image.split('base64,');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const ext = mimeType.split('/')[1] || 'png';
      const buffer = Buffer.from(parts[1], 'base64');
      const fileName = `avatars/${userId}-${Date.now()}.${ext}`;

      // Upload using service role
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      publicUrl = urlData.publicUrl;
    } else {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    // Update Supabase Auth user metadata
    await (supabase.auth.admin as any).updateUserById(userId, {
      user_metadata: {
        avatar_url: publicUrl,
        avatar: publicUrl
      }
    });

    res.json({ success: true, avatar: publicUrl, avatar_url: publicUrl });
  } catch (err: any) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to upload avatar' });
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
