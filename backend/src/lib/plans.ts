export type PlanId = 'free' | 'starter' | 'pro' | 'business';

export type PlanLimitKey =
  | 'projects'
  | 'monthlyGenerations'
  | 'teamMembers';

export type FeatureKey =
  | 'slackAlerts'
  | 'teamCollaboration'
  | 'videoCalls'
  | 'advancedReports'
  | 'aiTestGenerator'
  | 'runComparison'
  | 'dataExport';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  priceLabel: string;
  priceEnv?: string;
  limits: Record<PlanLimitKey, number>;
  features: Record<FeatureKey, boolean>;
}

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Preview Speclane with a small workspace before upgrading.',
    priceLabel: '$0/mo',
    limits: {
      projects: 1,
      monthlyGenerations: 1,
      teamMembers: 1,
    },
    features: {
      slackAlerts: false,
      teamCollaboration: false,
      videoCalls: false,
      advancedReports: false,
      aiTestGenerator: false,
      runComparison: false,
      dataExport: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For solo QA engineers validating a few products.',
    priceLabel: '$19/mo',
    priceEnv: 'PADDLE_PRICE_STARTER',
    limits: {
      projects: 3,
      monthlyGenerations: 50,
      teamMembers: 1,
    },
    features: {
      slackAlerts: false,
      teamCollaboration: false,
      videoCalls: false,
      advancedReports: true,
      aiTestGenerator: true,
      runComparison: true,
      dataExport: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing QA teams with shared requirements and reports.',
    priceLabel: '$49/mo',
    priceEnv: 'PADDLE_PRICE_PRO',
    limits: {
      projects: 15,
      monthlyGenerations: 500,
      teamMembers: 10,
    },
    features: {
      slackAlerts: true,
      teamCollaboration: true,
      videoCalls: false,
      advancedReports: true,
      aiTestGenerator: true,
      runComparison: true,
      dataExport: true,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'For companies that need high-volume AI QA workflows.',
    priceLabel: '$149/mo',
    priceEnv: 'PADDLE_PRICE_BUSINESS',
    limits: {
      projects: -1,
      monthlyGenerations: 3000,
      teamMembers: 50,
    },
    features: {
      slackAlerts: true,
      teamCollaboration: true,
      videoCalls: true,
      advancedReports: true,
      aiTestGenerator: true,
      runComparison: true,
      dataExport: true,
    },
  },
};

export const PAID_PLAN_IDS: PlanId[] = ['starter', 'pro', 'business'];

export const getConfiguredPriceId = (planId: PlanId) => {
  const priceEnv = PLAN_DEFINITIONS[planId]?.priceEnv;
  return priceEnv ? process.env[priceEnv] : undefined;
};

export const getPlanIdFromPrice = (priceId?: string | null): PlanId | null => {
  if (!priceId) return null;

  for (const planId of PAID_PLAN_IDS) {
    if (getConfiguredPriceId(planId) === priceId) {
      return planId;
    }
  }

  return null;
};

export const serializePlans = () =>
  PAID_PLAN_IDS.map((planId) => {
    const plan = PLAN_DEFINITIONS[planId];
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceLabel: plan.priceLabel,
      limits: plan.limits,
      features: plan.features,
      configured: Boolean(getConfiguredPriceId(planId)),
    };
  });
