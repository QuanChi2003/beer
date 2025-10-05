
export const runtime = 'nodejs'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  const { rows } = await pool.query('select * from items order by created_at desc')
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type':'application/json' } })
}

export async function POST(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  const b = await req.json()
  const { rows } = await pool.query(
    `insert into items (name, description, image_url, category_id, cost_price, sale_price, is_active)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [b.name, b.description||null, b.image_url||null, b.category_id||null, b.cost_price||0, b.sale_price||0, b.is_active??true]
  )
  return new Response(JSON.stringify(rows[0]), { headers: { 'Content-Type':'application/json' } })
}
