-- Update projects table to support floor plans instead of simple units
-- First, add the new floor_plans column
ALTER TABLE public.projects 
ADD COLUMN floor_plans JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the new field
COMMENT ON COLUMN public.projects.floor_plans IS 'JSON array containing floor plan information with apartment types, sizes, and availability';

-- Create an index on the floor_plans column for better query performance
CREATE INDEX idx_projects_floor_plans ON public.projects USING GIN (floor_plans);

-- Note: The old 'units' column will remain for backward compatibility
-- You can remove it later after ensuring all data has been migrated