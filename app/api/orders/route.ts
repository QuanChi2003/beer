import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendTelegramMessage } from '@/lib/telegram';
import { ItemRow } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { items, order_type, table_number, customer_name, phone, address, note, coupon_code } = await req.json();

    if (!items?.length || !['dine-in', 'delivery'].includes(order_type)) {
      return NextResponse.json({ error: 'Đơn hàng không hợp lệ' }, { status: 400 });
    }
    if (order_type === 'dine-in' && !table_number) {
      return NextResponse.json({ error: 'Yêu cầu số bàn' }, { status: 400 });
    }
    if (order_type === 'delivery' && (!customer_name || !phone || !address)) {
      return NextResponse.json({ error: 'Yêu cầu thông tin khách hàng' }, { status: 400 });
    }

    const itemIds = items.map((it: { id: string }) => it.id);
    const q = await pool.query<ItemRow>(
      `SELECT id, name, sale_price::float, cost_price::float
       FROM items WHERE id = ANY($1) AND is_active = TRUE`,
      [itemIds]
    );
    const dict = new Map<string, ItemRow>(q.rows.map(r => [r.id, r]));

    let subtotal = 0;
    let profit = 0;
    for (const it of items) {
      const m = dict.get(it.id) as ItemRow | undefined;
      if (!m) throw new Error(`Không tìm thấy món: ${it.id}`);
      subtotal += m.sale_price * it.qty;
      profit += (m.sale_price - m.cost_price) * it.qty;
    }

    let discount = 0;
    if (coupon_code) {
      const coupon = await pool.query(
        `SELECT percent_off, used, max_uses FROM coupons
         WHERE code = $1 AND active = TRUE AND valid_from <= NOW() AND valid_to >= NOW()`,
        [coupon_code]
      );
      if (coupon.rows[0] && coupon.rows[0].used < coupon.rows[0].max_uses) {
        discount = (subtotal * coupon.rows[0].percent_off) / 100;
        await pool.query('UPDATE coupons SET used = used + 1 WHERE code = $1', [coupon_code]);
      }
    }

    const total = subtotal - discount;

    const order = await pool.query(
      `INSERT INTO orders (order_type, table_number, customer_name, phone, address, note, coupon_code, subtotal, discount, total, profit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [order_type, table_number, customer_name, phone, address, note, coupon_code, subtotal, discount, total, profit]
    );
    const orderId = order.rows[0].id;

    for (const it of items) {
      const m = dict.get(it.id) as ItemRow;
      await pool.query(
        `INSERT INTO order_items (order_id, item_id, qty, sale_price, cost_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, it.id, it.qty, m.sale_price, m.cost_price]
      );
    }

    if (phone) {
      const points = Math.round(total / 1000);
      const tier = total >= 10000 ? 'Platinum' : total >= 5000 ? 'Gold' : total >= 1000 ? 'Silver' : 'Bronze';
      await pool.query(
        `INSERT INTO members (phone, points, tier) VALUES ($1, $2, $3)
         ON CONFLICT (phone) DO UPDATE SET points = members.points + $2, tier = $3, updated_at = NOW()`,
        [phone, points, tier]
      );
    }

    let notify = false;
    try {
      const message = `📋 Đơn hàng mới (${order_type === 'dine-in' ? 'TẠI BÀN' : 'SHIP'})\n` +
        items.map((it: { id: string; qty: number }) => {
          const m = dict.get(it.id)!;
          return `- ${m.name}: ${it.qty} x ${m.sale_price} = ${it.qty * m.sale_price}`;
        }).join('\n') +
        `\nTạm tính: ${subtotal}\nGiảm: ${discount}\nTổng: ${total}\nLợi nhuận: ${profit}`;
      await sendTelegramMessage(message);
      notify = true;
    } catch (e) {
      console.error('Lỗi Telegram:', e);
    }

    return NextResponse.json({ id: orderId, subtotal, discount, total, profit, notify });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}