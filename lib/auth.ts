
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecret')
export async function setAdminSession(username: string) {
  const token = await new SignJWT({ role: 'admin', username }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret)
  cookies().set('admin_session', token, { httpOnly: true, path: '/', sameSite: 'lax' })
}
export async function requireAdmin() {
  const token = cookies().get('admin_session')?.value
  if (!token) return null
  try { const { payload } = await jwtVerify(token, secret); if (payload.role === 'admin') return payload } catch {}
  return null
}
