import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getPrimaryOwnerId, getProjectWithAccess } from '../lib/access';
import { getUserMetadata } from './notifications';
import fs from 'fs';
import path from 'path';

const router = Router();

const fallbackDir = path.resolve(__dirname, '../../data');
const fallbackFile = path.join(fallbackDir, 'environments.json');

const getFallbackEnvs = () => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    if (!fs.existsSync(fallbackFile)) {
      fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
  } catch (err) {
    return [];
  }
};

const saveFallbackEnvs = (envs: any[]) => {
  try {
    if (!fs.existsSync(fallbackDir)) fs.mkdirSync(fallbackDir, { recursive: true });
    fs.writeFileSync(fallbackFile, JSON.stringify(envs, null, 2));
  } catch (err) {
    console.error('Failed to save fallback envs:', err);
  }
};

// GET /api/environments
router.get('/', authenticate, async (req: Request, res: Response) => {
  const ownerIds = await getAccessibleOwnerIds(req.user!.id);

  // Clean up any demo cards previously seeded into database
  await supabase
    .from('environments')
    .delete()
    .in('name', ["Production Cluster US-East", "Staging Sandbox EU", "Developer Integration Ring"]);

  const { data, error } = await supabase
    .from('environments')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('SQL Error in GET /environments (Supabase):', error);
    const fallback = getFallbackEnvs();
    return res.json(fallback);
  }

  res.json(data || []);
});

// POST /api/environments
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

  const newEnv = {
    project_id: validProjectId,
    name: req.body.name || 'Core Staging Cluster',
    type: req.body.type || 'Staging',
    url: req.body.url || 'https://staging.speclane.com',
    status: req.body.status || 'Healthy',
    last_verified: req.body.last_verified || 'Just now',
    active_runners: req.body.active_runners || 1,
    success_rate: req.body.success_rate ?? 100,
    user_id: ownerId,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('environments')
    .insert(newEnv)
    .select()
    .single();

  let createdEnv = data;
  if (error) {
    console.error('SQL Error in POST /environments (Supabase):', error);
    const envs = getFallbackEnvs();
    createdEnv = { id: `env-${Date.now()}`, ...newEnv };
    saveFallbackEnvs([createdEnv, ...envs]);
  }

  // Dispatch notification and activity log with actor metadata
  try {
    const userMeta = await getUserMetadata(req.user!.id);
    const notifMsg = JSON.stringify({
      text: `${userMeta.name} registered new cluster environment '${newEnv.name}' for automated runner testing.`,
      actor_name: userMeta.name,
      actor_avatar: userMeta.avatar,
      actor_email: req.user?.email || '',
      actor_id: req.user?.id || ownerId,
      action: 'Cluster Registration'
    });

    await supabase.from('notifications').insert({
      project_id: validProjectId,
      user_id: ownerId,
      title: 'New Cluster Registered',
      message: notifMsg,
      type: 'success',
      read: false
    });

    await supabase.from('activity_logs').insert({
      user_id: ownerId,
      action: `Registered cluster environment '${newEnv.name}' (${newEnv.type}) at ${newEnv.url}`,
      category: 'Environment',
      ip_address: req.ip || '127.0.0.1',
      created_at: new Date().toISOString()
    });
  } catch (notifErr) {
    console.error('Failed to notify cluster creation:', notifErr);
  }

  res.status(201).json(createdEnv);
});

