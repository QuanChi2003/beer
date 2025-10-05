
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { pool } from '@/lib/db'

export async function GET(){
  if (!process.env.SUPABASE_DB_URL) {
    const data = (await import('@/data/menu.json')).default
    const items = data.items.map(({ cost_price, ...rest }: any) => rest)
    return Response.json({ categories: data.categories, items })
  }
  const client = await pool.connect()
  try {
    const catsRes = await client.query('select id, name, parent_id, pos from categories order by coalesce(parent_id::text, id::text), pos asc, name asc')
    const itemsRes = await client.query('select id, name, description, image_url, category_id, sale_price from menu_items_public order by name')
    return Response.json({ categories: catsRes.rows, items: itemsRes.rows })
  } finally { client.release() }
}
