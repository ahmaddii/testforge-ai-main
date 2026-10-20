-- Specy semantic retrieval index. Run in the Supabase SQL editor.
-- The backend uses the service role after checking workspace ownership.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.specy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'requirement', 'test_case', 'test_plan', 'defect', 'execution_run'
  )),
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  content_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, source_type, source_id)
);

CREATE TABLE IF NOT EXISTS public.specy_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.specy_documents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding extensions.vector(768) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_specy_documents_owner_project
  ON public.specy_documents (owner_id, project_id);
CREATE INDEX IF NOT EXISTS idx_specy_documents_source
  ON public.specy_documents (source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_specy_chunks_owner_project
  ON public.specy_document_chunks (owner_id, project_id);
CREATE INDEX IF NOT EXISTS idx_specy_chunks_document
  ON public.specy_document_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_specy_chunks_embedding_cosine
  ON public.specy_document_chunks
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 100);

ALTER TABLE public.specy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specy_document_chunks ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.match_specy_chunks(
  query_embedding extensions.vector(768),
  match_count INTEGER DEFAULT 18,
  filter_owner_ids UUID[] DEFAULT NULL,
  filter_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  owner_id UUID,
  project_id UUID,
  source_type TEXT,
  source_id UUID,
  title TEXT,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT
    c.id AS chunk_id,
    d.id AS document_id,
    c.owner_id,
    c.project_id,
    d.source_type,
    d.source_id,
    d.title,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    c.metadata
  FROM public.specy_document_chunks AS c
  JOIN public.specy_documents AS d ON d.id = c.document_id
  WHERE (filter_owner_ids IS NULL OR c.owner_id = ANY(filter_owner_ids))
    AND (filter_project_id IS NULL OR c.project_id = filter_project_id)
  ORDER BY c.embedding <=> query_embedding
  LIMIT GREATEST(1, LEAST(match_count, 100));
$$;
