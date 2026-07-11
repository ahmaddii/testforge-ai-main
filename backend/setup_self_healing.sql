-- Production PostgreSQL / Supabase Schema for AI Self-Healing Jobs
-- Run this in your Supabase SQL Editor to enable production AST DOM drift tracking.

CREATE TABLE IF NOT EXISTS public.self_healing_jobs (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  test_case_id TEXT NOT NULL,
  test_case_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Approval' CHECK (status IN ('Healed', 'Pending Approval', 'Failed')),
  confidence INTEGER NOT NULL DEFAULT 95,
  broken_selector TEXT NOT NULL,
  healed_selector TEXT NOT NULL,
  dom_diff_snippet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.self_healing_jobs ENABLE ROW LEVEL SECURITY;

-- Create Security Policies for authenticated workspace access
CREATE POLICY "Users can view self-healing jobs in their workspace"
  ON public.self_healing_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update self-healing jobs in their workspace"
  ON public.self_healing_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert self-healing jobs in their workspace"
  ON public.self_healing_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
