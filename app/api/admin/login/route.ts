
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic'; export const revalidate = 0;
import { setAdminSession } from '@/lib/auth'
export async function POST(req:Request){
  const { username, password } = await req.json()
  const u = process.env.ADMIN_USER || 'admin'
  const p = process.env.ADMIN_PASS || 'admin'
  if (username===u && password===p){ await setAdminSession(username); return Response.json({ok:true}) }
  return new Response('Unauthorized', { status: 401 })
}
