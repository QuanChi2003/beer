
'use client'
import useSWR from 'swr'
import Image from 'next/image'
import { useCart } from '@/components/Cart'
import { useToast } from '@/components/Toast'
const fetcher=(u:string)=>fetch(u).then(async r=>{ if(!r.ok) throw new Error(await r.text()); return r.json() })
export default function MenuPage(){
  const { data, error } = useSWR('/api/public/menu', fetcher)
  const { add } = useCart()
  const { push } = useToast()
  if (error) return <p className="text-red-600">Lỗi tải menu: {String(error.message||error)}</p>
  if (!data) return <p>Đang tải menu…</p>
  const { categories, items } = data
  const roots = categories.filter((c:any)=>!c.parent_id)
  const kids = (pid:string)=>categories.filter((c:any)=>c.parent_id===pid)
  const itemsBy=(cid:string)=>items.filter((i:any)=>i.category_id===cid)
  const addToCart=(it:any)=>{ add({id:it.id,name:it.name,price:Number(it.sale_price),qty:1}); push('Đã thêm '+it.name) }
  return (
    <section className="space-y-8">
      {roots.map((r:any)=>(
        <div key={r.id}>
          <h2 className="text-xl font-semibold">{r.name}</h2>
          {kids(r.id).map((s:any)=>(
            <div key={s.id} className="mt-2">
              <h3 className="font-medium">{s.name}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {itemsBy(s.id).map((it:any)=>(
                  <div key={it.id} className="card overflow-hidden">
                    {it.image_url && <Image src={it.image_url} alt={it.name} width={600} height={400} className="h-40 w-full object-cover" />}
                    <div className="p-4">
                      <div className="font-semibold">{it.name}</div>
                      <div className="text-sm text-neutral-600">{it.description}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">{Number(it.sale_price).toLocaleString()}₫</span>
                        <button className="btn btn-primary" onClick={()=>addToCart(it)}>Thêm</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
