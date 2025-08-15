-- =============================================================================
-- DATABASE STATE VERIFICATION SCRIPT
-- =============================================================================
-- Run this script to check the current state of your database
-- This will help identify what needs to be fixed

-- =============================================================================
-- 1. CHECK CURRENT TABLE STRUCTURE
-- =============================================================================

-- Check if property_bookings table exists and its structure
SELECT 
  'property_bookings table' as check_item,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_bookings' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'Check if property_bookings table exists' as description;

-- Show all columns in property_bookings table
SELECT 
  'property_bookings columns' as check_item,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'property_bookings'
ORDER BY ordinal_position;

-- =============================================================================
-- 2. CHECK MISSING COLUMNS
-- =============================================================================

-- Check for required columns that might be missing
SELECT 
  'Missing columns check' as check_item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'unit_type') 
    THEN 'unit_type: EXISTS' 
    ELSE 'unit_type: MISSING' 
  END as unit_type_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'secondary_phone') 
    THEN 'secondary_phone: EXISTS' 
    ELSE 'secondary_phone: MISSING' 
  END as secondary_phone_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'preferred_contact') 
    THEN 'preferred_contact: EXISTS' 
    ELSE 'preferred_contact: MISSING' 
  END as preferred_contact_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'rejection_reason') 
    THEN 'rejection_reason: EXISTS' 
    ELSE 'rejection_reason: MISSING' 
  END as rejection_reason_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_bookings' AND column_name = 'updated_at') 
    THEN 'updated_at: EXISTS' 
    ELSE 'updated_at: MISSING' 
  END as updated_at_status;

-- =============================================================================
-- 3. CHECK EMAIL LOGS TABLE
-- =============================================================================

-- Check if email_logs table exists
SELECT 
  'email_logs table' as check_item,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_logs' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'Check if email_logs table exists' as description;

-- Show email_logs table structure if it exists
SELECT 
  'email_logs columns' as check_item,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'email_logs'
ORDER BY ordinal_position;

-- =============================================================================
-- 4. CHECK REQUIRED FUNCTIONS
-- =============================================================================

-- Check if required functions exist
SELECT 
  'Required functions' as check_item,
  routine_name,
  CASE 
    WHEN routine_definition IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'send_enhanced_booking_email',
  'update_booking_status_with_enhanced_email',
  'update_updated_at_column'
)
ORDER BY routine_name;

-- =============================================================================
-- 5. CHECK TRIGGERS
-- =============================================================================

-- Check if updated_at trigger exists
SELECT 
  'updated_at trigger' as check_item,
  trigger_name,
  CASE 
    WHEN trigger_name IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'property_bookings'
AND trigger_name = 'update_property_bookings_updated_at';

-- =============================================================================
-- 6. CHECK RLS POLICIES
-- =============================================================================

-- Check RLS policies for property_bookings
SELECT 
  'RLS policies' as check_item,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'property_bookings';

-- =============================================================================
-- 7. CHECK INDEXES
-- =============================================================================

-- Check if performance indexes exist
SELECT 
  'Performance indexes' as check_item,
  indexname,
  CASE 
    WHEN indexname IS NOT NULL THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'property_bookings'
AND indexname IN (
  'idx_property_bookings_status',
  'idx_property_bookings_created_at'
);

-- =============================================================================
-- 8. CHECK SAMPLE DATA
-- =============================================================================

-- Check if there are any bookings in the table
SELECT 
  'Sample data' as check_item,
  COUNT(*) as total_bookings,
  CASE 
    WHEN COUNT(*) > 0 THEN 'HAS DATA' 
    ELSE 'NO DATA' 
  END as data_status
FROM public.property_bookings;

-- Show sample booking if exists
SELECT 
  'Sample booking data' as check_item,
  id,
  property_id,
  full_name,
  email,
  phone,
  status,
  created_at
FROM public.property_bookings 
LIMIT 1;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This script will show you exactly what needs to be fixed in your database
-- Run the SUPABASE_FIX_SCRIPT.sql after reviewing these results
-- =============================================================================