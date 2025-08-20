-- Add percentage to project_updates to track per-update progress
ALTER TABLE public.project_updates 
ADD COLUMN IF NOT EXISTS percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100);

COMMENT ON COLUMN public.project_updates.percentage IS 'Progress percentage for this update (0-100)';

