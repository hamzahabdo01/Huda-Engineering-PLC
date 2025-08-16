# Deploy Email Functions

This guide explains how to deploy the email notification functions to fix the CORS issue.

## Quick Fix Steps

### 1. Deploy the Simple Function (For Testing)

```bash
# Deploy the simplified function first to test CORS
supabase functions deploy send-booking-notification-simple
```

### 2. Test the Simple Function

After deployment, try approving/rejecting a booking in the admin dashboard. This simplified version will:
- Log all requests to help debug
- Simulate email sending (no actual emails sent)
- Confirm CORS is working

### 3. Deploy the Full Function (When Ready)

Once the simple function works, deploy the full version:

```bash
# Set up environment variables first
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Deploy the full function
supabase functions deploy send-booking-notification
```

Then update the admin dashboard to use the full function:

```typescript
// In AdminDashboard.tsx, change back to:
const { data, error: emailError } = await supabase.functions.invoke('send-booking-notification', {
```

## Environment Variables

Set these in your Supabase project:

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_your_resend_api_key

# Verify secrets are set
supabase secrets list
```

## Function URLs

After deployment, your functions will be available at:
- Simple: `https://your-project.supabase.co/functions/v1/send-booking-notification-simple`
- Full: `https://your-project.supabase.co/functions/v1/send-booking-notification`

## Debugging CORS Issues

If you still get CORS errors:

1. **Check function logs:**
   ```bash
   supabase functions logs send-booking-notification-simple
   ```

2. **Test with curl:**
   ```bash
   curl -X OPTIONS \
     -H "Origin: https://huda-engineering-plc.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: authorization,x-client-info,apikey,content-type" \
     https://your-project.supabase.co/functions/v1/send-booking-notification-simple
   ```

3. **Check response headers:**
   The response should include:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
   ```

## Common Issues

### Issue: "It does not have HTTP ok status"
- **Cause**: Function returning non-200 status for OPTIONS request
- **Fix**: Ensure OPTIONS handler returns status 200

### Issue: "Missing environment variables"
- **Cause**: RESEND_API_KEY not set
- **Fix**: Use `supabase secrets set RESEND_API_KEY=your_key`

### Issue: "Function not found"
- **Cause**: Function not deployed
- **Fix**: Run `supabase functions deploy function-name`

## Testing Checklist

✅ Simple function deploys without errors
✅ OPTIONS request returns 200 status
✅ POST request processes successfully
✅ Function logs show expected behavior
✅ No CORS errors in browser console
✅ Environment variables are set
✅ Full function works with real email sending

Once the simple function works, you can confidently deploy and use the full email notification system!