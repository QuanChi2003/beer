
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  if (!process.env.SUPABASE_DB_URL) {
    const data = (await import('@/data/menu.json')).default
    return Response.json(data.items)
  }
  const { rows } = await pool.query('select * from items order by created_at desc')
  return Response.json(rows)
}

export async function POST(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  if (!process.env.SUPABASE_DB_URL) return new Response('No DB in fallback mode', { status: 400 })
  const b = await req.json()
  const { rows } = await pool.query(
    `insert into items (name, description, image_url, category_id, cost_price, sale_price, is_active)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [b.name, b.description||null, b.image_url||null, b.category_id||null, b.cost_price||0, b.sale_price||0, b.is_active??true]
  )
  return Response.json(rows[0])
}
