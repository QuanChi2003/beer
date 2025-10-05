
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { requireAdmin } from '@/lib/auth'
import { pool, ensureSchema } from '@/lib/db'
export async function GET(){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  await ensureSchema()
  const { rows } = await pool.query('select id, name, parent_id, pos from categories order by coalesce(parent_id::text,id::text), pos, name')
  return Response.json(rows)
}
export async function POST(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  await ensureSchema()
  const { id, name, parent_id, pos } = await req.json()
  const nid = id || 'c-' + Math.random().toString(36).slice(2,8)
  const { rows } = await pool.query('insert into categories(id,name,parent_id,pos) values ($1,$2,$3,$4) returning *', [nid, name, parent_id||null, Number(pos)||0])
  return Response.json(rows[0])
}
