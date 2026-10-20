-- ====================================================================
-- TestForge Migration: Add 'blocked' column to execution_runs
-- ====================================================================
-- This migration adds an optional 'blocked' integer column to execution_runs.
-- The application is fully backward-compatible and persists blocked metrics
-- inside the results._meta JSONB payload whether or not this migration is run.

ALTER TABLE execution_runs ADD COLUMN IF NOT EXISTS blocked INTEGER DEFAULT 0;
