import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🔧 Debug function called with method:', req.method)
  console.log('🔧 Request headers:', JSON.stringify([...req.headers.entries()], null, 2))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS request')
    return new Response('ok', { 
      headers: corsHeaders, 
      status: 200 
    })
  }

  try {
    console.log('📨 Processing POST request')
    
    let requestBody
    try {
      requestBody = await req.json()
      console.log('📨 Request body received:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const { booking_id, status, recipient_email, full_name, property_id, unit_type } = requestBody

    // Validate required fields
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
      )
    }

    console.log('✅ All required fields present')
    console.log(`📧 Would send email to: ${recipient_email}`)
    console.log(`👤 Customer: ${full_name}`)
    console.log(`🏠 Property: ${property_id} (${unit_type || 'N/A'})`)
    console.log(`📋 Status: ${status}`)

    // Simulate successful processing
    const responseData = {
      success: true,
      message: 'Email notification would be sent successfully',
      email_details: {
        to: recipient_email,
        subject: `🏠 Your Property Booking ${status === 'approved' ? 'Has Been Approved!' : 'Status Update'} - ${property_id}`,
        customer: full_name,
        property: property_id,
        unit_type: unit_type || 'Standard',
        status: status
      },
      timestamp: new Date().toISOString()
    }

    console.log('✅ Returning success response:', JSON.stringify(responseData, null, 2))

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})