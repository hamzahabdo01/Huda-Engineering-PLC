-- =============================================================================
-- SIMPLIFIED DATABASE FIX FOR EMAIL-BASED BOOKING SYSTEM
-- =============================================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- This removes email_logs table and creates only the core functions needed

-- =============================================================================
-- 1. REMOVE EMAIL LOGS TABLE AND RELATED ITEMS (if they exist)
-- =============================================================================

-- Drop email_logs table completely since we're using Gmail
DROP TABLE IF EXISTS public.email_logs CASCADE;

-- =============================================================================
-- 2. CREATE SIMPLIFIED EMAIL NOTIFICATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.send_enhanced_booking_email(
  recipient_email TEXT,
  customer_name TEXT,
  property_title TEXT,
  unit_type TEXT,
  booking_status TEXT,
  booking_id TEXT,
  phone_number TEXT DEFAULT NULL,
  move_in_date TEXT DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_subject TEXT;
  email_result JSON;
BEGIN
  -- Generate email subject based on status
  IF booking_status = 'approved' THEN
    email_subject := '🎉 Booking Approved - ' || property_title || ' [Ref: #' || SUBSTRING(booking_id, -8) || ']';
  ELSIF booking_status = 'rejected' THEN
    email_subject := '📋 Booking Update Required - ' || property_title || ' [Ref: #' || SUBSTRING(booking_id, -8) || ']';
  ELSIF booking_status = 'confirmed' THEN
    email_subject := '✅ Booking Confirmed - ' || property_title || ' [Ref: #' || SUBSTRING(booking_id, -8) || ']';
  ELSE
    email_subject := '📋 Booking Update - ' || property_title || ' [Ref: #' || SUBSTRING(booking_id, -8) || ']';
  END IF;

  -- Since we're using Gmail, we just return a success response
  -- The actual email sending will be handled by your email service (Gmail)
  
  email_result := json_build_object(
    'success', true,
    'message', 'Email notification prepared for ' || recipient_email,
    'subject', email_subject,
    'recipient', recipient_email,
    'reference', SUBSTRING(booking_id, -8),
    'status', booking_status,
    'customer_name', customer_name,
    'property_title', property_title,
    'unit_type', unit_type,
    'phone_number', COALESCE(phone_number, 'N/A'),
    'move_in_date', COALESCE(move_in_date, 'To be discussed'),
    'rejection_reason', COALESCE(rejection_reason, NULL)
  );

  RETURN email_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error preparing email notification'
    );
END;
$$;

-- =============================================================================
-- 3. CREATE BOOKING CONFIRMATION FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.send_booking_confirmation(
  p_booking_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_record RECORD;
  property_record RECORD;
  email_result JSON;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM public.property_bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking not found',
      'booking_id', p_booking_id
    );
  END IF;

  -- Get property details
  SELECT * INTO property_record
  FROM public.projects
  WHERE id = booking_record.property_id;

  -- Prepare confirmation email details
  SELECT public.send_enhanced_booking_email(
    booking_record.email,
    booking_record.full_name,
    COALESCE(property_record.title, 'Property'),
    booking_record.unit_type,
    'confirmed',
    booking_record.id,
    booking_record.phone,
    booking_record.move_in_date
  ) INTO email_result;

  RETURN email_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error sending booking confirmation'
    );
END;
$$;

-- =============================================================================
-- 4. CREATE BOOKING STATUS UPDATE FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_booking_status_with_enhanced_email(
  p_booking_id TEXT,
  p_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_record RECORD;
  property_record RECORD;
  email_result JSON;
  update_result JSON;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM public.property_bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Booking not found',
      'booking_id', p_booking_id
    );
  END IF;

  -- Get property details
  SELECT * INTO property_record
  FROM public.projects
  WHERE id = booking_record.property_id;

  -- Update booking status
  UPDATE public.property_bookings
  SET 
    status = p_status,
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Prepare email notification details
  SELECT public.send_enhanced_booking_email(
    booking_record.email,
    booking_record.full_name,
    COALESCE(property_record.title, 'Property'),
    booking_record.unit_type,
    p_status,
    booking_record.id,
    booking_record.phone,
    booking_record.move_in_date,
    p_rejection_reason
  ) INTO email_result;

  -- Return combined result
  update_result := json_build_object(
    'success', true,
    'message', 'Booking status updated and email notification prepared',
    'booking_id', p_booking_id,
    'new_status', p_status,
    'email_result', email_result
  );

  RETURN update_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error updating booking status'
    );
END;
$$;

-- =============================================================================
-- 5. GRANT PERMISSIONS FOR ALL FUNCTIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO service_role;
GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO anon;

GRANT EXECUTE ON FUNCTION public.send_booking_confirmation TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_booking_confirmation TO service_role;
GRANT EXECUTE ON FUNCTION public.send_booking_confirmation TO anon;

GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO service_role;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO anon;

-- =============================================================================
-- 6. ADD UPDATED_AT COLUMN AND TRIGGER (if not exists)
-- =============================================================================

-- Add updated_at column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add rejection_reason column if it doesn't exist  
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_property_bookings_updated_at ON public.property_bookings;
CREATE TRIGGER update_property_bookings_updated_at
  BEFORE UPDATE ON public.property_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 7. VERIFY INSTALLATION
-- =============================================================================

-- Check that all functions were created
SELECT 
  routine_name,
  routine_type,
  'Available' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'send_enhanced_booking_email',
  'send_booking_confirmation', 
  'update_booking_status_with_enhanced_email'
)
ORDER BY routine_name;

-- Verify property_bookings table has required columns
SELECT 
  column_name,
  data_type,
  'Column exists' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'property_bookings'
AND column_name IN ('updated_at', 'rejection_reason')
ORDER BY column_name;

-- =============================================================================
-- INSTALLATION COMPLETE!
-- =============================================================================
-- All functions have been set up without email logging.
-- The email system will work through Gmail directly.
-- Test using the Debug tab in the admin dashboard.
-- =============================================================================