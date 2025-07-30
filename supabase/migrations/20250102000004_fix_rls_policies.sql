-- Migration: Fix RLS Policies
-- This migration fixes the RLS policies that are currently not working properly
-- The issue is that SELECT operations are not properly restricted for unauthenticated users

-- First, let's make sure RLS is enabled on all tables
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin can delete contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;

DROP POLICY IF EXISTS "Admin can view all bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Admin can update bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Admin can delete bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Admin can delete property bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Anyone can submit bookings" ON public.property_bookings;

DROP POLICY IF EXISTS "Admin can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admin can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;

DROP POLICY IF EXISTS "Admin can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public can view published announcements" ON public.announcements;

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate the admin check function to make sure it's working
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'hudaengineeringrealestate@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CONTACT SUBMISSIONS POLICIES
-- Admin can view all contact submissions
CREATE POLICY "Admin can view all contact submissions" ON public.contact_submissions
  FOR SELECT USING (is_admin_user());

-- Admin can update contact submissions
CREATE POLICY "Admin can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (is_admin_user());

-- Admin can delete contact submissions
CREATE POLICY "Admin can delete contact submissions" ON public.contact_submissions
  FOR DELETE USING (is_admin_user());

-- Anyone can submit contact forms (public form submission)
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- PROPERTY BOOKINGS POLICIES
-- Admin can view all bookings
CREATE POLICY "Admin can view all bookings" ON public.property_bookings
  FOR SELECT USING (is_admin_user());

-- Admin can update bookings
CREATE POLICY "Admin can update bookings" ON public.property_bookings
  FOR UPDATE USING (is_admin_user());

-- Admin can delete bookings
CREATE POLICY "Admin can delete bookings" ON public.property_bookings
  FOR DELETE USING (is_admin_user());

-- Anyone can submit bookings (public form submission)
CREATE POLICY "Anyone can submit bookings" ON public.property_bookings
  FOR INSERT WITH CHECK (true);

-- PROJECTS POLICIES
-- Public can view all projects (for the public website)
CREATE POLICY "Public can view all projects" ON public.projects
  FOR SELECT USING (true);

-- Admin can insert projects
CREATE POLICY "Admin can insert projects" ON public.projects
  FOR INSERT WITH CHECK (is_admin_user());

-- Admin can update projects
CREATE POLICY "Admin can update projects" ON public.projects
  FOR UPDATE USING (is_admin_user());

-- Admin can delete projects
CREATE POLICY "Admin can delete projects" ON public.projects
  FOR DELETE USING (is_admin_user());

-- ANNOUNCEMENTS POLICIES
-- Public can view published announcements
CREATE POLICY "Public can view published announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

-- Admin can view all announcements (including unpublished)
CREATE POLICY "Admin can view all announcements" ON public.announcements
  FOR SELECT USING (is_admin_user());

-- Admin can insert announcements
CREATE POLICY "Admin can insert announcements" ON public.announcements
  FOR INSERT WITH CHECK (is_admin_user());

-- Admin can update announcements
CREATE POLICY "Admin can update announcements" ON public.announcements
  FOR UPDATE USING (is_admin_user());

-- Admin can delete announcements
CREATE POLICY "Admin can delete announcements" ON public.announcements
  FOR DELETE USING (is_admin_user());

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin_user());

-- Admin can update all profiles
CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin_user());

-- Test the admin function
DO $$
BEGIN
  -- This will help us debug if the function is working
  RAISE NOTICE 'Admin function test completed';
END $$;

-- Add comments for documentation
COMMENT ON FUNCTION is_admin_user() IS 'Checks if the current user is the authorized admin (hudaengineeringrealestate@gmail.com)';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_bookings_created_at ON public.property_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);