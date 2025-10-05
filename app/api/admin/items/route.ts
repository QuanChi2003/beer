
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { requireAdmin } from '@/lib/auth'
import { pool, ensureSchema } from '@/lib/db'
export async function GET(){ if (!await requireAdmin()) return new Response('Unauthorized',{status:401}); await ensureSchema(); const { rows } = await pool.query('select id, name, description, image_url, category_id, sale_price::float, cost_price::float, is_active from items order by created_at desc'); return Response.json(rows) }
export async function POST(req:Request){ if (!await requireAdmin()) return new Response('Unauthorized',{status:401}); await ensureSchema(); const b = await req.json(); const id = b.id || 'i-' + Math.random().toString(36).slice(2,8); const { rows } = await pool.query(`insert into items(id,name, description, image_url, category_id, sale_price, cost_price, is_active) values ($1,$2,$3,$4,$5,$6,$7, coalesce($8,true)) returning *`, [id, b.name, b.description||null, b.image_url||null, b.category_id||null, Number(b.sale_price)||0, Number(b.cost_price)||0, b.is_active]); return Response.json(rows[0]) }
