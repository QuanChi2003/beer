
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { requireAdmin } from '@/lib/auth'

export async function GET(){
  const user = await requireAdmin()
  if (!user) return new Response('Unauthorized', { status: 401 })
  return Response.json({ ok:true, user })
}
