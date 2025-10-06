
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { pool, ensureSchema } from '@/lib/db'
export async function GET(req:Request){
  await ensureSchema()
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')
  if (!phone) return new Response('Missing phone', { status: 400 })
  const orders = await pool.query('select id, created_at, total::float from orders where phone = $1 order by created_at desc limit 50', [phone])
  const member = await pool.query('select phone, name, points, tier from members where phone=$1',[phone])
  return Response.json({ orders: orders.rows, member: member.rows[0]||null })
}
