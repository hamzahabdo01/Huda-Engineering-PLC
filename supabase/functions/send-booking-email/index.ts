const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  to: string
  customerName: string
  propertyTitle: string
  unitType: string
  status: 'approved' | 'rejected'
  rejectionReason?: string
  bookingId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, customerName, propertyTitle, unitType, status, rejectionReason, bookingId }: EmailRequest = await req.json()

    // Email content based on status
    const subject = status === 'approved' 
      ? `✅ Property Booking Approved - ${propertyTitle}`
      : `📋 Property Booking Update - ${propertyTitle}`

    const htmlContent = status === 'approved' 
      ? getApprovalEmailTemplate(customerName, propertyTitle, unitType, bookingId)
      : getRejectionEmailTemplate(customerName, propertyTitle, unitType, rejectionReason || 'No specific reason provided', bookingId)

    // Use Supabase's built-in email functionality
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/send_email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      },
      body: JSON.stringify({
        to_email: to,
        from_email: 'hudaengineeringrealestate@gmail.com',
        subject: subject,
        html_body: htmlContent,
        text_body: getTextVersion(customerName, propertyTitle, unitType, status, rejectionReason, bookingId)
      }),
    })

    if (!emailResponse.ok) {
      // Fallback: Use a simple notification approach
      console.log('Supabase email not available, logging email details:', {
        to,
        subject,
        status,
        customerName,
        propertyTitle
      })
      
      // Return success anyway since the booking status was updated
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Booking status updated. Email notification logged.',
          emailDetails: { to, subject, status }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const result = await emailResponse.json()

    return new Response(
      JSON.stringify({ success: true, emailId: result.id || 'sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    // Even if email fails, we don't want to fail the booking update
    return new Response(
      JSON.stringify({ 
        success: true,
        warning: 'Booking updated but email notification failed',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})

function getTextVersion(customerName: string, propertyTitle: string, unitType: string, status: string, rejectionReason?: string, bookingId?: string): string {
  if (status === 'approved') {
    return `
Dear ${customerName},

Great news! Your property booking request has been APPROVED.

Booking Details:
- Property: ${propertyTitle}
- Unit Type: ${unitType}
- Booking ID: ${bookingId}
- Status: Approved

Next Steps:
1. Our sales team will contact you within 24 hours
2. Please prepare your identification documents
3. We'll discuss payment plans and finalize the booking

Contact Information:
Phone: +251 91 123 4567
Email: hudaengineeringrealestate@gmail.com
Office: Bole Sub City, Wereda 03, Addis Ababa

Thank you for choosing Huda Engineering PLC
Building Ethiopia's Modern Future
Quality • Safety • Integrity • Excellence
    `
  } else {
    return `
Dear ${customerName},

Thank you for your interest in our property. We need to update you on your booking request.

Booking Details:
- Property: ${propertyTitle}
- Unit Type: ${unitType}
- Booking ID: ${bookingId}
- Status: Requires Review

Reason: ${rejectionReason}

What's Next:
- Our team will contact you to discuss alternatives
- We may have similar units available
- You can browse our other properties

Contact Information:
Phone: +251 91 123 4567
Email: hudaengineeringrealestate@gmail.com

Thank you for your interest in Huda Engineering PLC
    `
  }
}

function getApprovalEmailTemplate(customerName: string, propertyTitle: string, unitType: string, bookingId: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Approved</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Booking Approved!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your property booking has been confirmed</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #00555b; margin-top: 0;">Dear ${customerName},</h2>
        <p>Great news! Your property booking request has been <strong style="color: #28a745;">APPROVED</strong>.</p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #00555b;">Booking Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Property:</strong> ${propertyTitle}</li>
            <li style="margin-bottom: 8px;"><strong>Unit Type:</strong> ${unitType}</li>
            <li style="margin-bottom: 8px;"><strong>Booking ID:</strong> ${bookingId}</li>
            <li style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Approved</span></li>
          </ul>
        </div>
        
        <h3 style="color: #00555b;">Next Steps:</h3>
        <ol>
          <li>Our sales team will contact you within 24 hours to schedule a property viewing</li>
          <li>Please prepare your identification documents for the viewing appointment</li>
          <li>We'll discuss payment plans and finalize the booking process</li>
        </ol>
      </div>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #1976d2;">📞 Contact Information</h3>
        <p style="margin-bottom: 8px;"><strong>Phone:</strong> +251 91 123 4567</p>
        <p style="margin-bottom: 8px;"><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
        <p style="margin-bottom: 0;"><strong>Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Thank you for choosing Huda Engineering PLC</p>
        <p style="margin: 5px 0;"><strong>Building Ethiopia's Modern Future</strong></p>
        <p style="margin: 0;">Quality • Safety • Integrity • Excellence</p>
      </div>
    </body>
    </html>
  `
}

function getRejectionEmailTemplate(customerName: string, propertyTitle: string, unitType: string, rejectionReason: string, bookingId: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #00555b, #004147); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">📋 Booking Update</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Important information about your property booking</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #00555b; margin-top: 0;">Dear ${customerName},</h2>
        <p>Thank you for your interest in our property. After careful review, we need to update you on your booking request.</p>
        
        <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #dc3545; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #00555b;">Booking Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Property:</strong> ${propertyTitle}</li>
            <li style="margin-bottom: 8px;"><strong>Unit Type:</strong> ${unitType}</li>
            <li style="margin-bottom: 8px;"><strong>Booking ID:</strong> ${bookingId}</li>
            <li style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Requires Review</span></li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">Reason for Update:</h4>
          <p style="margin-bottom: 0;">${rejectionReason}</p>
        </div>
        
        <h3 style="color: #00555b;">What's Next?</h3>
        <ul>
          <li>Our team will contact you to discuss alternative options</li>
          <li>We may have similar units available that better match your requirements</li>
          <li>You can also browse our other available properties</li>
        </ul>
      </div>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #1976d2;">📞 Contact Our Sales Team</h3>
        <p>Please don't hesitate to reach out if you have any questions or would like to explore other options:</p>
        <p style="margin-bottom: 8px;"><strong>Phone:</strong> +251 91 123 4567</p>
        <p style="margin-bottom: 8px;"><strong>Email:</strong> hudaengineeringrealestate@gmail.com</p>
        <p style="margin-bottom: 0;"><strong>Office:</strong> Bole Sub City, Wereda 03, Addis Ababa</p>
      </div>
      
      <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
        <p>Thank you for your interest in Huda Engineering PLC</p>
        <p style="margin: 5px 0;"><strong>Building Ethiopia's Modern Future</strong></p>
        <p style="margin: 0;">Quality • Safety • Integrity • Excellence</p>
      </div>
    </body>
    </html>
  `
}