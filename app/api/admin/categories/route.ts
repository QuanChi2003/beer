
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  if (!process.env.SUPABASE_DB_URL) {
    const data = (await import('@/data/menu.json')).default
    return Response.json(data.categories)
  }
  const { rows } = await pool.query('select id, name, parent_id, pos from categories order by pos asc, name asc')
  return Response.json(rows)
}

export async function POST(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  if (!process.env.SUPABASE_DB_URL) return new Response('No DB in fallback mode', { status: 400 })
  const { name, parent_id, pos } = await req.json()
  const { rows } = await pool.query('insert into categories (name, parent_id, pos) values ($1,$2,$3) returning *', [name, parent_id||null, pos||0])
  return Response.json(rows[0])
}
