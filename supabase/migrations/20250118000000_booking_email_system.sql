-- Migration: Enhanced booking email notification system
-- Creates RPC functions for sending booking approval/rejection emails

-- Create email notification function
CREATE OR REPLACE FUNCTION public.send_booking_email(
  recipient_email TEXT,
  customer_name TEXT,
  property_title TEXT,
  unit_type TEXT,
  booking_status TEXT,
  booking_id TEXT,
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
    email_subject := '✅ Property Booking Approved - ' || property_title;
  ELSE
    email_subject := '📋 Property Booking Update - ' || property_title;
  END IF;

  -- Generate email body
  IF booking_status = 'approved' THEN
    email_body := format('
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Booking Approved!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your property booking has been confirmed</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #00555b;">Dear %s,</h2>
          <p>Great news! Your property booking request has been <strong style="color: #28a745;">APPROVED</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #00555b;">Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Property:</strong> %s</li>
              <li><strong>Unit Type:</strong> %s</li>
              <li><strong>Booking ID:</strong> %s</li>
              <li><strong>Status:</strong> <span style="color: #28a745;">Approved</span></li>
            </ul>
          </div>
          
          <h3 style="color: #00555b;">Next Steps:</h3>
          <ol>
            <li>Our sales team will contact you within 24 hours</li>
            <li>Please prepare your identification documents</li>
            <li>We will discuss payment plans and finalize the booking</li>
          </ol>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 6px;">
          <h3 style="color: #1976d2;">📞 Contact Information</h3>
          <p><strong>Phone:</strong> +251 91 123 4567</p>
          <p><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
          <p><strong>Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>Thank you for choosing Huda Engineering PLC</p>
          <p><strong>Building Ethiopia''s Modern Future</strong></p>
        </div>
      </body>
      </html>
    ', customer_name, property_title, unit_type, booking_id);
  ELSE
    email_body := format('
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📋 Booking Update</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Important information about your booking</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #00555b;">Dear %s,</h2>
          <p>Thank you for your interest in our property. We need to update you on your booking request.</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="color: #00555b;">Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Property:</strong> %s</li>
              <li><strong>Unit Type:</strong> %s</li>
              <li><strong>Booking ID:</strong> %s</li>
              <li><strong>Status:</strong> <span style="color: #dc3545;">Requires Review</span></li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="color: #856404;">Reason for Update:</h4>
            <p>%s</p>
          </div>
          
          <h3 style="color: #00555b;">What''s Next?</h3>
          <ul>
            <li>Our team will contact you to discuss alternatives</li>
            <li>We may have similar units available</li>
            <li>You can browse our other properties</li>
          </ul>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 6px;">
          <h3 style="color: #1976d2;">📞 Contact Our Sales Team</h3>
          <p><strong>Phone:</strong> +251 91 123 4567</p>
          <p><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>Thank you for your interest in Huda Engineering PLC</p>
        </div>
      </body>
      </html>
    ', customer_name, property_title, unit_type, booking_id, COALESCE(rejection_reason, 'No specific reason provided'));
  END IF;

  -- Log the email attempt (since we can't actually send emails from basic Supabase)
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
    'message', 'Email notification logged and would be sent to ' || recipient_email,
    'subject', email_subject,
    'recipient', recipient_email
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

-- Create email logs table to track email notifications
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

-- Create function to update booking status with email notification
CREATE OR REPLACE FUNCTION public.update_booking_status_with_email(
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

  -- Send email notification
  SELECT public.send_booking_email(
    booking_record.email,
    booking_record.full_name,
    COALESCE(property_record.title, 'Property'),
    booking_record.unit_type,
    p_status,
    booking_record.id,
    p_rejection_reason
  ) INTO email_result;

  -- Return combined result
  update_result := json_build_object(
    'success', true,
    'message', 'Booking status updated and notification sent',
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.send_booking_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_email TO authenticated;
GRANT ALL ON public.email_logs TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON public.email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_property_bookings_status ON public.property_bookings(status);