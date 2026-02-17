-- Create hero_slides table
create table if not exists hero_slides (
  id uuid default gen_random_uuid() primary key,
  title text,
  subtitle text,
  tag text, -- Added tag field as seen in current homepage
  image_url text,
  video_url text,
  cta_text text,
  cta_link text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table hero_slides enable row level security;

-- Policies
create policy "Public can view active slides" on hero_slides
  for select using (true);

create policy "Authenticated users can manage slides" on hero_slides
  for all using (auth.role() = 'authenticated');

-- Create storage bucket for hero assets if not exists
insert into storage.buckets (id, name, public)
values ('hero-assets', 'hero-assets', true)
on conflict (id) do nothing;

create policy "Public Access Hero Assets" on storage.objects
  for select using ( bucket_id = 'hero-assets' );

create policy "Authenticated Upload Hero Assets" on storage.objects
  for insert using ( bucket_id = 'hero-assets' and auth.role() = 'authenticated' );

create policy "Authenticated Update Hero Assets" on storage.objects
  for update using ( bucket_id = 'hero-assets' and auth.role() = 'authenticated' );

create policy "Authenticated Delete Hero Assets" on storage.objects
  for delete using ( bucket_id = 'hero-assets' and auth.role() = 'authenticated' );
