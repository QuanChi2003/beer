import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const coupons = await pool.query('SELECT * FROM coupons');
    return NextResponse.json(coupons.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { code, percent_off, max_uses, valid_from, valid_to, active } = await req.json();
    await pool.query(
      'INSERT INTO coupons (code, percent_off, max_uses, valid_from, valid_to, active) VALUES ($1, $2, $3, $4, $5, $6)',
      [code, percent_off, max_uses, valid_from, valid_to, active ?? true]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}