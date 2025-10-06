import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'day';

    let interval;
    switch (range) {
      case 'day': interval = '1 day'; break;
      case 'week': interval = '1 week'; break;
      case 'month': interval = '1 month'; break;
      case 'year': interval = '1 year'; break;
      default: return NextResponse.json({ error: 'Khoảng thời gian không hợp lệ' }, { status: 400 });
    }

    const data = await pool.query(`
      SELECT DATE_TRUNC($1, created_at) as period, SUM(total) as revenue, SUM(profit) as profit
      FROM orders
      WHERE created_at >= NOW() - INTERVAL $2
      GROUP BY period
      ORDER BY period
    `, [range, interval]);

    return NextResponse.json(data.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}