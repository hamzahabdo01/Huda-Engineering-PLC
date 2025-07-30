# How to Apply Database Migrations

## 🚨 Critical: You need to apply these migrations to fix the issues

The 400 error you're experiencing when adding projects is due to database constraint issues that can only be fixed by applying the migration files I created.

## 📋 Migrations to Apply

1. `supabase/migrations/20250102000004_fix_rls_policies.sql` - Fixes RLS policies
2. `supabase/migrations/20250102000005_fix_projects_status_constraint.sql` - Fixes project creation

## 🔧 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `whoucxegvwognqwpzxow`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply First Migration**
   - Copy the entire content of `supabase/migrations/20250102000004_fix_rls_policies.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Apply Second Migration**
   - Copy the entire content of `supabase/migrations/20250102000005_fix_projects_status_constraint.sql`
   - Paste it into a new query
   - Click "Run" to execute

### Option 2: Supabase CLI (If you have it installed)

```bash
# If you have Supabase CLI installed
supabase db push
```

## ✅ What These Migrations Fix

### Migration 1: RLS Policies
- ✅ Properly secures admin-only data
- ✅ Allows public access to projects and published announcements
- ✅ Enables public form submissions
- ✅ Fixes authentication-based access control

### Migration 2: Project Status Constraint
- ✅ Fixes the 400 error when creating projects
- ✅ Updates valid status values to: `planning`, `active`, `completed`, `upcoming`, `on-hold`
- ✅ Sets default status to `planning`
- ✅ Includes constraint validation test

## 🧪 How to Verify It Worked

After applying the migrations:

1. **Test Project Creation**
   - Go to your admin dashboard
   - Try to add a new project
   - It should work without the 400 error

2. **Test RLS Policies**
   - Log out of admin dashboard
   - Try to access admin data (should be blocked)
   - Public website should still work

## 🆘 If You Need Help

If you encounter any issues applying the migrations:

1. **Check the Supabase Dashboard Logs**
   - Go to "Logs" section in Supabase Dashboard
   - Look for any error messages

2. **Common Issues**
   - **Permission errors**: Make sure you're logged in as the project owner
   - **Syntax errors**: Copy the migration files exactly as they are
   - **Constraint conflicts**: The migrations handle dropping existing constraints

3. **Contact Support**
   - If migrations fail, you can reach out to Supabase support
   - Or share the error message for further assistance

## 🎯 Expected Results

After applying both migrations:
- ✅ Admin dashboard project creation will work
- ✅ RLS policies will properly secure your data
- ✅ Public website will continue to function
- ✅ Form submissions will work
- ✅ Dashboard will show proper data access control