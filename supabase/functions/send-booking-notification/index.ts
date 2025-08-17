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
    const { booking_id, status, recipient_email, full_name, property_id, unit_type } = requestBody;
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
    const emailContent = generateEmailContent(status, full_name, property_id, unit_type);
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
function generateEmailContent(status, fullName, propertyId, unitType) {
  const isApproved = status === 'approved';
  const subject = isApproved ? `Your Booking Has Been Approved` : `Booking Status Update`;
  const html = `
    <p>Hello ${fullName},</p>
    <p>Your booking for property ID <strong>${propertyId}</strong> (${unitType}) has been <strong>${status}</strong>.</p>
    <p>Thank you for choosing Huda Engineering.</p>
  `;
  const text = `
Hello ${fullName},

Your booking for property ID ${propertyId} (${unitType}) has been ${status}.

Thank you for choosing Huda Engineering.
  `;
  return {
    subject,
    html,
    text
  };
}
