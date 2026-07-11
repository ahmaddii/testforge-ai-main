import { Router, Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { supabase } from '../lib/supabase';
import { getBillingSummary } from '../lib/billing';
import {
  getConfiguredPriceId,
  getPlanIdFromPrice,
  PLAN_DEFINITIONS,
  PlanId,
  serializePlans,
} from '../lib/plans';
import { getPrimaryOwnerId } from '../lib/access';

const router = Router();

const checkoutSchema = z.object({
  plan: z.enum(['starter', 'pro', 'business']),
});

const paddleApiBase = () =>
  process.env.PADDLE_ENV === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';

const requirePaddleApiKey = () => {
  if (!process.env.PADDLE_API_KEY) {
    throw new Error('PADDLE_API_KEY is not configured.');
  }

  return process.env.PADDLE_API_KEY;
};

const paddleRequest = async <T>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> => {
  const res = await fetch(`${paddleApiBase()}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${requirePaddleApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.error?.detail ||
      json?.error?.message ||
      json?.errors?.[0]?.detail ||
      `Paddle API request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json as T;
};

const findOwnerIdForCustomer = async (customerId?: string | null) => {
  if (!customerId) return null;

  const { data } = await supabase
    .from('billing_subscriptions')
    .select('owner_id')
    .eq('paddle_customer_id', customerId)
    .maybeSingle();

  return data?.owner_id || null;
};

const firstSubscriptionPrice = (subscription: any) => subscription?.items?.[0]?.price;

const upsertBillingSubscription = async (ownerId: string, subscription: any) => {
  const price = firstSubscriptionPrice(subscription);
  const priceId = price?.id || null;
  const productId = price?.product_id || null;
  const plan =
    getPlanIdFromPrice(priceId) ||
    (subscription?.custom_data?.plan as PlanId | undefined) ||
    'free';
  const scheduledChange = subscription?.scheduled_change;
  const currentPeriod = subscription?.current_billing_period;

  const { error } = await supabase.from('billing_subscriptions').upsert(
    {
      owner_id: ownerId,
      paddle_customer_id: subscription?.customer_id || null,
      paddle_subscription_id: subscription?.id || null,
      paddle_price_id: priceId,
      paddle_product_id: productId,
      plan,
      status: subscription?.status || 'free',
      current_period_start: currentPeriod?.starts_at || null,
      current_period_end: currentPeriod?.ends_at || subscription?.next_billed_at || null,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      trial_end: subscription?.trial_dates?.ends_at || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner_id' }
  );

  if (error) throw error;
};

const syncSubscriptionById = async (subscriptionId: string, fallbackOwnerId?: string | null) => {
  const response = await paddleRequest<{ data: any }>(`/subscriptions/${subscriptionId}`);
  const subscription = response.data;
  const ownerId =
    subscription?.custom_data?.owner_id ||
    fallbackOwnerId ||
    (await findOwnerIdForCustomer(subscription?.customer_id));

  if (!ownerId) {
    console.warn('Paddle subscription sync skipped: missing owner_id', subscriptionId);
    return;
  }

  await upsertBillingSubscription(ownerId, subscription);
};

const verifyPaddleSignature = (rawBody: Buffer, signatureHeader?: string | string[]) => {
  const secret = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  console.log('[Paddle Webhook] Verifying signature...');
  console.log('[Paddle Webhook] Secret loaded:', secret ? `${secret.slice(0, 15)}... (len: ${secret.length})` : 'MISSING');

  if (!secret) {
    throw new Error('PADDLE_WEBHOOK_SECRET_KEY is not configured.');
  }

  const header = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!header) throw new Error('Missing Paddle-Signature header.');

  const parts = header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  if (!parts.ts || !parts.h1) throw new Error('Invalid Paddle-Signature header.');

  const timestamp = Number(parts.ts);
  if (!Number.isFinite(timestamp)) throw new Error('Invalid Paddle signature timestamp.');

  const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
  if (ageSeconds > 300) throw new Error('Paddle webhook timestamp is outside tolerance.');

  const signedPayload = `${parts.ts}:${rawBody.toString('utf8')}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(parts.h1, 'hex');

  console.log('[Paddle Webhook] Expected h1:', expected);
  console.log('[Paddle Webhook] Received h1:', parts.h1);

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    throw new Error('Paddle webhook signature verification failed.');
  }
};

router.get('/plans', authenticate, async (_req: Request, res: Response) => {
  res.json({ plans: serializePlans() });
});

router.get('/subscription', authenticate, async (req: Request, res: Response) => {
  const ownerId = await getPrimaryOwnerId(req.user!.id);
  const summary = await getBillingSummary(ownerId);
  res.json({
    ...summary,
    plans: serializePlans(),
    can_manage_billing: ownerId === req.user!.id,
  });
});

router.post('/create-checkout-session', authenticate, async (req: Request, res: Response) => {
  try {
    const { plan } = checkoutSchema.parse(req.body);
    const ownerId = await getPrimaryOwnerId(req.user!.id);

    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the workspace owner can manage billing.' });
    }

    const priceId = getConfiguredPriceId(plan);
    if (!priceId) {
      return res.status(500).json({
        error: `Paddle price for ${PLAN_DEFINITIONS[plan].name} is not configured.`,
      });
    }

    const transaction = await paddleRequest<{ data: { id: string } }>('/transactions', {
      method: 'POST',
      body: {
        items: [{ price_id: priceId, quantity: 1 }],
        collection_mode: 'automatic',
        custom_data: {
          owner_id: ownerId,
          plan,
        },
      },
    });

    res.json({
      provider: 'paddle',
      transactionId: transaction.data.id,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error('Paddle checkout error:', err);
    res.status(500).json({ error: err.message || 'Failed to create Paddle checkout.' });
  }
});

router.post('/create-portal-session', authenticate, async (req: Request, res: Response) => {
  try {
    const ownerId = await getPrimaryOwnerId(req.user!.id);

    if (ownerId !== req.user!.id) {
      return res.status(403).json({ error: 'Only the workspace owner can manage billing.' });
    }

    const summary = await getBillingSummary(ownerId);
    const customerId = summary.subscription?.paddle_customer_id;
    const subscriptionId = summary.subscription?.paddle_subscription_id;

    if (!customerId) {
      return res.status(404).json({ error: 'No Paddle customer found for this workspace.' });
    }

    const portal = await paddleRequest<{ data: any }>(
      `/customers/${customerId}/portal-sessions`,
      {
        method: 'POST',
        body: subscriptionId ? { subscription_ids: [subscriptionId] } : {},
      }
    );

    res.json({ url: portal.data?.urls?.general?.overview });
  } catch (err: any) {
    console.error('Paddle portal error:', err);
    res.status(500).json({ error: err.message || 'Failed to create Paddle portal session.' });
  }
});

export const paddleWebhook = async (req: Request, res: Response) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(500).json({ error: 'Webhook route is missing raw body parsing.' });
    }

    verifyPaddleSignature(req.body, req.headers['paddle-signature']);
  } catch (err: any) {
    console.error('Paddle webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let event: any;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).send('Invalid JSON payload.');
  }

  try {
    const { error: eventInsertError } = await supabase.from('billing_webhook_events').insert({
      id: event.event_id,
      type: event.event_type,
      payload: event,
    });

    if (eventInsertError?.code === '23505') {
      return res.json({ received: true, duplicate: true });
    }

    if (eventInsertError) throw eventInsertError;

    const data = event.data || {};

    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.activated':
      case 'subscription.updated':
      case 'subscription.trialing':
      case 'subscription.past_due':
      case 'subscription.paused':
      case 'subscription.resumed':
      case 'subscription.canceled': {
        const ownerId = data?.custom_data?.owner_id || (await findOwnerIdForCustomer(data.customer_id));
        if (ownerId) {
          await upsertBillingSubscription(ownerId, data);
        }
        break;
      }
      case 'transaction.completed':
      case 'transaction.paid':
      case 'transaction.billed': {
        if (data.subscription_id) {
          await syncSubscriptionById(data.subscription_id, data?.custom_data?.owner_id);
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Paddle webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

export default router;
