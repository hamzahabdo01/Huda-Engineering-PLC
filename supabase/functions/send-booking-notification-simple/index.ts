import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('Function called with method:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response('ok', { 
      headers: corsHeaders, 
      status: 200 
    })
  }

  try {
    console.log('Processing POST request')
    
    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    
    const { booking_id, status, recipient_email, full_name, property_id, unit_type } = requestBody

    // Validate required fields
    if (!booking_id || !status || !recipient_email || !full_name) {
      console.log('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log('All required fields present, simulating email send...')
    console.log(`📧 Email will be sent to: ${recipient_email}`)
    console.log(`👤 Customer: ${full_name}`)
    console.log(`🏠 Property: ${property_id} (${unit_type})`)
    console.log(`📋 Status: ${status}`)

    // For now, just simulate sending email
    const emailContent = {
      to: recipient_email,
      subject: `🏠 Your Property Booking ${status === 'approved' ? 'Has Been Approved!' : 'Status Update'} - ${property_id}`,
      message: `Dear ${full_name}, your booking for ${property_id} (${unit_type}) has been ${status}.`
    }

    console.log('Email content:', emailContent)

    // Simulate successful email send
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email simulation successful',
        data: emailContent 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})