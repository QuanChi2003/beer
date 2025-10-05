
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { pool, ensureSchema } from '@/lib/db'
import { earnPoints, calcTier } from '@/lib/tiers'

async function sendTelegram(message:string){
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  const user = process.env.TELEGRAM_USER_ID
  if (!token) return { ok:false }
  async function post(id?:string){
    if (!id) return { ok:false }
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ chat_id:id, text: message, parse_mode:'HTML' }) })
    const j = await r.json().catch(()=>({}))
    return { ok: !!j?.ok }
  }
  const a = await post(chat); if (a.ok) return a; return await post(user)
}

export async function POST(req:Request){
  await ensureSchema()
  const b = await req.json()
  const { items, order_type, table_number, customer_name, phone, address, note, coupon_code } = b
  if (!items?.length) return new Response('No items',{status:400})
  if (order_type==='dine-in' && !table_number) return new Response('Missing table_number',{status:400})
  if (order_type==='delivery' && !(customer_name && phone && address)) return new Response('Missing delivery info',{status:400})

  const ids = items.map((i:any)=>i.id)
  const q = await pool.query(`select id, name, sale_price::float, cost_price::float from items where id = any($1) and is_active = true`, [ids])
  const dict = new Map(q.rows.map((r:any)=>[r.id, r]))
  let subtotal=0, profit=0
  const lines = items.map((it:any)=>{
    const m = dict.get(it.id); if(!m) throw new Error('Item not found: '+it.id)
    const line = Number(m.sale_price) * it.qty
    subtotal += line
    profit += (Number(m.sale_price)-Number(m.cost_price))*it.qty
    return { name:m.name, qty:it.qty, sale_price:m.sale_price }
  })

  let discount = 0
  if (coupon_code){
    const cp = await pool.query('select * from coupons where code=$1 and active=true and (valid_from is null or valid_from<=now()) and (valid_to is null or valid_to>=now())', [coupon_code])
    const c = cp.rows[0]
    if (c){
      discount = Math.floor(Number(subtotal) * Number(c.percent_off) / 100)
    }
  }
  const total = subtotal - discount

  await pool.query('begin')
  try{
    const ins = await pool.query(
      `insert into orders(order_type, table_number, customer_name, phone, address, note, coupon_code, subtotal, discount, total, profit)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
      [order_type, table_number||null, customer_name||null, phone||null, address||null, note||null, coupon_code||null, subtotal, discount, total, profit]
    )
    const orderId = ins.rows[0].id
    for (const it of items){
      const m = dict.get(it.id)!
      await pool.query('insert into order_items(order_id, item_id, qty, sale_price, cost_price) values ($1,$2,$3,$4,$5)',
        [orderId, it.id, it.qty, m.sale_price, m.cost_price])
    }
    // update coupon usage
    if (coupon_code){
      await pool.query('update coupons set used = coalesce(used,0)+1 where code=$1', [coupon_code])
    }
    // update member points
    if (phone){
      const pt = earnPoints(total)
      const existing = await pool.query('select points from members where phone=$1',[phone])
      if (existing.rowCount){
        const newPts = Number(existing.rows[0].points)+pt
        const tier = calcTier(newPts)
        await pool.query('update members set points=$1, tier=$2, updated_at=now() where phone=$3',[newPts, tier, phone])
      }else{
        const tier = calcTier(pt)
        await pool.query('insert into members(phone, name, points, tier) values ($1,$2,$3,$4)',[phone, customer_name||null, pt, tier])
      }
    }
    await pool.query('commit')

    const head = order_type==='delivery' ? `<b>ĐƠN MỚI (SHIP)</b>\nKhách: ${customer_name} | ĐT: ${phone}\nĐ/c: ${address}\n(Lưu ý: phí ship tính riêng)` : `<b>ĐƠN MỚI (TẠI BÀN)</b>\nBàn: ${table_number}`
    const body = lines.map((l:any)=>`• ${l.name} x${l.qty} — ${Number(l.sale_price).toLocaleString()}₫`).join('\n')
    const footer = `\n—\nTạm tính: ${subtotal.toLocaleString()}₫${discount?`\nGiảm (${coupon_code}): -${discount.toLocaleString()}₫`:''}\nTổng: ${total.toLocaleString()}₫\nLN: ${profit.toLocaleString()}₫`
    const sent = await sendTelegram(`${head}\n${body}${footer}`)
    return Response.json({ id: orderId, subtotal, discount, total, profit, notify: sent.ok })
  }catch(e:any){
    try{ await pool.query('rollback') }catch{}
    return new Response(e.message||'Error',{status:500})
  }
}
