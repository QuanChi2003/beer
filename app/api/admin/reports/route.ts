
export const runtime = 'nodejs'
import { pool } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || 'day' // day|week|month|year
  let fmt = 'YYYY-MM-DD'
  if (range==='week') fmt='IYYY-IW'
  if (range==='month') fmt='YYYY-MM'
  if (range==='year') fmt='YYYY'
  const { rows } = await pool.query(
    `select to_char(created_at, $1) as bucket, sum(total)::numeric as revenue, sum(profit)::numeric as profit, count(*) as orders
     from orders
     where status='completed'
     group by 1
     order by 1 asc`,
     [fmt]
  )
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type':'application/json' } })
}
