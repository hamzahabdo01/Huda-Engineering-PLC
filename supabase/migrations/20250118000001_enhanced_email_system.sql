-- Enhanced email notification system for clients
-- Provides comprehensive email-based communication

-- Create enhanced email notification function with better templates
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

  -- Generate comprehensive email body
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
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 Congratulations!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Your Property Booking Has Been Approved</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #00555b; margin-top: 0; font-size: 24px;">Dear %s,</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Excellent news! Your property booking request has been <strong style="color: #28a745; font-size: 18px;">APPROVED</strong> by our team.
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #28a745; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #00555b; font-size: 20px;">📋 Your Booking Details</h3>
            <table style="width: 100%%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Property:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Unit Type:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Move-in Date:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Number:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
                <td style="padding: 8px 0;"><span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">✅ APPROVED</span></td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
            <h3 style="color: #00555b; margin-top: 0; font-size: 18px;">🚀 What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #333;">
              <li style="margin-bottom: 8px;"><strong>Contact within 24 hours:</strong> Our sales team will call you to schedule a property viewing</li>
              <li style="margin-bottom: 8px;"><strong>Document preparation:</strong> Please prepare your identification documents and income verification</li>
              <li style="margin-bottom: 8px;"><strong>Payment discussion:</strong> We''ll discuss flexible payment plans and finalize your booking</li>
              <li style="margin-bottom: 8px;"><strong>Property handover:</strong> Complete the final steps for your new home</li>
            </ol>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0; font-size: 16px;">📋 Documents to Prepare:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Valid ID (National ID or Passport)</li>
              <li>Income verification (Salary certificate or bank statements)</li>
              <li>Employment letter (if applicable)</li>
              <li>References (previous landlord or employer)</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
          <h3 style="margin-top: 0; color: #1976d2; font-size: 20px;">📞 Contact Information</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0; color: #1976d2;"><strong>📱 Phone:</strong> +251 91 123 4567</p>
              <p style="margin: 5px 0; color: #1976d2;"><strong>📧 Email:</strong> hudaengineeringrealestate@gmail.com</p>
              <p style="margin: 5px 0; color: #1976d2;"><strong>🏢 Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
            </div>
          </div>
          <div style="margin-top: 15px; padding: 15px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
            <p style="margin: 0; color: #1976d2; font-weight: bold;">💬 Preferred Contact: WhatsApp, Telegram, or Phone Call</p>
            <p style="margin: 5px 0 0 0; color: #1976d2; font-size: 14px;">Our team is available 8:00 AM - 6:00 PM, Monday to Saturday</p>
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #00555b; margin-top: 0;">💡 Important Notes</h3>
          <ul style="text-align: left; color: #666; font-size: 14px; line-height: 1.6;">
            <li>Keep this email as your booking confirmation</li>
            <li>Your booking reference number is: <strong>#%s</strong></li>
            <li>Please have this reference ready when our team contacts you</li>
            <li>If you have any questions, reply to this email or call us directly</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 25px; border-top: 2px solid #e0e0e0; color: #666; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNTU1YiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IPC90ZXh0Pgo8L3N2Zz4K" alt="Huda Engineering" style="width: 40px; height: 40px;">
          </div>
          <p style="margin: 10px 0 5px 0; font-weight: bold; color: #00555b; font-size: 16px;">Huda Engineering PLC</p>
          <p style="margin: 0; font-style: italic; color: #888;">Building Ethiopia''s Modern Future</p>
          <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">Quality • Safety • Integrity • Excellence</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), customer_name, property_title, unit_type, 
       COALESCE(move_in_date, 'To be discussed'), COALESCE(phone_number, 'On file'), SUBSTRING(booking_id, -8));
    
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
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📋 Booking Update</h1>
          <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">Important Information About Your Property Request</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #00555b; margin-top: 0; font-size: 24px;">Dear %s,</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for your interest in our property. After careful review of your booking request, we need to discuss some details with you.
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #dc3545; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #00555b; font-size: 20px;">📋 Your Booking Details</h3>
            <table style="width: 100%%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Property:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Unit Type:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Requested Move-in:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Number:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
                <td style="padding: 8px 0;"><span style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">📋 REQUIRES REVIEW</span></td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0; font-size: 18px;">📝 Review Required:</h4>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px;">
              <p style="margin: 0; color: #333; font-style: italic; font-size: 16px;">"%s"</p>
            </div>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
            <h3 style="color: #00555b; margin-top: 0; font-size: 18px;">💡 What''s Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #333;">
              <li style="margin-bottom: 8px;"><strong>Personal consultation:</strong> Our team will contact you within 24 hours to discuss alternatives</li>
              <li style="margin-bottom: 8px;"><strong>Similar options:</strong> We may have comparable units that better match your requirements</li>
              <li style="margin-bottom: 8px;"><strong>Flexible solutions:</strong> We''ll work with you to find the perfect property</li>
              <li style="margin-bottom: 8px;"><strong>New opportunities:</strong> Browse our other available properties and projects</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #2196f3;">
            <h4 style="color: #1976d2; margin-top: 0; font-size: 16px;">🏘️ Alternative Options Available:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1976d2;">
              <li>Different unit sizes in the same property</li>
              <li>Similar properties in preferred locations</li>
              <li>Flexible payment plans and terms</li>
              <li>Future availability notifications</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
          <h3 style="margin-top: 0; color: #1976d2; font-size: 20px;">📞 Contact Our Sales Team</h3>
          <p style="color: #1976d2; margin-bottom: 15px;">Please don''t hesitate to reach out. We''re here to help you find the perfect property:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0; color: #1976d2;"><strong>📱 Phone:</strong> +251 91 123 4567</p>
              <p style="margin: 5px 0; color: #1976d2;"><strong>📧 Email:</strong> hudaengineeringrealestate@gmail.com</p>
              <p style="margin: 5px 0; color: #1976d2;"><strong>🏢 Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
            </div>
          </div>
          <div style="margin-top: 15px; padding: 15px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
            <p style="margin: 0; color: #1976d2; font-weight: bold;">💬 Available: WhatsApp, Telegram, Phone, Email</p>
            <p style="margin: 5px 0 0 0; color: #1976d2; font-size: 14px;">Our team is ready to discuss your options - 8:00 AM to 6:00 PM</p>
          </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 25px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #00555b; margin-top: 0;">💡 Important Notes</h3>
          <ul style="text-align: left; color: #666; font-size: 14px; line-height: 1.6;">
            <li>Your booking reference number is: <strong>#%s</strong></li>
            <li>We value your interest and want to find you the right property</li>
            <li>Our team will contact you with alternative options</li>
            <li>Reply to this email or call us for immediate assistance</li>
          </ul>
        </div>
        
        <div style="text-align: center; padding: 25px; border-top: 2px solid #e0e0e0; color: #666; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNTU1YiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IPC90ZXh0Pgo8L3N2Zz4K" alt="Huda Engineering" style="width: 40px; height: 40px;">
          </div>
          <p style="margin: 10px 0 5px 0; font-weight: bold; color: #00555b; font-size: 16px;">Huda Engineering PLC</p>
          <p style="margin: 0; font-style: italic; color: #888;">Building Ethiopia''s Modern Future</p>
          <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">Quality • Safety • Integrity • Excellence</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), customer_name, property_title, unit_type, 
       COALESCE(move_in_date, 'To be discussed'), COALESCE(phone_number, 'On file'), 
       COALESCE(rejection_reason, 'Our team will discuss the details with you'), SUBSTRING(booking_id, -8));
       
  ELSIF booking_status = 'confirmed' THEN
    email_body := format('
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 40px 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">✅ Booking Confirmed!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Your Property Booking Request Has Been Received</p>
          <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Booking Reference: #%s</p>
          </div>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #00555b; margin-top: 0; font-size: 24px;">Dear %s,</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for your property booking request! We have successfully received your application and our team is now reviewing it.
          </p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #007bff; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #00555b; font-size: 20px;">📋 Your Booking Summary</h3>
            <table style="width: 100%%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Property:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Unit Type:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Preferred Move-in:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Contact Number:</td>
                <td style="padding: 8px 0; color: #333;">%s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Status:</td>
                <td style="padding: 8px 0;"><span style="background: #007bff; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">⏳ UNDER REVIEW</span></td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0; font-size: 18px;">⏰ What Happens Next?</h3>
            <ol style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 8px;"><strong>Review Process:</strong> Our team will review your application within 24-48 hours</li>
              <li style="margin-bottom: 8px;"><strong>Email Updates:</strong> You''ll receive an email notification with the decision</li>
              <li style="margin-bottom: 8px;"><strong>Direct Contact:</strong> If approved, our sales team will call you immediately</li>
              <li style="margin-bottom: 8px;"><strong>Next Steps:</strong> We''ll guide you through the entire process</li>
            </ol>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
            <h4 style="color: #155724; margin-top: 0; font-size: 16px;">📧 Email Notifications:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li><strong>Approved:</strong> Congratulations email with next steps</li>
              <li><strong>Needs Review:</strong> Information about alternatives and options</li>
              <li><strong>Updates:</strong> Any changes or additional information needed</li>
            </ul>
            <p style="margin: 15px 0 0 0; color: #155724; font-weight: bold;">💡 Check your email regularly for updates!</p>
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
          <h3 style="margin-top: 0; color: #1976d2; font-size: 20px;">📞 Need Assistance?</h3>
          <p style="color: #1976d2; margin-bottom: 15px;">Have questions or need to update your booking? Contact us:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 5px 0; color: #1976d2;"><strong>📱 Phone:</strong> +251 91 123 4567</p>
              <p style="margin: 5px 0; color: #1976d2;"><strong>📧 Email:</strong> hudaengineeringrealestate@gmail.com</p>
              <p style="margin: 5px 0; color: #1976d2;"><strong>🏢 Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
            </div>
          </div>
          <div style="margin-top: 15px; padding: 15px; background: rgba(33, 150, 243, 0.1); border-radius: 8px;">
            <p style="margin: 0; color: #1976d2; font-weight: bold;">💬 Available: WhatsApp, Telegram, Phone, Email</p>
            <p style="margin: 5px 0 0 0; color: #1976d2; font-size: 14px;">Quote your reference number: #%s</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 25px; border-top: 2px solid #e0e0e0; color: #666; font-size: 14px;">
          <div style="margin-bottom: 15px;">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNTU1YiIvPgo8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IPC90ZXh0Pgo8L3N2Zz4K" alt="Huda Engineering" style="width: 40px; height: 40px;">
          </div>
          <p style="margin: 10px 0 5px 0; font-weight: bold; color: #00555b; font-size: 16px;">Huda Engineering PLC</p>
          <p style="margin: 0; font-style: italic; color: #888;">Building Ethiopia''s Modern Future</p>
          <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">Quality • Safety • Integrity • Excellence</p>
        </div>
      </body>
      </html>
    ', SUBSTRING(booking_id, -8), customer_name, property_title, unit_type, 
       COALESCE(move_in_date, 'To be discussed'), COALESCE(phone_number, 'On file'), SUBSTRING(booking_id, -8));
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

-- Create function to send booking confirmation email when booking is submitted
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

-- Enhanced booking status update function
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.send_enhanced_booking_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_booking_confirmation TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking_status_with_enhanced_email TO authenticated;