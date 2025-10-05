
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { setAdminSession } from '@/lib/auth'

export async function POST(req:Request){
  const { username, password } = await req.json()
  if (username===process.env.ADMIN_USER && password===process.env.ADMIN_PASS){
    await setAdminSession(username)
    return Response.json({ ok:true })
  }
  return new Response('Unauthorized', { status: 401 })
}
