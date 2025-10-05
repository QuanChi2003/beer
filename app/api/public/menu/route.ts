
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { pool, ensureSchema } from '@/lib/db'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
async function seedIfEmpty(){
  const { rows } = await pool.query('select count(*)::int as n from categories')
  if (rows[0].n>0) return
  const raw = await readFile(path.join(process.cwd(),'data','menu.json'),'utf-8')
  const data = JSON.parse(raw)
  await pool.query('begin')
  try{
    for (const c of data.categories){ await pool.query('insert into categories(id,name,parent_id,pos) values ($1,$2,$3,$4)', [c.id,c.name,c.parent_id,c.pos||0]) }
    for (const i of data.items){ await pool.query('insert into items(id,name,description,image_url,category_id,sale_price,cost_price,is_active) values ($1,$2,$3,$4,$5,$6,$7,true)', [i.id,i.name,i.description,i.image_url,i.category_id,i.sale_price,i.cost_price]) }
    for (const cp of (data.coupons||[])){ await pool.query('insert into coupons(code,percent_off,active) values ($1,$2,true) on conflict (code) do nothing', [cp.code,cp.percent_off]) }
    await pool.query('commit')
  }catch(e){ await pool.query('rollback'); throw e }
}
export async function GET(){
  await ensureSchema(); await seedIfEmpty()
  const cats = await pool.query('select id, name, parent_id, pos from categories order by coalesce(parent_id::text,id::text), pos, name')
  const items = await pool.query('select id, name, description, image_url, category_id, sale_price from menu_items_public order by name')
  return Response.json({ categories: cats.rows, items: items.rows })
}
