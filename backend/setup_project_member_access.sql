-- Run this in your Supabase SQL Editor to enable per-project member access management
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Optional index for high-performance project filtering
CREATE INDEX IF NOT EXISTS team_members_project_idx ON public.team_members(project_id);