// POST /api/environments/:id/check - REAL HTTP network probe & cluster node health verification
router.post('/:id/check', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;

  // 1. Fetch environment
  let targetEnv: any = null;
  const { data: envData } = await supabase
    .from('environments')
    .select('*')
    .eq('id', id)
    .single();

  if (envData) {
    targetEnv = envData;
  } else {
    const fallbackEnvs = getFallbackEnvs();
    targetEnv = fallbackEnvs.find((e: any) => e.id === id);
  }

  if (!targetEnv) {
    return res.status(404).json({ error: 'Environment not found' });
  }

  // 2. Execute REAL HTTP network probe
  let rawUrl = (targetEnv.url || '').trim();
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl;
  }

  const startTime = performance.now();
  let probeStatus: 'pass' | 'fail' = 'pass';
  let httpLabel = '';
  let last_verified = '';
  let latencyMs = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const probeRes = await fetch(rawUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'TestForge-HealthProbe/2.0',
        'Accept': '*/*'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    latencyMs = Math.round(performance.now() - startTime);

    if (probeRes.status < 500) {
      probeStatus = 'pass';
      httpLabel = `HTTP ${probeRes.status} • ${latencyMs}ms`;
    } else {
      probeStatus = 'fail';
      httpLabel = `HTTP ${probeRes.status} Server Error • ${latencyMs}ms`;
    }
  } catch (err: any) {
    latencyMs = Math.round(performance.now() - startTime);
    probeStatus = 'fail';

    if (err.name === 'AbortError') {
      httpLabel = `Timeout (>${Math.round(latencyMs / 1000 * 10) / 10}s)`;
    } else if (err.code === 'ENOTFOUND' || err.message?.includes('ENOTFOUND')) {
      httpLabel = `DNS Not Found (unreachable host)`;
    } else if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
      httpLabel = `Connection Refused`;
    } else if (err.code === 'CERT_HAS_EXPIRED' || err.message?.includes('certificate')) {
      httpLabel = `SSL Certificate Error`;
    } else {
      httpLabel = `Network Error: ${err.code || err.message?.slice(0, 40) || 'unknown'}`;
    }
  }

  // --- Rolling probe history (last 10 probes) ---
  const historyFile = path.join(fallbackDir, `probe_history_${id}.json`);
  let history: { result: 'pass' | 'fail'; ts: number }[] = [];
  try {
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    }
  } catch { history = []; }

  history.push({ result: probeStatus, ts: Date.now() });
  if (history.length > 10) history = history.slice(-10);

  try {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  } catch { }

  const passCount = history.filter(h => h.result === 'pass').length;
  const success_rate = Math.round((passCount / history.length) * 100);
  const status = success_rate >= 80 ? 'Healthy' : 'Degraded';
  const active_runners = targetEnv.active_runners || 1;
  last_verified = `${httpLabel} • ${history.length} probe${history.length > 1 ? 's' : ''} sampled`;

  const updatePayload = {
    status,
    success_rate,
    last_verified,
    active_runners
  };

  // 3. Persist check result
  const { data: updatedData } = await supabase
    .from('environments')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  const fallbackEnvs = getFallbackEnvs();
  const updatedFallback = fallbackEnvs.map((e: any) => e.id === id ? { ...e, ...updatePayload } : e);
  saveFallbackEnvs(updatedFallback);

  // 4. Log to activity logs
  try {
    const ownerId = await getPrimaryOwnerId(req.user!.id);
    await supabase.from('activity_logs').insert({
      user_id: ownerId,
      action: `Health probe on '${targetEnv.name}': ${status} — ${httpLabel} (${success_rate}% over ${history.length} probes)`,
      category: 'Environment',
      ip_address: req.ip || '127.0.0.1',
      created_at: new Date().toISOString()
    });
  } catch {}

  const result = updatedData || { ...targetEnv, ...updatePayload };
  res.json(result);
});

// PATCH /api/environments/:id
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('environments')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const envs = getFallbackEnvs();
    const updated = envs.map((e: any) => e.id === id ? { ...e, ...req.body } : e);
    saveFallbackEnvs(updated);
    const target = updated.find((e: any) => e.id === id);
    return res.json(target || { id, ...req.body });
  }

  res.json(data);
});

// DELETE /api/environments/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('environments')
    .delete()
    .eq('id', id);

  if (error) {
    const envs = getFallbackEnvs();
    const updated = envs.filter((e: any) => e.id !== id);
    saveFallbackEnvs(updated);
    return res.json({ success: true });
  }

  res.json({ success: true });
});

export default router;
