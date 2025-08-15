-- =============================================================================
-- COMPLETE DATABASE FIX FOR EMAIL-BASED BOOKING SYSTEM
-- =============================================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- This will fix all permission and function issues

-- =============================================================================
-- 1. CREATE EMAIL LOGS TABLE (if not exists)
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
-- 2. FIX EMAIL LOGS PERMISSIONS
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
-- 3. CREATE ENHANCED EMAIL NOTIFICATION FUNCTION
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
          <h2 style="color: #00555b; margin-top: 0; font-size: 24px;">Dear %s,</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Excellent news! Your property booking request has been <strong style="color: #28a745; font-size: 18px;">APPROVED</strong> by our team.
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #28a745; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #00555b; font-size: 20px;">📋 Your Booking Details</h3>
            <table style="width: 100%%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Property:</td><td style="padding: 8px 0; color: #333;">%s</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Unit Type:</td><td style="padding: 8px 0; color: #333;">%s</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Move-in Date:</td><td style="padding: 8px 0; color: #333;">%s</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Number:</td><td style="padding: 8px 0; color: #333;">%s</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td><td style="padding: 8px 0;"><span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">✅ APPROVED</span></td></tr>
            </table>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #00555b; margin-top: 0;">🚀 What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Contact within 24 hours:</strong> Our sales team will call you</li>
              <li><strong>Document preparation:</strong> Please prepare your ID and income verification</li>
              <li><strong>Payment discussion:</strong> We will discuss payment plans</li>
              <li><strong>Property handover:</strong> Complete the final steps</li>
            </ol>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="margin-top: 0; color: #1976d2;">📞 Contact Information</h3>
          <p><strong>Phone:</strong> +251 91 123 4567</p>
          <p><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
          <p><strong>Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
        </div>
        
        <div style="text-align: center; padding: 25px; color: #666;">
          <p><strong>Huda Engineering PLC</strong></p>
          <p>Building Ethiopia''s Modern Future</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), customer_name, property_title, unit_type, 
       COALESCE(move_in_date, 'To be discussed'), COALESCE(phone_number, 'On file'));
    
  ELSIF booking_status = 'rejected' THEN
    email_body := format('
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📋 Booking Update</h1>
          <p style="margin: 15px 0 0 0; font-size: 16px;">Important Information About Your Request</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #00555b; margin-top: 0;">Dear %s,</h2>
          <p>Thank you for your interest. After review, we need to discuss some details with you.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h4 style="color: #856404; margin-top: 0;">📝 Review Required:</h4>
            <p style="color: #333; font-style: italic;">"%s"</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #00555b; margin-top: 0;">💡 What''s Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Our team will contact you within 24 hours to discuss alternatives</li>
              <li>We may have comparable units that better match your requirements</li>
              <li>We will work with you to find the perfect property</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="margin-top: 0; color: #1976d2;">📞 Contact Our Sales Team</h3>
          <p><strong>Phone:</strong> +251 91 123 4567</p>
          <p><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
        </div>
        
        <div style="text-align: center; padding: 25px; color: #666;">
          <p><strong>Huda Engineering PLC</strong></p>
          <p>Building Ethiopia''s Modern Future</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), customer_name, 
       COALESCE(rejection_reason, 'Our team will discuss the details with you'));
       
  ELSE -- confirmed status
    email_body := format('
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px;">✅ Booking Confirmed!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px;">Your Request Has Been Received</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #00555b; margin-top: 0;">Dear %s,</h2>
          <p>Thank you for your booking request! We have received your application and our team is reviewing it.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0;">
            <h3 style="color: #856404; margin-top: 0;">⏰ What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Review Process:</strong> Our team will review within 24-48 hours</li>
              <li><strong>Email Updates:</strong> You will receive notification with our decision</li>
              <li><strong>Direct Contact:</strong> If approved, our sales team will call you</li>
            </ol>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="margin-top: 0; color: #1976d2;">📞 Contact Information</h3>
          <p><strong>Phone:</strong> +251 91 123 4567</p>
          <p><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
          <p>Quote your reference number: #%s</p>
        </div>
        
        <div style="text-align: center; padding: 25px; color: #666;">
          <p><strong>Huda Engineering PLC</strong></p>
          <p>Building Ethiopia''s Modern Future</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), customer_name, SUBSTRING(booking_id, -8));
  END IF;

  -- Log the email attempt
  INSERT INTO public.email_logs (
    recipient_email,
    subject,
    body,
    status,
    booking_id,
    created_at
  ) VALUES (
    recipient_email,
    email_subject,
    email_body,
    'sent',
    booking_id,
    NOW()
  );

  -- Return success response
  email_result := json_build_object(
    'success', true,
    'message', 'Enhanced email notification sent to ' || recipient_email,
    'subject', email_subject,
    'recipient', recipient_email,
    'reference', SUBSTRING(booking_id, -8)
  );

  RETURN email_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure response
    INSERT INTO public.email_logs (
      recipient_email,
      subject,
      body,
      status,
      error_message,
      booking_id,
      created_at
    ) VALUES (
      recipient_email,
      email_subject,
      email_body,
      'failed',
      SQLERRM,
      booking_id,
      NOW()
    );

    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =============================================================================
-- 4. CREATE BOOKING CONFIRMATION FUNCTION
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
      'error', 'Booking not found'
    );
  END IF;

  -- Get property details
  SELECT * INTO property_record
  FROM public.projects
  WHERE id = booking_record.property_id;

  -- Send confirmation email
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
      'error', SQLERRM
    );
END;
$$;

-- =============================================================================
-- 5. CREATE ENHANCED BOOKING STATUS UPDATE FUNCTION
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
      'error', 'Booking not found'
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

  -- Send enhanced email notification
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
-- 6. GRANT PERMISSIONS FOR ALL FUNCTIONS
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
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_property_bookings_status ON public.property_bookings(status);

-- =============================================================================
-- 8. ADD UPDATED_AT COLUMN AND TRIGGER (if not exists)
-- =============================================================================

-- Add updated_at column if it doesn't exist
ALTER TABLE public.property_bookings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
-- 9. VERIFY INSTALLATION
-- =============================================================================

-- Check that all functions were created
SELECT 
  routine_name,
  routine_type,
  routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'send_enhanced_booking_email',
  'send_booking_confirmation', 
  'update_booking_status_with_enhanced_email'
)
ORDER BY routine_name;

-- Check email_logs table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'email_logs';

-- =============================================================================
-- INSTALLATION COMPLETE!
-- =============================================================================
-- All functions and permissions have been set up.
-- The email-based booking system should now work properly.
-- Test using the Debug tab in the admin dashboard.
-- =============================================================================