-- Complete schema update to align with current project code
-- This migration updates RLS policies to allow any authenticated user to access dashboard features

-- First, drop all existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can update all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can delete all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.property_bookings;

-- Create new policies that allow any authenticated user to access dashboard features

-- Contact submissions policies
CREATE POLICY "Authenticated users can view all contact submissions" ON public.contact_submissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Projects policies - allow authenticated users to manage all projects
CREATE POLICY "Authenticated users can view all projects" ON public.projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update projects" ON public.projects
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete projects" ON public.projects
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Announcements policies - allow authenticated users to manage all announcements
CREATE POLICY "Authenticated users can view all announcements" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert announcements" ON public.announcements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update announcements" ON public.announcements
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete announcements" ON public.announcements
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Property bookings policies - allow authenticated users to view and manage
CREATE POLICY "Authenticated users can view all bookings" ON public.property_bookings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update bookings" ON public.property_bookings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Profiles policies - allow authenticated users to view all profiles (for dashboard user info)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Update the existing "Anyone can view published projects" policy to be more permissive
-- This ensures the public can still view published projects on the main site
DROP POLICY IF EXISTS "Anyone can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects" ON public.projects
  FOR SELECT USING (true);

-- Update the existing "Anyone can view published announcements" policy
-- This ensures the public can still view published announcements on the main site
DROP POLICY IF EXISTS "Anyone can view published announcements" ON public.announcements;
CREATE POLICY "Public can view published announcements" ON public.announcements
  FOR SELECT USING (is_published = true OR auth.uid() IS NOT NULL);

-- Ensure that contact submissions and property bookings can still be submitted by anyone
-- These policies should already exist but let's make sure they're correct
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can submit bookings" ON public.property_bookings;
CREATE POLICY "Anyone can submit bookings" ON public.property_bookings
  FOR INSERT WITH CHECK (true);