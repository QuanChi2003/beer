
export const runtime = 'nodejs'
import { requireAdmin } from '@/lib/auth'

export async function GET(){
  const user = await requireAdmin()
  if (!user) return new Response('Unauthorized', { status: 401 })
  return new Response(JSON.stringify({ ok:true, user }), { headers: { 'Content-Type':'application/json' } })
}
