# Debug Email Function 400 Error

The Edge Function is returning a 400 error when called from the website. Let's debug this step by step.

## 🔧 Step 1: Deploy Debug Function

First, deploy the debug function to isolate the issue:

```bash
supabase functions deploy test-email-debug
```

## 🧪 Step 2: Test with Debug Function

1. **Go to your admin dashboard**
2. **Try to approve/reject a booking**
3. **Check browser console for logs**
4. **Check Supabase function logs:**
   ```bash
   supabase functions logs test-email-debug
   ```

## 🔍 Step 3: What to Look For

### In Browser Console:
- ✅ Booking data being fetched correctly
- ✅ Email payload being constructed
- ❌ Any JavaScript errors
- ❌ Network errors in DevTools

### In Function Logs:
- ✅ Function receiving POST request
- ✅ Request body being parsed correctly
- ✅ All required fields present
- ❌ Missing fields or parsing errors

## 🛠️ Step 4: Common Issues & Fixes

### Issue 1: Missing RESEND_API_KEY
**Symptoms:** 500 error about missing API key
**Fix:** 
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Issue 2: Invalid JSON in Request
**Symptoms:** 400 error about JSON parsing
**Fix:** Check the payload being sent from AdminDashboard

### Issue 3: Missing Required Fields
**Symptoms:** 400 error listing missing fields
**Fix:** Ensure all booking data is present

### Issue 4: Property ID Type Mismatch
**Symptoms:** property_id showing as null or undefined
**Fix:** Check booking table structure

## 🔧 Step 5: Deploy Full Function

Once debug function works, deploy the real one:

```bash
# Set API key if not done yet
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Deploy full function
supabase functions deploy send-booking-notification

# Update AdminDashboard.tsx to use:
# supabase.functions.invoke('send-booking-notification', {
```

## 📋 Debug Checklist

- [ ] Debug function deploys successfully
- [ ] Debug function returns 200 status
- [ ] Browser console shows correct payload
- [ ] Function logs show received data
- [ ] All required fields are present
- [ ] No CORS errors
- [ ] Real function works with API key

## 🔍 Expected Debug Output

When working correctly, you should see:

**Browser Console:**
```
📧 Sending email notification...
Booking data: {id: "...", email: "...", full_name: "...", ...}
Email payload: {booking_id: "...", status: "approved", ...}
✅ Email notification sent successfully!
Response data: {success: true, message: "...", ...}
```

**Function Logs:**
```
🔧 Debug function called with method: POST
📨 Request body received: {...}
✅ All required fields present
📧 Would send email to: customer@email.com
✅ Returning success response
```

## 🚨 If Still Getting 400 Error

1. **Check if booking exists:**
   ```sql
   SELECT * FROM property_bookings WHERE id = 'your-booking-id';
   ```

2. **Check booking data structure:**
   ```sql
   SELECT email, full_name, property_id, unit_type FROM property_bookings LIMIT 1;
   ```

3. **Test function directly in Supabase dashboard**

4. **Check for null/undefined values in booking data**

The debug function will help identify exactly where the issue is occurring!