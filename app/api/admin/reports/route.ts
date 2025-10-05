
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { requireAdmin } from '@/lib/auth'
import { pool, ensureSchema } from '@/lib/db'
const RANGE = { day:{unit:'day', interval:"30 days"}, week:{unit:'week', interval:"12 weeks"}, month:{unit:'month', interval:"12 months"}, year:{unit:'year', interval:"5 years"} }
export async function GET(req:Request){
  if (!await requireAdmin()) return new Response('Unauthorized',{status:401})
  await ensureSchema()
  const { searchParams } = new URL(req.url)
  const r = (searchParams.get('range')||'day') as 'day'|'week'|'month'|'year'
  const meta = RANGE[r] || RANGE.day
  const sql = `select date_trunc($1, created_at) as bucket, sum(total)::float as revenue, sum(profit)::float as profit, count(*)::int as orders
               from orders where created_at >= now() - interval '${meta.interval}' group by 1 order by bucket asc`
  const { rows } = await pool.query(sql, [meta.unit])
  return Response.json(rows.map((r:any)=>({ bucket:r.bucket, revenue:r.revenue, profit:r.profit, orders:r.orders })))
}
