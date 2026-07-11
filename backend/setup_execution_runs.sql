-- ====================================================================
-- Speclane Database Migration: Execution Runs (Run Comparison)
-- ====================================================================

-- 1. Create Execution Runs Table
CREATE TABLE IF NOT EXISTS execution_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  environment VARCHAR(100) NOT NULL,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  duration VARCHAR(100) DEFAULT '1m 30s',
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE execution_runs ENABLE ROW LEVEL SECURITY;

-- 3. Define Security Policies
CREATE POLICY "Users can view their execution runs" 
ON execution_runs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert execution runs" 
ON execution_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update execution runs" 
ON execution_runs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete execution runs" 
ON execution_runs FOR DELETE USING (auth.uid() = user_id);
