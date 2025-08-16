# Email Notification Setup Guide

This guide explains how to set up email notifications for booking approvals/rejections using Supabase Edge Functions and Resend.

## Overview

The email notification system automatically sends professional emails to clients when their property bookings are approved or rejected. The system uses:

- **Supabase Edge Functions** for serverless email processing
- **Resend** as the email service provider (recommended for its simplicity and reliability)
- **Beautiful HTML templates** with responsive design

## Setup Instructions

### 1. Current Setup (Netlify Domain)

✅ **Good news!** The email system is already configured for your Netlify domain `huda-engineering-plc.netlify.app`. You can start using it immediately with Resend's free tier.

**Benefits of current setup:**
- No domain verification required
- Uses Resend's reliable `onboarding@resend.dev` sending domain
- Reply-to address uses your Netlify domain for branding
- 3,000 free emails per month
- Professional email templates already include your Netlify domain

### 2. Set up Resend Account

1. Visit [resend.com](https://resend.com) and create an account
2. Verify your domain or use the sandbox domain for testing
3. Create an API key from the dashboard
4. Note down your API key for the next step

### 3. Configure Supabase Environment Variables

Add the following environment variables to your Supabase project:

```bash
# In Supabase Dashboard > Settings > Edge Functions
RESEND_API_KEY=re_your_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Email Domain Configuration

**For Netlify Domain (Current Setup):**
The email function is already configured to use:
- `from: 'onboarding@resend.dev'` (Resend's free sending domain)
- `reply_to: 'noreply@huda-engineering-plc.netlify.app'` (Your Netlify domain)

**For Future Custom Domain:**
When you purchase your custom domain, update the Edge Function:

```typescript
from: 'notifications@yourcustomdomain.com', // Your verified custom domain
reply_to: 'noreply@yourcustomdomain.com',
```

### 5. Deploy the Edge Function

Deploy the email notification function to Supabase:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-booking-notification
```

### 6. Apply Database Migrations

Apply the email logs migration:

```bash
supabase db push
```

## Migrating to Custom Domain (Future)

When you purchase your custom domain, follow these steps to migrate:

### 1. Domain Verification

1. **Add your domain to Resend:**
   - Go to Resend dashboard > Domains
   - Add your custom domain (e.g., `hudaengineering.com`)
   - Add the required DNS records to your domain provider

2. **Verify domain ownership:**
   - Add TXT records for domain verification
   - Wait for verification (usually takes a few minutes)

### 2. Update Email Function

Update the Edge Function with your custom domain:

```typescript
// In supabase/functions/send-booking-notification/index.ts
body: JSON.stringify({
  from: 'notifications@yourcustomdomain.com', // Your verified domain
  to: [recipient_email],
  subject: emailContent.subject,
  html: emailContent.html,
  reply_to: 'noreply@yourcustomdomain.com',
}),
```

### 3. Update Email Templates

Update contact information in the email templates:

```typescript
// Replace all instances of huda-engineering-plc.netlify.app with your custom domain
<li>📧 Email: info@yourcustomdomain.com</li>
<li>🌐 Website: <a href="https://yourcustomdomain.com">yourcustomdomain.com</a></li>
```

### 4. Redeploy Function

```bash
supabase functions deploy send-booking-notification
```

### 5. Benefits of Custom Domain

- **Professional appearance**: Emails from `notifications@hudaengineering.com`
- **Better deliverability**: Custom domains often have better inbox rates
- **Brand consistency**: Matches your website domain
- **Custom email addresses**: Can set up `info@`, `support@`, etc.

## Alternative Email Services

### Using SendGrid

If you prefer SendGrid over Resend, modify the Edge Function:

```typescript
const sendgridApiKey = Denv.get('SENDGRID_API_KEY')
const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sendgridApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: recipient_email }],
      subject: emailContent.subject
    }],
    from: { email: 'noreply@huda-engineering-plc.netlify.app' }, // Using your Netlify domain
    reply_to: { email: 'noreply@huda-engineering-plc.netlify.app' },
    content: [{
      type: 'text/html',
      value: emailContent.html
    }]
  }),
})
```

### Using Gmail SMTP

For Gmail SMTP, you'll need to use a more complex setup with OAuth2 or App Passwords:

```typescript
// This requires additional libraries for SMTP
import { SMTPClient } from "https://deno.land/x/smtp/mod.ts";

const client = new SMTPClient({
  connection: {
    hostname: "smtp.gmail.com",
    port: 587,
    tls: true,
    auth: {
      username: "your-email@gmail.com",
      password: "your-app-password", // Use App Password, not regular password
    },
  },
});
```

## Email Template Customization

The email templates include:

- **Professional design** with your brand colors
- **Responsive layout** for mobile devices
- **Status-specific content** (approved vs rejected)
- **Next steps information** for approved bookings
- **Contact information** and branding

To customize the templates, modify the `generateEmailContent` function in the Edge Function.

## Testing

### Test the Email Function

```bash
# Test the function locally
supabase functions serve send-booking-notification

# Send a test request
curl -X POST http://localhost:54321/functions/v1/send-booking-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "booking_id": "test-id",
    "status": "approved",
    "recipient_email": "test@example.com",
    "full_name": "Test User",
    "property_id": "Property 1",
    "unit_type": "2B"
  }'
```

## Email Logs

All sent emails are logged in the `email_logs` table for tracking and debugging:

- **booking_id**: Reference to the property booking
- **recipient_email**: Email address where notification was sent
- **status**: Booking status (approved/rejected)
- **email_id**: Email service provider's ID for the sent email
- **sent_at**: Timestamp when email was sent

## Security Considerations

1. **API Keys**: Store all API keys as environment variables, never in code
2. **RLS Policies**: Email logs are protected by Row Level Security
3. **CORS**: The Edge Function includes proper CORS headers
4. **Error Handling**: Failed emails don't prevent booking status updates

## Troubleshooting

### Common Issues

1. **Email not sending**: Check API key and domain verification
2. **Function timeout**: Increase function timeout in Supabase dashboard
3. **CORS errors**: Ensure proper CORS headers in the function
4. **Database errors**: Check RLS policies and table permissions

### Debug Steps

1. Check Supabase Function logs in the dashboard
2. Verify environment variables are set correctly
3. Test email service API independently
4. Check email_logs table for error messages

## Production Considerations

1. **Domain Verification**: Use a verified domain for better deliverability
2. **Rate Limiting**: Implement rate limiting to prevent spam
3. **Email Templates**: Test templates across different email clients
4. **Monitoring**: Set up monitoring for email delivery rates
5. **Fallback**: Consider a fallback email service for reliability

## Cost Estimation

- **Resend**: $0.40 per 1,000 emails (first 3,000 free monthly)
- **SendGrid**: $14.95/month for 40,000 emails
- **Supabase Edge Functions**: $2 per 1M function invocations

The email notification system is now ready to provide professional communication with your clients!