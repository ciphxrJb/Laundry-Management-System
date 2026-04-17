-- Enforce simplified account model:
-- one owner and one staff account per shop.

create unique index if not exists uq_one_owner_per_shop
on public.memberships (shop_id)
where role = 'owner' and shop_id is not null;

create unique index if not exists uq_one_staff_per_shop
on public.memberships (shop_id)
where role = 'staff' and shop_id is not null;
