import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@speclane.com';
  const adminPass = process.env.SUPER_ADMIN_PASSWORD || 'speclane2026';

  if (email.toLowerCase() === adminEmail.toLowerCase() && password === adminPass) {
    return res.status(200).json({
      success: true,
      token: 'speclane_super_admin_secret_token_888',
      admin: { email: adminEmail, role: 'SuperAdmin' }
    });
  }

  return res.status(401).json({ error: 'Invalid Super Admin credentials' });
});

export const verifySuperAdmin = (req: Request, res: Response, next: any) => {
  const userEmail = (req.user?.email || '').toLowerCase();
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@speclane.com').toLowerCase();

  if (userEmail === adminEmail) {
    return next();
  }
  return res.status(403).json({ error: 'Super Admin access required' });
};

export default router;
