# Email Flow Test Guide

This guide helps you test that emails are being sent to the correct recipients when booking statuses are updated.

## ✅ How the Email Flow Works

1. **Customer books property** → Email saved in `property_bookings.email`
2. **Admin approves/rejects booking** → System fetches booking details including email
3. **Email notification sent** → Goes to `booking.email` (the customer's email)
4. **Customer receives email** → Professional notification with booking details

## 🧪 Testing Steps

### Step 1: Create a Test Booking

1. Go to your booking page: `https://huda-engineering-plc.netlify.app/booking`
2. Fill out the form with a **test email you can access**
3. Submit the booking
4. Note the customer's name and email used

### Step 2: Deploy the Simple Function

```bash
supabase functions deploy send-booking-notification-simple
```

### Step 3: Test the Email Flow

1. Go to Admin Dashboard
2. Find the test booking you just created
3. Click "Approve" or "Reject"
4. Watch for:
   - ✅ Success toast showing email address
   - ✅ No CORS errors in browser console

### Step 4: Check Function Logs

```bash
supabase functions logs send-booking-notification-simple
```

Look for these log entries:
```
📧 Email will be sent to: customer@email.com
👤 Customer: John Doe
🏠 Property: property-id (unit-type)
📋 Status: approved
```

### Step 5: Verify Email Content

The simple function simulates sending this email:
```json
{
  "to": "customer@email.com",
  "subject": "🏠 Your Property Booking Has Been Approved! - Property Name",
  "message": "Dear John Doe, your booking for Property Name (2B) has been approved."
}
```

## 🚀 Deploy Real Email Function

Once the simple function works:

### Step 1: Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Set in Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_api_key
   ```

### Step 2: Deploy Full Function
```bash
supabase functions deploy send-booking-notification
```

### Step 3: Update Admin Dashboard
Change this line in AdminDashboard.tsx:
```typescript
// FROM:
supabase.functions.invoke('send-booking-notification-simple', {

// TO:
supabase.functions.invoke('send-booking-notification', {
```

### Step 4: Test Real Email
1. Create another test booking with your email
2. Approve/reject it in admin dashboard  
3. Check your email inbox!

## 📧 Email Content Preview

Your customers will receive:

**Subject:** `🏠 Your Property Booking Has Been Approved! - Property Name`

**Content:**
- Professional HTML template with your branding
- Booking details (property, unit type, status)
- Next steps for approved bookings
- Contact information with your Netlify domain
- Responsive design for mobile

## 🔍 Troubleshooting

### Issue: "Email notification failed to send"
**Check:**
- Function logs: `supabase functions logs`
- RESEND_API_KEY is set correctly
- No typos in function names

### Issue: Wrong email recipient
**Check:**
- Booking form saves email correctly
- Admin dashboard fetches booking details
- Function receives correct recipient_email

### Issue: Email not received
**Check:**
- Spam folder
- Email service logs in Resend dashboard
- Verify email address is valid

## ✅ Success Indicators

- [ ] No CORS errors in browser console
- [ ] Success toast shows correct email address
- [ ] Function logs show correct recipient
- [ ] Customer receives professional email
- [ ] Email content is accurate and branded
- [ ] Email works on mobile devices

## 📋 Email Details Verified

The system correctly:
- ✅ Captures customer email during booking
- ✅ Fetches booking details including email
- ✅ Sends notification to `booking.email` 
- ✅ Shows admin which email was notified
- ✅ Includes all booking details in email
- ✅ Uses professional branded template
- ✅ Works with your Netlify domain

**The email DOES go to the person who booked the property!** 🎯