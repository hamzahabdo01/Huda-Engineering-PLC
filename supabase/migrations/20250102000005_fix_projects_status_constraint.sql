-- Migration: Fix Projects Status Constraint
-- This migration fixes the projects status constraint that is currently blocking project creation

-- First, let's check what constraints exist on the projects table
-- and drop the problematic status constraint

-- Drop the existing constraint if it exists
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Recreate the constraint with the correct values
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('planning', 'active', 'completed', 'upcoming', 'on-hold'));

-- Update the default status to 'planning' which is more appropriate for new projects
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'planning';

-- Add a comment to document the valid status values
COMMENT ON COLUMN public.projects.status IS 'Project status: planning, active, completed, upcoming, on-hold';

-- Test the constraint by trying to insert a test record (will be rolled back)
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Test insert with valid status
  INSERT INTO public.projects (title, description, location, project_type, status)
  VALUES ('Test Project', 'Test Description', 'Test Location', 'residential', 'planning')
  RETURNING id INTO test_id;
  
  -- Clean up the test record
  DELETE FROM public.projects WHERE id = test_id;
  
  RAISE NOTICE 'Projects status constraint test passed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Projects status constraint test failed: %', SQLERRM;
END $$;