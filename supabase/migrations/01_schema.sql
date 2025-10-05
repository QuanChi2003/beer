
-- 01_schema.sql
-- Core tables

create extension if not exists pgcrypto;

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references categories(id) on delete set null,
  pos int default 0
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  cost_price numeric(12,2) not null default 0, -- only admin sees
  sale_price numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text check (discount_type in ('percent','fixed')) not null,
  value numeric(12,2) not null,
  active boolean not null default true,
  expires_at timestamptz
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'completed',
  order_type text not null check (order_type in ('dine-in','delivery')),
  table_number text,
  customer_name text,
  phone text,
  address text,
  note text,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 0,
  coupon_code text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_id uuid not null references items(id),
  qty int not null check (qty > 0),
  sale_price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  line_profit numeric(12,2) not null default 0
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  channel text not null default 'telegram',
  payload jsonb,
  sent boolean not null default false,
  sent_at timestamptz
);

-- Public view to hide cost_price
create or replace view menu_items_public as
select i.id, i.name, i.description, i.image_url, i.category_id, i.sale_price, i.is_active
from items i
where i.is_active = true;
