-- Tighten RLS policies for shop isolation
-- Run after Phase 1 backend enforcement is complete

-- Drop broad policies
drop policy if exists "authenticated read customers" on public.laundry_customers;
drop policy if exists "authenticated write customers" on public.laundry_customers;
drop policy if exists "authenticated read orders" on public.laundry_orders;
drop policy if exists "authenticated write orders" on public.laundry_orders;

-- Create shop-scoped policies
create policy "shop_member_read_customers"
on public.laundry_customers
for select to authenticated
using (
  exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and shop_id = laundry_customers.shop_id
  )
);

create policy "shop_member_write_customers"
on public.laundry_customers
for all to authenticated
using (
  exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and shop_id = laundry_customers.shop_id
  )
)
with check (
  exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and shop_id = laundry_customers.shop_id
  )
);

create policy "shop_member_read_orders"
on public.laundry_orders
for select to authenticated
using (
  exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and shop_id = laundry_orders.shop_id
  )
);

create policy "shop_member_write_orders"
on public.laundry_orders
for all to authenticated
using (
  exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and shop_id = laundry_orders.shop_id
  )
)
with check (
  exists (
    select 1 from public.memberships
    where user_id = auth.uid()
    and shop_id = laundry_orders.shop_id
  )
);