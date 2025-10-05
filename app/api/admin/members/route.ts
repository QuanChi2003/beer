
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { requireAdmin } from '@/lib/auth'
import { pool, ensureSchema } from '@/lib/db'
export async function GET(){ if (!await requireAdmin()) return new Response('Unauthorized',{status:401}); await ensureSchema(); const { rows } = await pool.query('select phone, name, points, tier from members order by points desc limit 200'); return Response.json(rows) }
