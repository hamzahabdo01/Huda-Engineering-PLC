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
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 405
      });
    }
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const { booking_id, status, recipient_email, full_name, property_id, property_name, unit_type, rejection_reason } = requestBody;
    const missingFields = [];
    if (!booking_id) missingFields.push('booking_id');
    if (!status) missingFields.push('status');
    if (!recipient_email) missingFields.push('recipient_email');
    if (!full_name) missingFields.push('full_name');
    if (!property_id) missingFields.push('property_id');
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        missing_fields: missingFields
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    // Generate email content
    const emailContent = generateEmailContent(status, full_name, property_name, unit_type, rejection_reason);
    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({
        error: 'RESEND_API_KEY environment variable is required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    const emailPayload = {
      from: 'Huda-Engineering-PLC <team@hudaengineering.com>',
      to: [
        recipient_email
      ],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      reply_to: 'noreply@hudaengineering.com'
    };
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      return new Response(JSON.stringify({
        error: 'Failed to send email',
        details: error
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    const result = await resendResponse.json();
    // Log the email sent in Supabase
    try {
      const { error: logError } = await supabaseClient.from('email_logs').insert({
        booking_id,
        recipient_email,
        status,
        email_id: result.id,
        sent_at: new Date().toISOString()
      });
      if (logError) console.error('Failed to log email:', logError);
    } catch (logError) {
      console.error('Failed to log email:', logError);
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
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
function generateEmailContent(status, fullName, propertyName, unitType, rejectionReason) {
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  
  let subject, html, text;
  
  if (isApproved) {
    subject = `🏠 Your Property Booking Has Been Approved! - ${propertyName}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">🎉 Congratulations! Your Booking Has Been Approved</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Great news! Your booking request for <strong>${propertyName}</strong> (${unitType}) has been approved.</p>
        <p>Our team will be in touch with you soon to discuss the next steps and arrange a call to finalize the details.</p>
        <p>Please expect a call from us within the next few business days.</p>
        <br>
        <p><strong>Property Details:</strong></p>
        <ul>
          <li><strong>Property:</strong> ${propertyName}</li>
          <li><strong>Unit Type:</strong> ${unitType}</li>
          <li><strong>Status:</strong> Approved ✅</li>
        </ul>
        <br>
        <p>Thank you for choosing Huda Engineering. We look forward to working with you!</p>
        <br>
        <p>Best regards,<br>The Huda Engineering Team</p>
      </div>
    `;
    text = `
Congratulations! Your Booking Has Been Approved

Dear ${fullName},

Great news! Your booking request for ${propertyName} (${unitType}) has been approved.

Our team will be in touch with you soon to discuss the next steps and arrange a call to finalize the details.

Please expect a call from us within the next few business days.

Property Details:
- Property: ${propertyName}
- Unit Type: ${unitType}
- Status: Approved ✅

Thank you for choosing Huda Engineering. We look forward to working with you!

Best regards,
The Huda Engineering Team
    `;
  } else if (isRejected) {
    subject = `🏠 Your Property Booking Status Update - ${propertyName}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">📋 Your Booking Status Update</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for your interest in <strong>${propertyName}</strong> (${unitType}).</p>
        <p>After careful review, we regret to inform you that your booking request has not been approved at this time.</p>
        <br>
        <p><strong>Reason for Rejection:</strong></p>
        <p style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #dc2626; margin: 10px 0;">
          ${rejectionReason || 'No specific reason provided'}
        </p>
        <br>
        <p><strong>Property Details:</strong></p>
        <ul>
          <li><strong>Property:</strong> ${propertyName}</li>
          <li><strong>Unit Type:</strong> ${unitType}</li>
          <li><strong>Status:</strong> Rejected ❌</li>
        </ul>
        <br>
        <p>We encourage you to review the feedback provided and consider applying again in the future if your circumstances change.</p>
        <p>Thank you for your understanding and for considering Huda Engineering.</p>
        <br>
        <p>Best regards,<br>The Huda Engineering Team</p>
      </div>
    `;
    text = `
Your Booking Status Update

Dear ${fullName},

Thank you for your interest in ${propertyName} (${unitType}).

After careful review, we regret to inform you that your booking request has not been approved at this time.

Reason for Rejection:
${rejectionReason || 'No specific reason provided'}

Property Details:
- Property: ${propertyName}
- Unit Type: ${unitType}
- Status: Rejected ❌

We encourage you to review the feedback provided and consider applying again in the future if your circumstances change.

Thank you for your understanding and for considering Huda Engineering.

Best regards,
The Huda Engineering Team
    `;
  } else {
    subject = `🏠 Your Property Booking Status Update - ${propertyName}`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b7280; margin-bottom: 20px;">📋 Your Booking Status Update</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Your booking request for <strong>${propertyName}</strong> (${unitType}) has been updated to: <strong>${status}</strong></p>
        <br>
        <p><strong>Property Details:</strong></p>
        <ul>
          <li><strong>Property:</strong> ${propertyName}</li>
          <li><strong>Unit Type:</strong> ${unitType}</li>
          <li><strong>Status:</strong> ${status}</li>
        </ul>
        <br>
        <p>Thank you for choosing Huda Engineering.</p>
        <br>
        <p>Best regards,<br>The Huda Engineering Team</p>
      </div>
    `;
    text = `
Your Booking Status Update

Dear ${fullName},

Your booking request for ${propertyName} (${unitType}) has been updated to: ${status}

Property Details:
- Property: ${propertyName}
- Unit Type: ${unitType}
- Status: ${status}

Thank you for choosing Huda Engineering.

Best regards,
The Huda Engineering Team
    `;
  }
  
  return {
    subject,
    html,
    text
  };
}
