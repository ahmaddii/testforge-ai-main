-- Enable Supabase Realtime events for the source tables Specy's RAG index watches.
-- Run this once in the Supabase SQL editor for each environment.
DO $$
DECLARE
  source_table text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE EXCEPTION 'Supabase publication "supabase_realtime" does not exist';
  END IF;

  FOREACH source_table IN ARRAY ARRAY[
    'requirements',
    'test_cases',
    'test_plans',
    'defects',
    'execution_runs'
  ] LOOP
    IF to_regclass(format('public.%I', source_table)) IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM pg_publication_tables
         WHERE pubname = 'supabase_realtime'
           AND schemaname = 'public'
           AND tablename = source_table
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', source_table);
    END IF;
  END LOOP;
END $$;
