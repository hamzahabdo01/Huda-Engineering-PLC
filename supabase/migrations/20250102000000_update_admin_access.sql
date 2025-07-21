-- Update RLS policies to allow any authenticated user to access admin dashboard

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can update all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can delete all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.property_bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON public.property_bookings;

-- Create new policies that allow any authenticated user to access admin features

-- Contact submissions policies - any authenticated user can view and manage
CREATE POLICY "Authenticated users can view all contact submissions" ON public.contact_submissions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update contact submissions" ON public.contact_submissions
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Projects policies - any authenticated user can manage
CREATE POLICY "Authenticated users can manage all projects" ON public.projects
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Announcements policies - any authenticated user can manage
CREATE POLICY "Authenticated users can view all announcements" ON public.announcements
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage all announcements" ON public.announcements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all announcements" ON public.announcements
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all announcements" ON public.announcements
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Property bookings policies - any authenticated user can view and manage
CREATE POLICY "Authenticated users can view all bookings" ON public.property_bookings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update bookings" ON public.property_bookings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Add policy to allow authenticated users to view all profiles (for admin dashboard user info)
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);