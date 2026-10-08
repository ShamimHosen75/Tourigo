-- =====================================================================
-- Travel site — Supabase schema
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query.
-- Then run supabase/seed.sql to load the demo content.
-- Safe to re-run: it drops and recreates the tables (all data is lost!).
-- =====================================================================

create extension if not exists "pgcrypto";

drop table if exists public.bookings cascade;
drop table if exists public.enquiries cascade;
drop table if exists public.package_batches cascade;
drop table if exists public.packages cascade;
drop table if exists public.categories cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.faqs cascade;
drop table if exists public.gallery_items cascade;
drop table if exists public.blog_posts cascade;

-- ---------- content tables (public read) ----------

create table public.categories (
  slug          text primary key,
  title         text not null,
  display_title text,
  description   text,
  image_url     text,                       -- leave null to use generated artwork
  scene         text not null default 'hills',
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);

create table public.packages (
  slug              text primary key,
  title             text not null,
  tagline           text,
  category_slug     text not null references public.categories(slug) on update cascade,
  region            text,
  level             text not null check (level in ('Beginner','Moderate','Challenging')),
  duration_days     int  not null check (duration_days > 0),
  duration_nights   int  not null default 0,
  altitude          text,
  age_group         text default 'Open for all',
  gender            text default 'Both',
  price             numeric(10,2) not null check (price >= 0),   -- BDT
  original_price    numeric(10,2),
  short_description text,
  overview          jsonb not null default '[]',   -- string[]
  highlights        jsonb not null default '[]',   -- string[]
  images            jsonb not null default '[]',   -- string[] of image URLs (Supabase Storage public URLs)
  scene             text  not null default 'hills',
  inclusions        jsonb not null default '[]',
  exclusions        jsonb not null default '[]',
  things_to_carry   jsonb not null default '[]',
  itinerary         jsonb not null default '[]',   -- [{day,title,items:[{time,text}],meals,stay,duration}]
  pickup_points     jsonb not null default '[]',   -- [{id,name,detail,time,extraFee,mapUrl}]
  faqs              jsonb not null default '[]',   -- [{question,answer}]
  policies          jsonb not null default '[]',   -- [{title,body}]
  map_query         text,
  featured          boolean not null default false,
  is_published      boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.package_batches (
  id           text primary key default gen_random_uuid()::text,
  package_slug text not null references public.packages(slug) on delete cascade on update cascade,
  start_date   date not null,
  end_date     date not null,
  price        numeric(10,2) not null,
  seats_total  int not null default 20,
  seats_left   int not null default 20 check (seats_left >= 0),
  created_at   timestamptz not null default now(),
  check (end_date >= start_date)
);
create index on public.package_batches (package_slug, start_date);

create table public.testimonials (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  trip         text,
  rating       int not null default 5 check (rating between 1 and 5),
  quote        text not null,
  avatar_url   text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.faqs (
  id         text primary key default gen_random_uuid()::text,
  question   text not null,
  answer     text not null,
  category   text not null check (category in ('General','Booking','Safety','Gear','Cancellation')),
  sort_order int not null default 0
);

create table public.gallery_items (
  id         text primary key default gen_random_uuid()::text,
  title      text not null,
  location   text,
  image_url  text,
  scene      text not null default 'hills',
  sort_order int not null default 0
);

create table public.blog_posts (
  slug         text primary key,
  title        text not null,
  excerpt      text,
  body         jsonb not null default '[]',   -- string[] paragraphs
  author       text,
  published_at date not null default current_date,
  read_minutes int not null default 5,
  tags         jsonb not null default '[]',
  image_url    text,
  scene        text not null default 'hills',
  is_published boolean not null default true
);

-- ---------- submissions (public insert only) ----------

create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  package_slug      text not null references public.packages(slug) on update cascade,
  package_title     text not null,
  batch_id          text not null references public.package_batches(id),
  batch_label       text,
  travelers         int  not null check (travelers between 1 and 20),
  pickup_point_id   text,
  pickup_point_name text,
  total_amount      numeric(10,2) not null,
  full_name         text not null,
  email             text not null,
  phone             text not null,
  notes             text,
  status            text not null default 'pending' check (status in ('pending','confirmed','paid','cancelled')),
  created_at        timestamptz not null default now()
);
create index on public.bookings (created_at desc);

create table public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  reference  text not null unique,
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  status     text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz not null default now()
);

-- ---------- seat counter ----------
-- Each booking reserves seats in its batch. Runs as the table owner so the
-- anon role never needs UPDATE rights on package_batches.

create or replace function public.reserve_batch_seats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  left_now   int;
  unit_price numeric;
  pickup_fee numeric := 0;
begin
  update package_batches
     set seats_left = seats_left - new.travelers
   where id = new.batch_id
     and package_slug = new.package_slug
     and seats_left >= new.travelers
  returning seats_left, price into left_now, unit_price;

  if left_now is null then
    raise exception 'Not enough seats left in this batch';
  end if;

  select coalesce((pp->>'extraFee')::numeric, 0) into pickup_fee
    from packages pk, jsonb_array_elements(pk.pickup_points) pp
   where pk.slug = new.package_slug and pp->>'id' = new.pickup_point_id;

  -- the total is recalculated here, never trusted from the browser
  new.total_amount := greatest(0, (unit_price + coalesce(pickup_fee, 0)) * new.travelers);
  new.status := 'pending';
  return new;
end;
$$;

create trigger bookings_reserve_seats
  before insert on public.bookings
  for each row execute function public.reserve_batch_seats();

-- give seats back when a booking is cancelled from the dashboard
create or replace function public.release_batch_seats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update package_batches set seats_left = least(seats_total, seats_left + old.travelers) where id = old.batch_id;
  end if;
  return new;
end;
$$;

create trigger bookings_release_seats
  after update of status on public.bookings
  for each row execute function public.release_batch_seats();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger packages_touch before update on public.packages
  for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------

alter table public.categories      enable row level security;
alter table public.packages        enable row level security;
alter table public.package_batches enable row level security;
alter table public.testimonials    enable row level security;
alter table public.faqs            enable row level security;
alter table public.gallery_items   enable row level security;
alter table public.blog_posts      enable row level security;
alter table public.bookings        enable row level security;
alter table public.enquiries       enable row level security;

-- Anyone may read published content.
create policy "public read" on public.categories      for select using (true);
create policy "public read" on public.packages        for select using (is_published);
create policy "public read" on public.package_batches for select using (true);
create policy "public read" on public.testimonials    for select using (is_published);
create policy "public read" on public.faqs            for select using (true);
create policy "public read" on public.gallery_items   for select using (true);
create policy "public read" on public.blog_posts      for select using (is_published);

-- Visitors may only INSERT bookings/enquiries; they can never read them back.
-- View and manage them in Supabase Dashboard → Table Editor (or an admin app using the service role).
create policy "public insert" on public.bookings  for insert to anon, authenticated with check (true);
create policy "public insert" on public.enquiries for insert to anon, authenticated with check (true);

-- ---------- Storage bucket for photos ----------
-- Upload images to this bucket and paste their public URLs into image_url / images.
insert into storage.buckets (id, name, public)
values ('travel-images', 'travel-images', true)
on conflict (id) do nothing;

drop policy if exists "public read travel images" on storage.objects;
create policy "public read travel images" on storage.objects
  for select using (bucket_id = 'travel-images');
