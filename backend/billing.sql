-- Run this in Supabase SQL editor before enabling Paddle billing.
-- The backend uses the service role key, so RLS stays strict for browser clients.

create extension if not exists pgcrypto;

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique,
  paddle_customer_id text unique,
  paddle_subscription_id text unique,
  paddle_price_id text,
  paddle_product_id text,
  plan text not null default 'free'
    check (plan in ('free', 'starter', 'pro', 'business')),
  status text not null default 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you already ran the earlier Stripe draft script, these add the Paddle
-- columns without deleting any data.
alter table public.billing_subscriptions
  add column if not exists paddle_customer_id text,
  add column if not exists paddle_subscription_id text,
  add column if not exists paddle_price_id text,
  add column if not exists paddle_product_id text;

create unique index if not exists billing_subscriptions_paddle_customer_uidx
  on public.billing_subscriptions(paddle_customer_id)
  where paddle_customer_id is not null;

create unique index if not exists billing_subscriptions_paddle_subscription_uidx
  on public.billing_subscriptions(paddle_subscription_id)
  where paddle_subscription_id is not null;

create index if not exists billing_subscriptions_owner_idx
  on public.billing_subscriptions(owner_id);

create table if not exists public.billing_usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  event_type text not null,
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists billing_usage_events_owner_type_created_idx
  on public.billing_usage_events(owner_id, event_type, created_at desc);

create table if not exists public.billing_webhook_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

alter table public.billing_subscriptions enable row level security;
alter table public.billing_usage_events enable row level security;
alter table public.billing_webhook_events enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_subscriptions_set_updated_at on public.billing_subscriptions;
create trigger billing_subscriptions_set_updated_at
before update on public.billing_subscriptions
for each row execute function public.set_updated_at();

-- Optional read-only policies for authenticated owners. Your app currently reads
-- billing through the backend API, but these policies are safe if you later add
-- direct Supabase reads from the browser.
drop policy if exists "Owners can read their billing subscription" on public.billing_subscriptions;
create policy "Owners can read their billing subscription"
on public.billing_subscriptions
for select
to authenticated
using (auth.uid() = owner_id);

drop policy if exists "Owners can read their billing usage" on public.billing_usage_events;
create policy "Owners can read their billing usage"
on public.billing_usage_events
for select
to authenticated
using (auth.uid() = owner_id);
