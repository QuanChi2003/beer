import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { setCookie } from 'cookies-next';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ user: username }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const res = NextResponse.json({ success: true });
    setCookie('token', token, { req, res, httpOnly: true, secure: true });
    return res;
  }
  return NextResponse.json({ error: 'Thông tin đăng nhập không đúng' }, { status: 401 });
}