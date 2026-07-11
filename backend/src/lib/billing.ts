import { supabase } from './supabase';
import {
  FeatureKey,
  PLAN_DEFINITIONS,
  PlanId,
  PlanLimitKey,
} from './plans';

type BillingRow = {
  owner_id: string;
  plan: PlanId;
  status: string;
  paddle_customer_id?: string | null;
  paddle_subscription_id?: string | null;
  paddle_price_id?: string | null;
  paddle_product_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
};

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

export class BillingLimitError extends Error {
  statusCode = 402;
  code = 'billing_limit_exceeded';
  details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.details = details;
  }
}

export const isBillingLimitError = (error: unknown): error is BillingLimitError =>
  error instanceof BillingLimitError;

const normalizePlanId = (plan?: string | null): PlanId =>
  plan === 'starter' || plan === 'pro' || plan === 'business' ? plan : 'free';

export const resolveEffectivePlanId = (row?: BillingRow | null): PlanId => {
  if (!row) return 'free';
  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(row.status)) return 'free';
  return normalizePlanId(row.plan);
};

export const getBillingRow = async (ownerId: string): Promise<BillingRow | null> => {
  const { data, error } = await supabase
    .from('billing_subscriptions')
    .select('*')
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (error) {
    console.error('Billing lookup error:', error);
    return null;
  }

  return data as BillingRow | null;
};

export const getBillingSummary = async (ownerId: string) => {
  const row = await getBillingRow(ownerId);
  const effectivePlanId = resolveEffectivePlanId(row);
  const plan = PLAN_DEFINITIONS[effectivePlanId];
  const generationUsage = await getMonthlyUsage(ownerId, 'generation');

  return {
    owner_id: ownerId,
    plan: effectivePlanId,
    display_plan: plan,
    subscription: row,
    usage: {
      monthlyGenerations: generationUsage,
    },
  };
};

export const getMonthlyUsage = async (ownerId: string, eventType: string) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const row = await getBillingRow(ownerId);
  const usageWindowStart =
    row?.current_period_start && ACTIVE_SUBSCRIPTION_STATUSES.has(row.status)
      ? new Date(row.current_period_start)
      : monthStart;

  const { data, error } = await supabase
    .from('billing_usage_events')
    .select('quantity')
    .eq('owner_id', ownerId)
    .eq('event_type', eventType)
    .gte('created_at', usageWindowStart.toISOString());

  if (error) {
    console.error('Billing usage lookup error:', error);
    return 0;
  }

  return (data || []).reduce((total, event) => total + Number(event.quantity || 0), 0);
};

export const recordUsage = async (
  ownerId: string,
  eventType: string,
  quantity = 1,
  metadata: Record<string, unknown> = {}
) => {
  const { error } = await supabase.from('billing_usage_events').insert({
    owner_id: ownerId,
    event_type: eventType,
    quantity,
    metadata,
  });

  if (error) {
    console.error('Billing usage record error:', error);
  }
};

const assertLimit = (
  planId: PlanId,
  key: PlanLimitKey,
  current: number,
  attempted: number,
  message: string
) => {
  const limit = PLAN_DEFINITIONS[planId].limits[key];
  if (limit !== -1 && current + attempted > limit) {
    throw new BillingLimitError(message, {
      plan: planId,
      limit,
      current,
      attempted,
    });
  }
};

export const assertProjectLimit = async (ownerId: string) => {
  const { plan } = await getBillingSummary(ownerId);
  const { count, error } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ownerId);

  if (error) throw error;

  assertLimit(
    plan,
    'projects',
    count || 0,
    1,
    'Your current plan has reached its project limit. Upgrade to add more projects.'
  );
};

export const assertGenerationLimit = async (ownerId: string) => {
  const { plan } = await getBillingSummary(ownerId);
  const current = await getMonthlyUsage(ownerId, 'generation');

  assertLimit(
    plan,
    'monthlyGenerations',
    current,
    1,
    'Your current plan has reached its monthly AI generation limit. Upgrade to keep generating.'
  );
};

export const assertTeamMemberLimit = async (ownerId: string) => {
  const { plan } = await getBillingSummary(ownerId);
  const { count, error } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', ownerId)
    .in('status', ['pending', 'active']);

  if (error) throw error;

  assertLimit(
    plan,
    'teamMembers',
    1 + (count || 0),
    1,
    'Your current plan has reached its team seat limit. Upgrade to invite more members.'
  );
};

export const assertFeatureAccess = async (
  ownerId: string,
  feature: FeatureKey,
  message = 'Your current plan does not include this feature.'
) => {
  const { plan } = await getBillingSummary(ownerId);
  if (!PLAN_DEFINITIONS[plan].features[feature]) {
    throw new BillingLimitError(message, {
      plan,
      feature,
    });
  }
};

export const sendBillingError = (res: any, error: BillingLimitError) =>
  res.status(error.statusCode).json({
    error: error.message,
    code: error.code,
    details: error.details,
  });
