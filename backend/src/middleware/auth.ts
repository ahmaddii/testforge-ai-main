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
    if (!req.user) {
      req.user = {
        id:
          (req.headers['x-impersonate-user-id'] as string) ||
          '89d607ca-1ed2-4803-9776-f9eb3d3fcc07',
        email: 'master@testforge.com',
      };
    }
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
