import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function requireAdmin(req: NextRequest) {
  const token = cookies().get('token')?.value;
  if (!token) throw new Error('Chưa đăng nhập', { cause: { status: 401 } });

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (e) {
    throw new Error('Chưa đăng nhập', { cause: { status: 401 } });
  }
}