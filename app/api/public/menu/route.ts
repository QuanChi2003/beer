
export const runtime = 'nodejs'
import { pool } from '@/lib/db'

export async function GET(){
  const client = await pool.connect()
  try {
    const catsRes = await client.query('select id, name, parent_id, pos from categories order by coalesce(parent_id::text, id::text), pos asc, name asc')
    const itemsRes = await client.query('select id, name, description, image_url, category_id, sale_price from menu_items_public order by name')
    return new Response(JSON.stringify({ categories: catsRes.rows, items: itemsRes.rows }), { headers: { 'Content-Type':'application/json' } })
  } finally {
    client.release()
  }
}
