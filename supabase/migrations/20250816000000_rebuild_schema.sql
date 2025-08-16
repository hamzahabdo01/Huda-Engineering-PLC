-- Rebuild schema and RLS policies from scratch to align with the app code
-- WARNING: This migration drops and recreates core tables and policies.
-- Backup your data before applying.

-- Enable required extensions
create extension if not exists pgcrypto;

-- Utility: Update updated_at column on row update
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Admin email constant used in default profile role
-- Adjust if you need a different admin
-- NOTE: Policies check role via profiles, not email, but profile insertion sets role based on email here

-- Clean up existing tables (drop in dependency-safe order)
-- project updates depends on projects
-- unit_stock depends on projects
-- property_bookings depends on projects
-- appointments independent
-- announcements independent
-- contact_submissions independent
-- profiles independent

-- Drop tables if exist
drop table if exists public.project_updates cascade;
drop table if exists public.unit_stock cascade;
drop table if exists public.property_bookings cascade;
drop table if exists public.appointments cascade;
drop table if exists public.announcements cascade;
drop table if exists public.projects cascade;
drop table if exists public.contact_submissions cascade;
drop table if exists public.profiles cascade;

-- Profiles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Contact submissions
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  project_type text,
  budget text,
  message text not null,
  status text not null default 'pending' check (status in ('pending','contacted','closed')),
  created_at timestamptz not null default now()
);

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  short_description text,
  location text not null,
  project_type text not null,
  status text not null default 'active' check (status in ('active','completed','upcoming')),
  start_date date,
  end_date date,
  image_url text,
  gallery_urls text[],
  "Amenities" text[],
  units jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at_column();

-- Announcements
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  short_description text,
  category text not null default 'general',
  image_url text,
  is_published boolean not null default false,
  scheduled_for timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute function public.update_updated_at_column();

-- Unit stock per property and unit type
create table public.unit_stock (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.projects(id) on delete cascade,
  unit_type text not null,
  total_units integer not null default 0 check (total_units >= 0),
  booked_units integer not null default 0 check (booked_units >= 0),
  unique(property_id, unit_type)
);

-- Property bookings (public form submission)
create table public.property_bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.projects(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  secondary_phone text,
  preferred_contact text,
  unit_type text not null,
  national_id text not null,
  move_in_date date,
  notes text,
  recaptcha_token text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Appointments (public form submission)
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text not null,
  preferred_contact text,
  secondary_phone text,
  appointment_date timestamptz not null,
  notes text,
  recaptcha_token text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

-- Project updates (used by public site)
create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  update_type text not null check (update_type in ('image','video','text')),
  media_url text,
  description text,
  created_at timestamptz not null default now()
);

-- Function: Automatically create profile on signup and set role based on email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when lower(new.email) = 'hudaengineeringrealestate@gmail.com' then 'admin' else 'user' end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check helper
create or replace function public.is_admin_user()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles where user_id = auth.uid() and role = 'admin'
  );
$$;

-- RPC to increment booked units (used by client after booking)
create or replace function public.increment_booked_units(p_property_id uuid, p_unit_type text)
returns void
language plpgsql
security definer
set search_path = public as $$
begin
  update public.unit_stock
    set booked_units = least(booked_units + 1, total_units)
  where property_id = p_property_id and unit_type = p_unit_type;

  if not found then
    insert into public.unit_stock (property_id, unit_type, total_units, booked_units)
    values (p_property_id, p_unit_type, 0, 1)
    on conflict (property_id, unit_type) do update
      set booked_units = public.unit_stock.booked_units + 1;
  end if;
end;
$$;

grant execute on function public.increment_booked_units(uuid, text) to anon, authenticated;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.projects enable row level security;
alter table public.announcements enable row level security;
alter table public.unit_stock enable row level security;
alter table public.property_bookings enable row level security;
alter table public.appointments enable row level security;
alter table public.project_updates enable row level security;

-- Drop any existing policies cleanly
-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;
drop policy if exists "Admin can update all profiles" on public.profiles;

-- Contact submissions
drop policy if exists "Anyone can submit contact forms" on public.contact_submissions;
drop policy if exists "Admins can view all contact submissions" on public.contact_submissions;
drop policy if exists "Admins can update contact submissions" on public.contact_submissions;
drop policy if exists "Admins can delete contact submissions" on public.contact_submissions;

-- Projects
drop policy if exists "Public can view all projects" on public.projects;
drop policy if exists "Admins can manage all projects" on public.projects;
drop policy if exists "Admin can insert projects" on public.projects;
drop policy if exists "Admin can update projects" on public.projects;
drop policy if exists "Admin can delete projects" on public.projects;

