import { Pool } from 'pg';
import menuData from '@/data/menu.json';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

export async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT REFERENCES categories(id),
        pos INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        category_id TEXT REFERENCES categories(id),
        sale_price NUMERIC NOT NULL,
        cost_price NUMERIC NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        percent_off NUMERIC CHECK (percent_off BETWEEN 0 AND 100),
        max_uses INTEGER,
        used INTEGER DEFAULT 0,
        valid_from TIMESTAMPTZ,
        valid_to TIMESTAMPTZ,
        active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS members (
        phone TEXT PRIMARY KEY,
        name TEXT,
        points INTEGER DEFAULT 0,
        tier TEXT DEFAULT 'Bronze',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(8), 'hex'),
        order_type TEXT CHECK (order_type IN ('dine-in', 'delivery')),
        table_number TEXT,
        customer_name TEXT,
        phone TEXT,
        address TEXT,
        note TEXT,
        coupon_code TEXT REFERENCES coupons(code),
        subtotal NUMERIC,
        discount NUMERIC DEFAULT 0,
        total NUMERIC,
        profit NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
        item_id TEXT REFERENCES items(id),
        qty INTEGER,
        sale_price NUMERIC,
        cost_price NUMERIC,
        PRIMARY KEY (order_id, item_id)
      );

      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

      CREATE OR REPLACE VIEW menu_items_public AS
      SELECT id, name, description, image_url, category_id, sale_price, is_active
      FROM items WHERE is_active = TRUE;
    `);

    const { rows } = await client.query('SELECT COUNT(*) FROM items');
    if (rows[0].count === '0') {
      for (const cat of menuData.categories) {
        await client.query(
          'INSERT INTO categories (id, name, parent_id, pos) VALUES ($1, $2, $3, $4)',
          [cat.id, cat.name, cat.parent_id || null, cat.pos]
        );
      }
      for (const item of menuData.items) {
        await client.query(
          'INSERT INTO items (id, name, description, image_url, category_id, sale_price, cost_price) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [item.id, item.name, item.description, item.image_url, item.category_id, item.sale_price, item.cost_price]
        );
      }
      for (const coupon of menuData.coupons) {
        await client.query(
          'INSERT INTO coupons (code, percent_off, max_uses, valid_from, valid_to) VALUES ($1, $2, $3, $4, $5)',
          [coupon.code, coupon.percent_off, coupon.max_uses, coupon.valid_from, coupon.valid_to]
        );
      }
    }
  } finally {
    client.release();
  }
}

export default pool;