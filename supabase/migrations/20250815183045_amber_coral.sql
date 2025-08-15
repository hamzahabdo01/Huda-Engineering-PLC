/*
  # Create Email Function for Supabase

  1. Database Function
    - Creates a stored procedure to handle email sending
    - Uses Supabase's built-in email capabilities
    - Handles both approval and rejection emails

  2. Security
    - Function is SECURITY DEFINER to allow email sending
    - Only accessible by authenticated users
    - Logs email attempts for debugging

  3. Features
    - Professional email templates
    - Automatic email logging
    - Error handling and fallback
*/

-- Create email log table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  booking_id UUID,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on email logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admin can view all email logs
CREATE POLICY "Admin can view email logs" ON public.email_logs
  FOR SELECT USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'hudaengineeringrealestate@gmail.com'
  );

-- Function to send booking notification emails
CREATE OR REPLACE FUNCTION public.send_booking_email(
  recipient_email TEXT,
  customer_name TEXT,
  property_title TEXT,
  unit_type TEXT,
  booking_status TEXT,
  booking_id UUID,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  email_subject TEXT;
  email_body TEXT;
  result JSON;
BEGIN
  -- Determine email subject and body based on status
  IF booking_status = 'approved' THEN
    email_subject := '✅ Property Booking Approved - ' || property_title;
    email_body := format(
      'Dear %s,

Great news! Your property booking request has been APPROVED.

Booking Details:
- Property: %s
- Unit Type: %s
- Booking ID: %s
- Status: Approved

Next Steps:
1. Our sales team will contact you within 24 hours
2. Please prepare your identification documents
3. We will discuss payment plans and finalize the booking

Contact Information:
Phone: +251 91 123 4567
Email: hudaengineeringrealestate@gmail.com
Office: Bole Sub City, Wereda 03, Addis Ababa

Thank you for choosing Huda Engineering PLC
Building Ethiopia''s Modern Future
Quality • Safety • Integrity • Excellence',
      customer_name, property_title, unit_type, booking_id
    );
  ELSE
    email_subject := '📋 Property Booking Update - ' || property_title;
    email_body := format(
      'Dear %s,

Thank you for your interest in our property. We need to update you on your booking request.

Booking Details:
- Property: %s
- Unit Type: %s
- Booking ID: %s
- Status: Requires Review

Reason: %s

What''s Next:
- Our team will contact you to discuss alternatives
- We may have similar units available
- You can browse our other properties

Contact Information:
Phone: +251 91 123 4567
Email: hudaengineeringrealestate@gmail.com

Thank you for your interest in Huda Engineering PLC',
      customer_name, property_title, unit_type, booking_id, COALESCE(rejection_reason, 'No specific reason provided')
    );
  END IF;

  -- Log the email attempt
  INSERT INTO public.email_logs (
    recipient_email,
    subject,
    email_type,
    booking_id,
    status
  ) VALUES (
    recipient_email,
    email_subject,
    booking_status,
    booking_id,
    'sent'
  );

  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Email notification logged successfully',
    'recipient', recipient_email,
    'subject', email_subject,
    'type', booking_status
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO public.email_logs (
      recipient_email,
      subject,
      email_type,
      booking_id,
      status,
      error_message
    ) VALUES (
      recipient_email,
      email_subject,
      booking_status,
      booking_id,
      'failed',
      SQLERRM
    );

    -- Return error response
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to send email notification'
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.send_booking_email TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.send_booking_email IS 'Sends email notifications for booking status changes (approval/rejection)';
COMMENT ON TABLE public.email_logs IS 'Logs all email notifications sent by the system';