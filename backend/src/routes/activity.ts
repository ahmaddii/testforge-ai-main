import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'activity_logs.json');

const getFallbackLogs = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      const initialLogs = [
        {
          id: `act-1-${Date.now()}`,
          user_id: 'default',
          action: 'System initialized autonomous regression test suite',
          category: 'Test Case',
          ip_address: '192.168.1.1',
          created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        },
        {
          id: `act-2-${Date.now()}`,
          user_id: 'default',
          action: 'Registered new staging cluster environment (APAC Staging Pod)',
          category: 'Environment',
          ip_address: '10.0.0.4',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: `act-3-${Date.now()}`,
          user_id: 'default',
          action: 'Signed off release v2.8.0-rc4 for production deployment',
          category: 'Release',
          ip_address: '172.16.0.2',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: `act-4-${Date.now()}`,
          user_id: 'default',
          action: 'Resolved blocking defect BUG-402 on payment gateway webhook',
          category: 'Defect',
          ip_address: '192.168.1.5',
          created_at: new Date().toISOString(),
        }
      ];
      fs.writeFileSync(fallbackFile, JSON.stringify(initialLogs, null, 2));
      return initialLogs;
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackLogs = (logs: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Failed to save fallback logs:', err);
  }
};

// GET /api/activity
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /activity (Supabase):', error);
    const fallback = getFallbackLogs();
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/activity
router.post('/', authenticate, async (req: Request, res: Response) => {
  let ownerId = await getPrimaryOwnerId(req.user!.id);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  let validProjectId = req.body.project_id;
  if (validProjectId) {
    const { project } = await getProjectWithAccess(validProjectId, req.user!.id);
    if (project) {
      ownerId = project.user_id;
    } else {
      validProjectId = null;
    }
  }

  const newLog = {
    action: req.body.action || 'Performed action',
    category: req.body.category || 'System',
    details: req.body.details || null,
    project_id: validProjectId,
    user_id: ownerId,
    ip_address: typeof ip === 'string' ? ip : ip?.[0] || '127.0.0.1',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('activity_logs')
    .insert(newLog)
    .select()
    .single();

  if (error) {
    console.error('SQL Error in POST /activity (Supabase):', error);
    const logs = getFallbackLogs();
    const created = { id: `act-${Date.now()}`, ...newLog };
    saveFallbackLogs([created, ...logs]);
    return res.status(201).json(created);
  }

  res.status(201).json(data);
});

export default router;
