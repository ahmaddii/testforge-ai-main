-- Run this script in the Supabase SQL editor to drop all billing-related tables.

-- Then drop the tables
DROP TABLE IF EXISTS public.billing_webhook_events CASCADE;
DROP TABLE IF EXISTS public.billing_usage_events CASCADE;
DROP TABLE IF EXISTS public.billing_subscriptions CASCADE;
