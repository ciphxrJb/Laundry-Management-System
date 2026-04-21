-- Domain tables to replace KV-backed order/customer storage.
-- This migration is backward-compatible with current API (repo falls back to KV if tables are absent).

create table if not exists public.laundry_customers (
  id text primary key,
  shop_id uuid references public.shops(id) on delete set null,
  name text not null,
  phone text,
  first_visit timestamptz not null default now(),
  last_visit timestamptz not null default now(),
  total_orders integer not null default 0,
  total_spent numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.laundry_orders (
  id text primary key,
  shop_id uuid references public.shops(id) on delete set null,
  customer_id text not null references public.laundry_customers(id) on delete restrict,
  customer_name text not null,
  phone text,
  service_type text not null,
  weight numeric(10,2),
  price numeric(12,2) not null check (price >= 0),
  status text not null check (status in ('Pending', 'Washing', 'Drying', 'Ready for pickup', 'Completed')),
  payment_status text not null check (payment_status in ('Paid', 'Unpaid')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_laundry_orders_created_at on public.laundry_orders (created_at desc);
create index if not exists idx_laundry_orders_customer_id on public.laundry_orders (customer_id);
create index if not exists idx_laundry_orders_shop_id on public.laundry_orders (shop_id);
create index if not exists idx_laundry_customers_last_visit on public.laundry_customers (last_visit desc);
create index if not exists idx_laundry_customers_shop_id on public.laundry_customers (shop_id);

alter table public.laundry_customers enable row level security;
alter table public.laundry_orders enable row level security;

-- Broad policies for now (authenticated read/write) to avoid blocking rollout.
-- Tighten to membership + shop-scoped policies in Phase 2/3.
create policy "authenticated read customers"
on public.laundry_customers
for select to authenticated
using (true);

create policy "authenticated write customers"
on public.laundry_customers
for all to authenticated
using (true)
with check (true);

create policy "authenticated read orders"
on public.laundry_orders
for select to authenticated
using (true);

create policy "authenticated write orders"
on public.laundry_orders
for all to authenticated
using (true)
with check (true);
