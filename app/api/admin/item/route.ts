import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const items = await pool.query('SELECT * FROM items');
    return NextResponse.json(items.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { id, name, description, image_url, category_id, sale_price, cost_price, is_active } = await req.json();
    await pool.query(
      'INSERT INTO items (id, name, description, image_url, category_id, sale_price, cost_price, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, name, description, image_url, category_id, sale_price, cost_price, is_active ?? true]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}