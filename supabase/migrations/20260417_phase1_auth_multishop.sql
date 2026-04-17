-- Phase 1 backend foundation for auth + role-aware multi-shop architecture.
-- Apply in Supabase SQL editor, then wire API reads/writes to these tables.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  timezone text not null default 'Asia/Manila',
  created_at timestamptz not null default now()
);

create type public.app_role as enum ('owner', 'manager', 'cashier', 'staff');

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  role public.app_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (user_id, organization_id, shop_id)
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.shops enable row level security;
alter table public.memberships enable row level security;
alter table public.profiles enable row level security;

create policy "users can view own memberships"
on public.memberships
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Organization and shop visibility follows membership.
create policy "members can view organizations"
on public.organizations
for select
to authenticated
using (
  exists (
    select 1
    from public.memberships m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
);

create policy "members can view shops"
on public.shops
for select
to authenticated
using (
  exists (
    select 1
    from public.memberships m
    where m.organization_id = shops.organization_id
      and m.user_id = auth.uid()
  )
);
