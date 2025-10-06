import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ error: 'Yêu cầu số điện thoại' }, { status: 400 });
    }

    const orders = await pool.query(
      `SELECT id, created_at, total
       FROM orders
       WHERE phone = $1
       ORDER BY created_at DESC`,
      [phone]
    );

    const member = await pool.query(
      `SELECT name, points, tier
       FROM members
       WHERE phone = $1`,
      [phone]
    );

    return NextResponse.json({
      orders: orders.rows,
      member: member.rows[0] || { phone, points: 0, tier: 'Bronze' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}