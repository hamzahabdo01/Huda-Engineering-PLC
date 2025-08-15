# Database Migration & Permission Fix

## Issues Identified:
1. ❌ Permission denied for table users
2. ❌ RPC function `send_enhanced_booking_email` not found
3. ❌ Email logs table may not exist

## Quick Fixes Required:

### 1. Apply Database Migrations

The enhanced email system migrations need to be applied to your Supabase database.

**Apply these migrations in Supabase SQL Editor:**

```sql
-- First, apply the enhanced email system migration
-- Copy and paste the content from: /supabase/migrations/20250118000001_enhanced_email_system.sql
```

### 2. Fix Email Logs Table Permissions

The email_logs table might have RLS enabled or missing permissions:

```sql
-- Fix email_logs permissions
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own logs
CREATE POLICY "Users can view email logs" ON public.email_logs
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert email logs
CREATE POLICY "Service can insert email logs" ON public.email_logs
FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
```

### 3. Ensure RPC Functions Exist

```sql
-- Verify RPC functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%booking_email%';
```

## Step-by-Step Fix:

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor

### Step 2: Apply Enhanced Email Migration
Copy and paste this complete migration: