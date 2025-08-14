# Email Notification Setup Instructions

## 🚨 Important: Email Service Configuration Required

The booking approval/rejection email functionality has been implemented, but you need to configure an email service to make it work.

## 📧 Email Service Options

### Option 1: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add the API key to your Supabase Edge Function secrets

### Option 2: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Modify the edge function to use SendGrid API

### Option 3: Gmail SMTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Modify the edge function to use SMTP

## 🔧 Setup Steps

### 1. Configure Email Service (Using Resend)

1. **Sign up for Resend:**
   - Go to [resend.com](https://resend.com)
   - Create an account
   - Verify your domain (hudaengineering.com) or use their test domain

2. **Get API Key:**
   - Go to API Keys section in Resend dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add to Supabase Secrets:**
   - Go to your Supabase Dashboard
   - Navigate to Edge Functions → Settings
   - Add a new secret:
     - Name: `RESEND_API_KEY`
     - Value: Your Resend API key

### 2. Deploy the Edge Function

The edge function is already created at `supabase/functions/send-booking-email/index.ts`. 

**Important:** Edge functions are automatically deployed in this environment, so no manual deployment is needed.

### 3. Test the Email Functionality

1. Go to your admin dashboard
2. Find a pending property booking
3. Click "Approve" or "Reject"
4. Check if the email is sent successfully

## 📋 Email Templates

### Approval Email Features:
- ✅ Professional HTML template with company branding
- ✅ Booking details (property, unit type, booking ID)
- ✅ Next steps for the customer
- ✅ Contact information
- ✅ Company footer with values

### Rejection Email Features:
- ✅ Polite and professional tone
- ✅ Clear explanation of the status update
- ✅ Rejection reason provided by admin
- ✅ Alternative options and next steps
- ✅ Contact information for follow-up

## 🔄 How It Works

1. **Admin Action:** Admin clicks "Approve" or "Reject" on a booking
2. **Database Update:** Booking status is updated in the database
3. **Email Trigger:** Edge function is called with booking details
4. **Email Sent:** Professional email is sent from `hudaengineeringrealestate@gmail.com`
5. **Confirmation:** Admin receives confirmation that email was sent

## 🛠️ Technical Implementation

### Database Changes:
- Added `rejection_reason` column to `property_bookings` table
- Added `updated_at` column with automatic timestamp updates

### Edge Function:
- Located at `supabase/functions/send-booking-email/index.ts`
- Handles both approval and rejection emails
- Uses professional HTML templates
- Includes proper error handling and CORS support

### Frontend Integration:
- Updated AdminDashboard.tsx with email notification calls
- Added rejection reason dialog for rejected bookings
- Integrated with existing booking management workflow

## 🧪 Testing Checklist

- [ ] Email service API key configured in Supabase
- [ ] Edge function deployed and accessible
- [ ] Admin can approve bookings and emails are sent
- [ ] Admin can reject bookings with reasons and emails are sent
- [ ] Email templates display correctly in email clients
- [ ] Error handling works when email service is unavailable

## 🔧 Troubleshooting

### Email Not Sending:
1. Check Supabase Edge Function logs
2. Verify API key is correctly set in secrets
3. Check email service dashboard for delivery status
4. Ensure sender email is verified with your email service

### Template Issues:
1. Test email templates in different email clients
2. Check HTML rendering in Gmail, Outlook, etc.
3. Verify all dynamic content is properly escaped

### Database Errors:
1. Apply the migration: `20250109000001_add_booking_rejection_reason.sql`
2. Check that RLS policies allow admin to update bookings
3. Verify booking status updates are working

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Review Supabase Edge Function logs
3. Test the email service API directly
4. Verify all environment variables are set correctly

---

**🎯 Your email notification system is now ready!**

Customers will receive professional email notifications when their booking requests are approved or rejected, improving communication and customer experience.