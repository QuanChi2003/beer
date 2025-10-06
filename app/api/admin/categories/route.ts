import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const categories = await pool.query('SELECT * FROM categories ORDER BY pos');
    return NextResponse.json(categories.rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { id, name, parent_id, pos } = await req.json();
    await pool.query(
      'INSERT INTO categories (id, name, parent_id, pos) VALUES ($1, $2, $3, $4)',
      [id, name, parent_id || null, pos]
    );
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}