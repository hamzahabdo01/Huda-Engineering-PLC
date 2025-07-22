-- Migration: Add Delete Policies for Contact Submissions and Property Bookings
-- This migration adds the missing DELETE policies for admin user

-- Add delete policy for contact submissions
CREATE POLICY "Admin can delete contact submissions" ON public.contact_submissions
  FOR DELETE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'hudaengineeringrealestate@gmail.com'
  );

-- Add delete policy for property bookings  
CREATE POLICY "Admin can delete property bookings" ON public.property_bookings
  FOR DELETE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'hudaengineeringrealestate@gmail.com'
  );

-- Ensure RLS is enabled on both tables
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_bookings ENABLE ROW LEVEL SECURITY;

-- Grant delete permissions
GRANT DELETE ON public.contact_submissions TO authenticated;
GRANT DELETE ON public.property_bookings TO authenticated;
