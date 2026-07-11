CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  requirement_name VARCHAR(255),
  coverage INTEGER DEFAULT 0,
  test_case_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  release_date VARCHAR(100) NOT NULL,
  readiness_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Testing', -- 'Ready', 'At Risk', 'Testing', 'Released'
  runs_executed INTEGER DEFAULT 0,
  blocking_defects INTEGER DEFAULT 0,
  coverage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Production', 'Staging', 'Development', 'Preview'
  url VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Healthy', -- 'Healthy', 'Degraded', 'Updating'
  last_verified VARCHAR(100) DEFAULT 'Just now',
  active_runners INTEGER DEFAULT 1,
  success_rate FLOAT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sprint VARCHAR(100) NOT NULL,
  start_date VARCHAR(100) NOT NULL,
  end_date VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Planned', -- 'In Progress', 'Completed', 'Planned'
  total_cases INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  untested INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_plans ENABLE ROW LEVEL SECURITY;

-- Policies for Reports
CREATE POLICY "Users can view their reports" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update reports" ON reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete reports" ON reports FOR DELETE USING (auth.uid() = user_id);

-- Policies for Releases
CREATE POLICY "Users can view their releases" ON releases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert releases" ON releases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update releases" ON releases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete releases" ON releases FOR DELETE USING (auth.uid() = user_id);

-- Policies for Environments
CREATE POLICY "Users can view their environments" ON environments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert environments" ON environments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update environments" ON environments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete environments" ON environments FOR DELETE USING (auth.uid() = user_id);

-- Policies for Test Plans
CREATE POLICY "Users can view their test plans" ON test_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert test plans" ON test_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update test plans" ON test_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete test plans" ON test_plans FOR DELETE USING (auth.uid() = user_id);

-- Table and Policies for Execution Runs (Run Comparison)
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

ALTER TABLE execution_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their execution runs" ON execution_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert execution runs" ON execution_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update execution runs" ON execution_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete execution runs" ON execution_runs FOR DELETE USING (auth.uid() = user_id);

