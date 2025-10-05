
'use client'
import useSWR from 'swr'
import Image from 'next/image'
import { useCart } from '@/components/Cart'

const fetcher = (u:string)=>fetch(u).then(r=>r.json())

export default function MenuPage(){
  const { data } = useSWR('/api/public/menu', fetcher)
  const { add } = useCart()
  if (!data) return <p className="py-10">Đang tải menu…</p>
  const { categories, items } = data

  const roots = categories.filter((c:any)=>!c.parent_id)
  const children = (pid:string)=>categories.filter((c:any)=>c.parent_id===pid)
  const itemsByCat = (cid:string)=>items.filter((i:any)=>i.category_id===cid)

  return (
    <section className="py-6">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      {roots.map((root:any)=>(
        <div key={root.id} className="mb-8">
          <h2 className="text-xl font-semibold">{root.name}</h2>
          <div className="mt-2 space-y-6">
            {children(root.id).length===0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemsByCat(root.id).map((it:any)=>(
                  <div key={it.id} className="card overflow-hidden">
                    {it.image_url && <Image src={it.image_url} width={600} height={400} alt={it.name} className="h-40 w-full object-cover" />}
                    <div className="p-4">
                      <div className="font-semibold">{it.name}</div>
                      <div className="text-sm text-neutral-600">{it.description}</div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold">{(it.sale_price).toLocaleString()}₫</span>
                        <button className="btn btn-primary" onClick={()=>add({id:it.id, name:it.name, price:Number(it.sale_price), qty:1})}>Thêm</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {children(root.id).map((sub:any)=>(
              <div key={sub.id}>
                <h3 className="font-semibold mt-4">{sub.name}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {itemsByCat(sub.id).map((it:any)=>(
                    <div key={it.id} className="card overflow-hidden">
                      {it.image_url && <Image src={it.image_url} width={600} height={400} alt={it.name} className="h-40 w-full object-cover" />}
                      <div className="p-4">
                        <div className="font-semibold">{it.name}</div>
                        <div className="text-sm text-neutral-600">{it.description}</div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-bold">{(it.sale_price).toLocaleString()}₫</span>
                          <button className="btn btn-primary" onClick={()=>add({id:it.id, name:it.name, price:Number(it.sale_price), qty:1})}>Thêm</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
