-- Migration: Admin-Only Security Setup
-- This migration sets up secure admin-only access for the dashboard
-- Only the specified admin user (hudaengineeringrealestate@gmail.com) will have access

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated users can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated users can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated users can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated users can view all bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Drop any existing admin-specific policies
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.property_bookings;

-- Function to check if user is the authorized admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'hudaengineeringrealestate@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative function using auth.email() if available
CREATE OR REPLACE FUNCTION is_admin_user_alt()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'hudaengineeringrealestate@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contact Submissions Policies - Admin Only
CREATE POLICY "Admin can view all contact submissions" ON public.contact_submissions
  FOR SELECT USING (is_admin_user_alt());

CREATE POLICY "Admin can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (is_admin_user_alt());

-- Projects Policies - Admin Only
CREATE POLICY "Admin can view all projects" ON public.projects
  FOR SELECT USING (is_admin_user_alt());

CREATE POLICY "Admin can insert projects" ON public.projects
  FOR INSERT WITH CHECK (is_admin_user_alt());

CREATE POLICY "Admin can update projects" ON public.projects
  FOR UPDATE USING (is_admin_user_alt());

CREATE POLICY "Admin can delete projects" ON public.projects
  FOR DELETE USING (is_admin_user_alt());

-- Announcements Policies - Admin Only
CREATE POLICY "Admin can view all announcements" ON public.announcements
  FOR SELECT USING (is_admin_user_alt());

CREATE POLICY "Admin can insert announcements" ON public.announcements
  FOR INSERT WITH CHECK (is_admin_user_alt());

CREATE POLICY "Admin can update announcements" ON public.announcements
  FOR UPDATE USING (is_admin_user_alt());

CREATE POLICY "Admin can delete announcements" ON public.announcements
  FOR DELETE USING (is_admin_user_alt());

-- Property Bookings Policies - Admin Only
CREATE POLICY "Admin can view all bookings" ON public.property_bookings
  FOR SELECT USING (is_admin_user_alt());

CREATE POLICY "Admin can update bookings" ON public.property_bookings
  FOR UPDATE USING (is_admin_user_alt());

-- Profiles Policies - Admin Only
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin_user_alt());

CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin_user_alt());

-- Public access policies (for the main website)
-- These allow public users to view published content and submit forms

-- Public can view published projects
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects" ON public.projects
  FOR SELECT USING (true);

-- Public can view published announcements
DROP POLICY IF EXISTS "Public can view published announcements" ON public.announcements;
CREATE POLICY "Public can view published announcements" ON public.announcements
  FOR SELECT USING (is_published = true);

-- Anyone can submit contact forms
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

-- Anyone can submit property bookings
DROP POLICY IF EXISTS "Anyone can submit bookings" ON public.property_bookings;
CREATE POLICY "Anyone can submit bookings" ON public.property_bookings
  FOR INSERT WITH CHECK (true);

-- Users can view their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profiles
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insert policy for profiles (when users sign up)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create admin profile if it doesn't exist
-- Note: This will be created when the admin user first signs in through Supabase Auth

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_bookings_created_at ON public.property_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published);

-- Add comments for documentation
COMMENT ON FUNCTION is_admin_user() IS 'Checks if the current user is the authorized admin using JWT email';
COMMENT ON FUNCTION is_admin_user_alt() IS 'Checks if the current user is the authorized admin using auth.users table';

-- Security note: The admin email is hardcoded in the functions above
-- Only the user with email 'hudaengineeringrealestate@gmail.com' will have admin access
-- All other users will be denied access to admin functions