-- Announcements
drop policy if exists "Public can view published announcements" on public.announcements;
drop policy if exists "Admins can view all announcements" on public.announcements;
drop policy if exists "Admins can insert announcements" on public.announcements;
drop policy if exists "Admins can update announcements" on public.announcements;
drop policy if exists "Admins can delete announcements" on public.announcements;

-- Unit stock
drop policy if exists "Public can view unit stock" on public.unit_stock;
drop policy if exists "Admins can manage unit stock" on public.unit_stock;

-- Property bookings
drop policy if exists "Anyone can submit bookings" on public.property_bookings;
drop policy if exists "Admins can view all bookings" on public.property_bookings;
drop policy if exists "Admins can update bookings" on public.property_bookings;
drop policy if exists "Admins can delete bookings" on public.property_bookings;

-- Appointments
drop policy if exists "Anyone can submit appointments" on public.appointments;
drop policy if exists "Admins can view appointments" on public.appointments;
drop policy if exists "Admins can update appointments" on public.appointments;
drop policy if exists "Admins can delete appointments" on public.appointments;

-- Project updates
drop policy if exists "Public can view project updates" on public.project_updates;
drop policy if exists "Admins can manage project updates" on public.project_updates;

-- (Re)create policies
-- Profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Admin can view all profiles" on public.profiles
  for select using (public.is_admin_user());
create policy "Admin can update all profiles" on public.profiles
  for update using (public.is_admin_user());

-- Contact submissions
create policy "Anyone can submit contact forms" on public.contact_submissions
  for insert with check (true);
create policy "Admins can view all contact submissions" on public.contact_submissions
  for select using (public.is_admin_user());
create policy "Admins can update contact submissions" on public.contact_submissions
  for update using (public.is_admin_user());
create policy "Admins can delete contact submissions" on public.contact_submissions
  for delete using (public.is_admin_user());

-- Projects
create policy "Public can view all projects" on public.projects
  for select using (true);
create policy "Admin can insert projects" on public.projects
  for insert with check (public.is_admin_user());
create policy "Admin can update projects" on public.projects
  for update using (public.is_admin_user());
create policy "Admin can delete projects" on public.projects
  for delete using (public.is_admin_user());

-- Announcements
create policy "Public can view published announcements" on public.announcements
  for select using (is_published = true);
create policy "Admins can view all announcements" on public.announcements
  for select using (public.is_admin_user());
create policy "Admins can insert announcements" on public.announcements
  for insert with check (public.is_admin_user());
create policy "Admins can update announcements" on public.announcements
  for update using (public.is_admin_user());
create policy "Admins can delete announcements" on public.announcements
  for delete using (public.is_admin_user());

-- Unit stock (public read; admin manage)
create policy "Public can view unit stock" on public.unit_stock
  for select using (true);
create policy "Admins can manage unit stock" on public.unit_stock
  for all using (public.is_admin_user()) with check (public.is_admin_user());

-- Property bookings
create policy "Anyone can submit bookings" on public.property_bookings
  for insert with check (true);
create policy "Admins can view all bookings" on public.property_bookings
  for select using (public.is_admin_user());
create policy "Admins can update bookings" on public.property_bookings
  for update using (public.is_admin_user());
create policy "Admins can delete bookings" on public.property_bookings
  for delete using (public.is_admin_user());

-- Appointments
create policy "Anyone can submit appointments" on public.appointments
  for insert with check (true);
create policy "Admins can view appointments" on public.appointments
  for select using (public.is_admin_user());
create policy "Admins can update appointments" on public.appointments
  for update using (public.is_admin_user());
create policy "Admins can delete appointments" on public.appointments
  for delete using (public.is_admin_user());

-- Project updates
create policy "Public can view project updates" on public.project_updates
  for select using (true);
create policy "Admins can manage project updates" on public.project_updates
  for all using (public.is_admin_user()) with check (public.is_admin_user());

-- Helpful indexes
create index if not exists idx_contact_submissions_created_at on public.contact_submissions(created_at desc);
create index if not exists idx_property_bookings_created_at on public.property_bookings(created_at desc);
create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_announcements_created_at on public.announcements(created_at desc);
create index if not exists idx_announcements_published on public.announcements(is_published);
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_appointments_created_at on public.appointments(created_at desc);
create index if not exists idx_project_updates_created_at on public.project_updates(created_at desc);

-- Done