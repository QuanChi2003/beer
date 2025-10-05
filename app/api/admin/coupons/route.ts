
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { requireAdmin } from '@/lib/auth'
import { pool, ensureSchema } from '@/lib/db'
export async function GET(){ if (!await requireAdmin()) return new Response('Unauthorized',{status:401}); await ensureSchema(); const { rows } = await pool.query('select code, percent_off::float, max_uses, used, active, valid_from, valid_to from coupons order by code'); return Response.json(rows) }
export async function POST(req:Request){ if (!await requireAdmin()) return new Response('Unauthorized',{status:401}); await ensureSchema(); const b = await req.json(); const { rows } = await pool.query(`insert into coupons(code, percent_off, max_uses, valid_from, valid_to, active) values ($1,$2,$3,$4,$5, coalesce($6,true)) returning *`, [b.code, Number(b.percent_off)||0, b.max_uses||null, b.valid_from||null, b.valid_to||null, b.active]); return Response.json(rows[0]) }
