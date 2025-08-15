# Email Notification Setup Instructions (Supabase Native)

## 📧 Supabase Email Integration

The booking approval/rejection email functionality has been updated to use Supabase's built-in email capabilities, which is much simpler and more reliable.

## 🔧 Setup Steps

### 1. Enable Supabase Email (If Available)

Supabase provides built-in email functionality that doesn't require external API keys or configuration. The edge function will automatically use Supabase's email service.

### 2. Configure Gmail Integration (Alternative)

If you want to use Gmail specifically, you can configure SMTP settings:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Add to Supabase Secrets:**
   - Go to your Supabase Dashboard → Edge Functions → Settings
   - Add these secrets:
     - `GMAIL_USER`: hudaengineeringrealestate@gmail.com
     - `GMAIL_PASS`: Your generated app password

### 3. Test the Email Functionality

1. Go to your admin dashboard
2. Find a pending property booking
3. Click "Approve" or "Reject"
4. The system will automatically send emails using Supabase's email service

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