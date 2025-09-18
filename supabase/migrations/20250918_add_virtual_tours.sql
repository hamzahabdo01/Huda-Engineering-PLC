-- Create virtual_tours table to manage virtual tour videos
create table if not exists public.virtual_tours (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  room text check (room in ('bedroom','kitchen','livingroom','bathroom','balcony')) not null,
  thumbnail_url text,
  video_url text not null,
  is_published boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.virtual_tours enable row level security;

-- Policies
-- Public (anonymous) can read only published entries
drop policy if exists "Public can view published virtual tours" on public.virtual_tours;
create policy "Public can view published virtual tours" on public.virtual_tours
  for select using (is_published = true);

-- Authenticated users can manage all entries (dashboard)
drop policy if exists "Authenticated users can view all virtual tours" on public.virtual_tours;
create policy "Authenticated users can view all virtual tours" on public.virtual_tours
  for select using (auth.uid() is not null);

drop policy if exists "Authenticated users can insert virtual tours" on public.virtual_tours;
create policy "Authenticated users can insert virtual tours" on public.virtual_tours
  for insert with check (auth.uid() is not null);

drop policy if exists "Authenticated users can update virtual tours" on public.virtual_tours;
create policy "Authenticated users can update virtual tours" on public.virtual_tours
  for update using (auth.uid() is not null);

drop policy if exists "Authenticated users can delete virtual tours" on public.virtual_tours;
create policy "Authenticated users can delete virtual tours" on public.virtual_tours
  for delete using (auth.uid() is not null);


