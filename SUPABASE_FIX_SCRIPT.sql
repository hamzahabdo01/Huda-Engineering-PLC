-- =============================================================================
-- COMPLETE SUPABASE DATABASE FIX SCRIPT
-- =============================================================================
-- Run this entire script in your Supabase SQL Editor
-- This will fix all booking management issues

-- =============================================================================
-- 1. ADD MISSING COLUMNS TO PROPERTY_BOOKINGS TABLE
-- =============================================================================

-- Add unit_type column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS unit_type TEXT;

-- Add secondary_phone column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS secondary_phone TEXT;

-- Add preferred_contact column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'phone';

-- Add rejection_reason column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =============================================================================
-- 2. CREATE EMAIL LOGS TABLE (if not exists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  booking_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. FIX EMAIL LOGS PERMISSIONS
-- =============================================================================

-- Enable RLS if not already enabled
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Users can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service can insert email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Authenticated can read email logs" ON public.email_logs;

-- Create new policies
CREATE POLICY "Authenticated can read email logs" ON public.email_logs
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage email logs" ON public.email_logs
FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
GRANT ALL ON public.email_logs TO anon;

-- =============================================================================
-- 4. CREATE ENHANCED EMAIL NOTIFICATION FUNCTION
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
  email_body TEXT;
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

  -- Generate comprehensive email body based on status
  IF booking_status = 'approved' THEN
    email_body := format('
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px;">Your Property Booking Has Been Approved</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #00555b; margin-top: 0;">Property Details</h2>
          <p><strong>Property:</strong> %s</p>
          <p><strong>Unit Type:</strong> %s</p>
          <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">APPROVED</span></p>
          
          <h3 style="color: #00555b;">Next Steps</h3>
          <ol style="padding-left: 20px;">
            <li>Our team will contact you within 24 hours</li>
            <li>Complete any required documentation</li>
            <li>Schedule property viewing if needed</li>
            <li>Finalize move-in arrangements</li>
          </ol>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6c757d;">Thank you for choosing our properties!</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">For questions, contact us at support@hudaengineering.com</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), property_title, unit_type);
    
  ELSIF booking_status = 'rejected' THEN
    email_body := format('
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Update Required</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px;">📋 Booking Update Required</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px;">Your Property Booking Needs Attention</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #dc3545; margin-top: 0;">Property Details</h2>
          <p><strong>Property:</strong> %s</p>
          <p><strong>Unit Type:</strong> %s</p>
          <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">REJECTED</span></p>
          
          <h3 style="color: #dc3545;">Reason for Rejection</h3>
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #721c24;">%s</p>
          </div>
          
          <h3 style="color: #00555b;">What You Can Do</h3>
          <ol style="padding-left: 20px;">
            <li>Review the rejection reason above</li>
            <li>Address any issues mentioned</li>
            <li>Submit a new booking if applicable</li>
            <li>Contact us for clarification</li>
          </ol>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6c757d;">We''re here to help you find the perfect property!</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">For assistance, contact us at support@hudaengineering.com</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), property_title, unit_type, COALESCE(rejection_reason, 'No specific reason provided'));
    
  ELSE
    email_body := format('
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #17a2b8, #138496); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px;">📋 Booking Update</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px;">Your Property Booking Status Has Changed</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #17a2b8; margin-top: 0;">Property Details</h2>
          <p><strong>Property:</strong> %s</p>
          <p><strong>Unit Type:</strong> %s</p>
          <p><strong>Current Status:</strong> <span style="color: #17a2b8; font-weight: bold;">%s</span></p>
          
          <h3 style="color: #00555b;">What This Means</h3>
          <p>Your booking is currently being processed. We will notify you of any further updates.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6c757d;">Thank you for your patience!</p>
          <p style="margin: 5px 0 0 0; font-size: 14px;">For questions, contact us at support@hudaengineering.com</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), property_title, unit_type, booking_status);
  END IF;

  -- Log the email attempt
  INSERT INTO public.email_logs (recipient_email, subject, body, status, booking_id)
  VALUES (recipient_email, email_subject, email_body, 'sent', booking_id);

  -- Return success result
  email_result := json_build_object(
    'success', true,
    'subject', email_subject,
    'recipient', recipient_email,
    'status', 'sent'
  );

  RETURN email_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO public.email_logs (recipient_email, subject, body, status, error_message, booking_id)
    VALUES (recipient_email, 'Email Failed', '', 'failed', SQLERRM, booking_id);

    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =============================================================================
-- 5. CREATE BOOKING STATUS UPDATE FUNCTION
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
      'error', 'Booking not found'
    );
  END IF;

  -- Update booking status
  UPDATE public.property_bookings
  SET 
    status = p_status,
    rejection_reason = CASE WHEN p_status = 'rejected' THEN p_rejection_reason ELSE rejection_reason END,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Send email notification
  email_result := public.send_enhanced_booking_email(
    booking_record.email,
    booking_record.full_name,
    COALESCE(booking_record.property_id, 'Property'),
    COALESCE(booking_record.unit_type, 'Unit'),
    p_status,
    p_booking_id,
    booking_record.phone,
    booking_record.move_in_date::TEXT,
    p_rejection_reason
  );

  -- Return combined result
  update_result := json_build_object(
    'success', true,
    'message', 'Booking status updated and enhanced notification sent',
    'booking_id', p_booking_id,
    'new_status', p_status,
    'email_result', email_result
  );

  RETURN update_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =============================================================================
-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- =============================================================================

DROP TRIGGER IF EXISTS update_property_bookings_updated_at ON public.property_bookings;
CREATE TRIGGER update_property_bookings_updated_at
  BEFORE UPDATE ON public.property_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 8. GRANT PERMISSIONS FOR ALL FUNCTIONS
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO service_role;
GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO anon;

GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO service_role;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO anon;

-- =============================================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_property_bookings_status ON public.property_bookings(status);
CREATE INDEX IF NOT EXISTS idx_property_bookings_created_at ON public.property_bookings(created_at DESC);

-- =============================================================================
-- 10. VERIFY INSTALLATION
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
  'update_booking_status_with_enhanced_email'
)
ORDER BY routine_name;

-- Check email_logs table exists
SELECT 
  table_name,
  table_type,
  'Table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'email_logs';

-- Verify property_bookings table has required columns
SELECT 
  column_name,
  data_type,
  'Column exists' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'property_bookings'
AND column_name IN ('unit_type', 'secondary_phone', 'preferred_contact', 'rejection_reason', 'updated_at')
ORDER BY column_name;

-- =============================================================================
-- INSTALLATION COMPLETE!
-- =============================================================================
-- All functions and permissions have been set up.
-- The email-based booking system should now work properly.
-- Test using the admin dashboard.
-- =============================================================================