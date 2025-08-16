import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  try {
    console.log('🔧 Function invoked with method:', req.method)
    
    // Validate request method
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        },
        status: 405
      });
    }
    let requestBody
    try {
      requestBody = await req.json()
      console.log('📨 Received request body:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { booking_id, status, recipient_email, full_name, property_id, unit_type } = requestBody

    // Validate required fields with detailed logging
    const missingFields = []
    if (!booking_id) missingFields.push('booking_id')
    if (!status) missingFields.push('status')
    if (!recipient_email) missingFields.push('recipient_email')
    if (!full_name) missingFields.push('full_name')
    if (!property_id) missingFields.push('property_id')

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing_fields: missingFields,
          received_data: requestBody
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
        status: 400
      });
    }
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    console.log(`📧 Preparing to send email to: ${recipient_email} for booking ${booking_id}`);
    console.log(`📋 Booking details: ${full_name}, ${property_id}, ${unit_type}, Status: ${status}`);
    // Generate email content based on status
    const emailContent = generateEmailContent(status, full_name, property_id, unit_type);
    // Send email using your preferred email service
    // For Gmail SMTP, you would typically use a service like Resend, SendGrid, or direct SMTP
    const emailRequest = {
      to: recipient_email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };
    // Using Resend as example (you'll need to set up Resend API key)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    console.log('🔑 Resend API key configured:', !!resendApiKey)
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY environment variable is missing')
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY environment variable is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    console.log('📤 Sending email via Resend...')
    
    const emailPayload = {
      from: 'onboarding@resend.dev', // Using Resend's free sending domain
      to: [recipient_email],
      subject: emailContent.subject,
      html: emailContent.html,
      reply_to: 'noreply@huda-engineering-plc.netlify.app', // Your Netlify domain for replies
    }
    
    console.log('📧 Email payload:', JSON.stringify(emailPayload, null, 2))


    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload),
    })

    console.log('📬 Resend response status:', resendResponse.status)

    if (!resendResponse.ok) {
      const error = await resendResponse.text()
      console.error('❌ Resend API error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: error,
          status: resendResponse.status 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    const result = await resendResponse.json()
    console.log('✅ Email sent successfully:', result)
    // Log the email sent in your database (optional)
    try {
      const { error: logError } = await supabaseClient.from('email_logs').insert({
        booking_id,
        recipient_email,
        status,
        email_id: result.id,
        sent_at: new Date().toISOString()
      });
      if (logError) {
        console.error('Failed to log email:', logError);
        // Don't fail the entire request if logging fails
      }
    } catch (logError) {
      console.error('Failed to log email:', logError);
      // Don't fail the entire request if logging fails
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      email_id: result.id
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
function generateEmailContent(status, fullName, propertyId, unitType) {
  const isApproved = status === 'approved';
  const subject = `🏠 Your Property Booking ${isApproved ? 'Has Been Approved!' : 'Status Update'} - ${propertyId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .approved { background-color: #d4edda; color: #155724; }
            .rejected { background-color: #f8d7da; color: #721c24; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 Huda Engineering Real Estate</h1>
                <p>Property Booking Update</p>
            </div>
            <div class="content">
                <p>Dear ${fullName},</p>
                
                <p>We hope this email finds you well. We're writing to update you on the status of your property booking.</p>
                
                                 <div class="details">
                     <h3>📋 Your Booking Details</h3>
                     <p><strong>🏠 Property:</strong> ${propertyId}</p>
                     <p><strong>🏠 Unit Type:</strong> ${unitType}</p>
                     <p><strong>📅 Booking Date:</strong> ${new Date().toLocaleDateString()}</p>
                     <p><strong>📋 Status:</strong> <span class="status-badge ${isApproved ? 'approved' : 'rejected'}">${status.toUpperCase()}</span></p>
                 </div>
                
                ${isApproved ? `
                    <p><strong>🎉 Congratulations!</strong> Your booking has been approved. Our team will contact you within 24 hours to discuss the next steps and schedule a property viewing.</p>
                    
                    <h4>What's Next?</h4>
                    <ul>
                        <li>Our sales representative will call you to confirm details</li>
                        <li>Schedule a property tour at your convenience</li>
                        <li>Review and finalize the booking terms</li>
                        <li>Complete the necessary documentation</li>
                    </ul>
                ` : `
                    <p>We regret to inform you that your booking request could not be approved at this time. This may be due to unit availability or other factors.</p>
                    
                    <p><strong>Don't worry!</strong> We have other excellent options available that might interest you. Our team will contact you to discuss alternative units and properties that match your requirements.</p>
                `}
                
                                 <p>If you have any questions or concerns, please don't hesitate to contact us:</p>
                 <ul>
                     <li>📞 Phone: +1-234-567-8900</li>
                     <li>📧 Email: info@huda-engineering-plc.netlify.app</li>
                     <li>🌐 Website: <a href="https://huda-engineering-plc.netlify.app" style="color: #667eea;">huda-engineering-plc.netlify.app</a></li>
                 </ul>
                
                <p>Thank you for choosing Huda Engineering Real Estate. We look forward to serving you!</p>
                
                <p>Best regards,<br>
                <strong>The Huda Engineering Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; 2024 Huda Engineering Real Estate. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  const text = `
    Dear ${fullName},

    Your property booking has been ${status}.

    Booking Details:
    - Property: ${propertyId}
    - Unit Type: ${unitType}
    - Status: ${status.toUpperCase()}

    ${isApproved ? 'Congratulations! Your booking has been approved. Our team will contact you within 24 hours to discuss the next steps.' : 'We regret to inform you that your booking request could not be approved at this time. Our team will contact you to discuss alternative options.'}

         Contact us:
     Phone: +1-234-567-8900
     Email: info@huda-engineering-plc.netlify.app
     Website: https://huda-engineering-plc.netlify.app

    Best regards,
    The Huda Engineering Team
  `;
  return {
    subject,
    html,
    text
  };
}
