-- Migration for Specy Chat Sessions and History Persistence
CREATE TABLE IF NOT EXISTS public.specy_chat_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specy_chat_sessions_user_id ON public.specy_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_specy_chat_sessions_updated_at ON public.specy_chat_sessions(updated_at DESC);
