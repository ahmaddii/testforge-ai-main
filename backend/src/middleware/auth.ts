import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];


  if (process.env.MASTER_API_KEY && token === process.env.MASTER_API_KEY) {
    (req as any).isMaster = true;
    return next();
  }

  try {
    const { data: { user }, error } = await (supabase.auth as any).getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
