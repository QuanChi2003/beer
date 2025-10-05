
export const runtime = 'nodejs'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  const { rows } = await pool.query('select id, name, parent_id, pos from categories order by pos asc, name asc')
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type':'application/json' } })
}

export async function POST(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  const { name, parent_id, pos } = await req.json()
  const { rows } = await pool.query('insert into categories (name, parent_id, pos) values ($1,$2,$3) returning *', [name, parent_id||null, pos||0])
  return new Response(JSON.stringify(rows[0]), { headers: { 'Content-Type':'application/json' } })
}
