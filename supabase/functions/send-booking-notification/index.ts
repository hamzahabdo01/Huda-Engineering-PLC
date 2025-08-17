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
    console.log('🔧 Function invoked with method:', req.method);
    // Validate request method
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
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
      console.log('📨 Received request body:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
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
    // Validate required fields
    const missingFields = [];
    if (!booking_id) missingFields.push('booking_id');
    if (!status) missingFields.push('status');
    if (!recipient_email) missingFields.push('recipient_email');
    if (!full_name) missingFields.push('full_name');
    if (!property_id) missingFields.push('property_id');
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
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
    // Create Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    console.log(`📧 Preparing to send email to: ${recipient_email} for booking ${booking_id}`);
    // Generate email content based on status
    const emailContent = generateEmailContent(status, full_name, property_id, unit_type);
    // Send email using your preferred email service
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY environment variable is missing');
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
    console.log('📤 Sending email via Resend...');
    const emailPayload = {
      from: 'team@hudaengineering.com',
      to: [
        recipient_email
      ],
      subject: emailContent.subject,
      html: emailContent.html,
      reply_to: 'noreply@huda-engineering-plc.netlify.app'
    };
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });
    console.log('📬 Resend response status:', resendResponse.status);
    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('❌ Resend API error:', error);
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
    console.log('✅ Email sent successfully:', result);
    // Log the email sent in your database
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
      }
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
    console.error('Error sending email:', error);
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
  const subject = `🏠 Your Property Booking ${isApproved ? 'Has Been Approved!' : 'Status Update'} - ${propertyId}`;
  const html = `...`; // (keep your existing HTML here)
  const text = `...`; // (keep your existing text here)
  return {
    subject,
    html,
    text
  };
}
