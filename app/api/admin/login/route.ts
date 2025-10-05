
export const runtime = 'nodejs'
import { setAdminSession } from '@/lib/auth'

export async function POST(req:Request){
  const { username, password } = await req.json()
  if (username===process.env.ADMIN_USER && password===process.env.ADMIN_PASS){
    await setAdminSession(username)
    return new Response(JSON.stringify({ ok:true }), { headers: { 'Content-Type':'application/json' } })
  }
  return new Response('Unauthorized', { status: 401 })
}
