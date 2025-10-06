
import { Pool } from 'pg'
const globalForPool = global as unknown as { pool?: Pool }
export const pool = globalForPool.pool || new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 8, idleTimeoutMillis: 10000, connectionTimeoutMillis: 2000
})
if (!globalForPool.pool) globalForPool.pool = pool
const SCHEMA_SQL = `
create extension if not exists pgcrypto;
create table if not exists categories (id text primary key, name text not null, parent_id text references categories(id) on delete set null, pos int not null default 0, created_at timestamptz not null default now());
create table if not exists items (id text primary key, name text not null, description text, image_url text, category_id text references categories(id) on delete set null, sale_price numeric not null, cost_price numeric not null, is_active boolean not null default true, created_at timestamptz not null default now());
create table if not exists coupons (code text primary key, percent_off numeric not null check (percent_off>=0 and percent_off<=100), max_uses int, used int not null default 0, valid_from timestamptz, valid_to timestamptz, active boolean not null default true);
create table if not exists members (phone text primary key, name text, points int not null default 0, tier text not null default 'Bronze', updated_at timestamptz not null default now());
create table if not exists orders (id text primary key default encode(gen_random_bytes(8),'hex'), order_type text not null check (order_type in ('dine-in','delivery')), table_number text, customer_name text, phone text, address text, note text, coupon_code text references coupons(code), subtotal numeric not null, discount numeric not null default 0, total numeric not null, profit numeric not null, created_at timestamptz not null default now());
create table if not exists order_items (order_id text references orders(id) on delete cascade, item_id text references items(id), qty int not null, sale_price numeric not null, cost_price numeric not null);
create index if not exists idx_orders_created on orders(created_at);
create or replace view menu_items_public as select id, name, description, image_url, category_id, sale_price, is_active from items where is_active = true;
`;
export async function ensureSchema(){ const c=await pool.connect(); try{ await c.query(SCHEMA_SQL) } finally { c.release() } }
