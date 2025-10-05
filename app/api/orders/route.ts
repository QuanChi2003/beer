
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { pool } from '@/lib/db'

async function sendTelegram(message:string){
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
  }).catch(()=>{})
}

type OrderItem = { id:string, qty:number }

export async function POST(req:Request){
  const body = await req.json()
  const { items, order_type, table_number, customer_name, phone, address, note, coupon_code } = body as {
    items: OrderItem[], order_type: 'dine-in'|'delivery', table_number?: string, customer_name?: string, phone?: string, address?: string, note?: string, coupon_code?: string
  }
  if (!items?.length) return new Response('No items', { status: 400 })
  if (order_type==='dine-in' && !table_number) return new Response('Missing table_number', { status: 400 })
  if (order_type==='delivery' && !(customer_name && phone && address)) return new Response('Missing delivery info', { status: 400 })

  if (!process.env.SUPABASE_DB_URL) {
    const data = (await import('@/data/menu.json')).default
    const dict = new Map(data.items.map((i: any) => [i.id, i]))
    let subtotal = 0, profit = 0
    const lines = items.map(it=>{
      const m = dict.get(it.id)
      if (!m) throw new Error('Item not found')
      const lineTotal = Number(m.sale_price) * it.qty
      const lineProfit = (Number(m.sale_price) - Number(m.cost_price)) * it.qty
      subtotal += lineTotal; profit += lineProfit
      return { name: m.name, qty: it.qty, sale_price: m.sale_price, line_total: lineTotal }
    })
    const discount = 0
    const total = Math.max(0, subtotal - discount)
    const header = order_type==='delivery'
      ? `<b>ĐƠN MỚI (SHIP)</b>\nKhách: ${customer_name} | ĐT: ${phone}\nĐ/c: ${address}\n(Lưu ý: quán sẽ tính phí ship riêng tuỳ nơi)`
      : `<b>ĐƠN MỚI (TẠI BÀN)</b>\nBàn: ${table_number}`
    const linesText = lines.map(l=>`• ${l.name} x${l.qty} — ${Number(l.sale_price).toLocaleString()}₫`).join('\n')
    const msg = `${header}\n${linesText}\n———\nTạm tính: ${subtotal.toLocaleString()}₫\nGiảm: ${discount.toLocaleString()}₫\nTổng: ${total.toLocaleString()}₫\nLợi nhuận (ước tính): ${profit.toLocaleString()}₫`
    await sendTelegram(msg)
    return Response.json({ id: 'no-db', subtotal, discount, total, profit, created_at: new Date().toISOString() })
  }

  const client = await pool.connect()
  try {
    await client.query('begin')
    const ids = items.map(i=>i.id)
    const { rows: dbItems } = await client.query(`select id, name, sale_price, cost_price from items where id = any($1::uuid[])`, [ids])
    let subtotal = 0, profit = 0
    const lines = items.map(it=>{
      const db = dbItems.find(d=>d.id===it.id)!
      const lineTotal = Number(db.sale_price) * it.qty
      const lineProfit = (Number(db.sale_price) - Number(db.cost_price)) * it.qty
      subtotal += lineTotal; profit += lineProfit
      return { item_id: it.id, qty: it.qty, sale_price: db.sale_price, cost_price: db.cost_price, line_total: lineTotal, line_profit: lineProfit, name: db.name }
    })
    let discount = 0
    if (coupon_code) {
      const { rows: cp } = await client.query(`select * from coupons where code=$1 and active=true and (expires_at is null or expires_at>now())`, [coupon_code])
      if (cp[0]) discount = cp[0].discount_type==='percent' ? subtotal * Number(cp[0].value)/100 : Number(cp[0].value)
    }
    const total = Math.max(0, subtotal - discount)
    const { rows: o } = await client.query(
      `insert into orders (order_type, table_number, customer_name, phone, address, note, subtotal, discount, total, profit, coupon_code)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id, created_at`,
      [order_type, table_number||null, customer_name||null, phone||null, address||null, note||null, subtotal, discount, total, profit, coupon_code||null]
    )
    const orderId = o[0].id
    for (const l of lines) {
      await client.query(`insert into order_items (order_id, item_id, qty, sale_price, cost_price, line_total, line_profit) values ($1,$2,$3,$4,$5,$6,$7)`, [orderId, l.item_id, l.qty, l.sale_price, l.cost_price, l.line_total, l.line_profit])
    }
    await client.query('commit')
    return Response.json({ id: orderId, subtotal, discount, total, profit, created_at: o[0].created_at })
  } catch (e:any) {
    await client.query('rollback'); return new Response(e.message || 'Error', { status: 500 })
  } finally { client.release() }
}
