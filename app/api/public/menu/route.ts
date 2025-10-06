import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const categories = await pool.query('SELECT * FROM categories ORDER BY pos');
  const items = await pool.query('SELECT * FROM menu_items_public');
  return NextResponse.json({ categories: categories.rows, items: items.rows });
}