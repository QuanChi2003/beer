
'use client'
import useSWR from 'swr'
import { useEffect, useState } from 'react'

const f = (u:string)=>fetch(u).then(r=>{
  if (r.status===401) throw new Error('unauth')
  return r.json()
})

function Guard({children}:{children:React.ReactNode}){
  const [ok,setOk] = useState(false)
  useEffect(()=>{
    fetch('/api/admin/me').then(r=>setOk(r.ok)).catch(()=>setOk(false))
  },[])
  if (!ok) return <p className="py-10">Vui lòng đăng nhập tại <a className="underline" href="/admin/login">/admin/login</a></p>
  return <>{children}</>
}

export default function Admin(){
  return (
    <Guard>
      <section className="py-6 space-y-8">
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <Reports />
        <ManageCategories />
        <ManageItems />
        <OrdersHint />
      </section>
    </Guard>
  )
}

function Reports(){
  const [range,setRange] = useState<'day'|'week'|'month'|'year'>('day')
  const { data } = useSWR('/api/admin/reports?range='+range, f)
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Báo cáo lợi nhuận</h2>
        <select className="input w-auto" value={range} onChange={e=>setRange(e.target.value as any)}>
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
      </div>
      {!data ? <p>Đang tải…</p> : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>Thời gian</th><th>Doanh thu</th><th>Lợi nhuận</th><th>Đơn hàng</th></tr></thead>
            <tbody>
              {data.map((r:any)=>(
                <tr key={r.bucket}><td>{r.bucket}</td><td>{Number(r.revenue).toLocaleString()}₫</td><td>{Number(r.profit).toLocaleString()}₫</td><td>{r.orders}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ManageCategories(){
  const { data, mutate } = useSWR('/api/admin/categories', f)
  const [name,setName] = useState(''); const [parent,setParent]=useState(''); const [pos,setPos]=useState(0)
  const submit = async()=>{
    await fetch('/api/admin/categories',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name, parent_id: parent||null, pos:Number(pos)})})
    setName(''); setParent(''); setPos(0); mutate()
  }
  if (!data) return <div className="card p-4"><h2 className="font-semibold">Phân loại</h2><p>Đang tải…</p></div>
  const roots = data.filter((c:any)=>!c.parent_id)
  return (
    <div className="card p-4">
      <h2 className="font-semibold mb-2">Phân loại (có thể tạo danh mục & nhóm con)</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <ul className="list-disc pl-6">
            {roots.map((r:any)=>(
              <li key={r.id}><strong>{r.name}</strong>
                <ul className="list-disc pl-6">
                  {data.filter((c:any)=>c.parent_id===r.id).map((s:any)=>(<li key={s.id}>{s.name}</li>))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <input className="input" placeholder="Tên danh mục/nhóm" value={name} onChange={e=>setName(e.target.value)} />
          <select className="input" value={parent} onChange={e=>setParent(e.target.value)}>
            <option value="">(Không — danh mục gốc)</option>
            {roots.map((r:any)=>(<option key={r.id} value={r.id}>{r.name}</option>))}
          </select>
          <input className="input" type="number" placeholder="Vị trí" value={pos} onChange={e=>setPos(Number(e.target.value))} />
          <button className="btn btn-primary w-full" onClick={submit}>Thêm</button>
        </div>
      </div>
    </div>
  )
}

function ManageItems(){
  const { data, mutate } = useSWR('/api/admin/items', f)
  const { data: cats } = useSWR('/api/admin/categories', f)
  const [form,setForm] = useState<any>({name:'', sale_price:0, cost_price:0, category_id:'', image_url:'', description:''})
  const submit = async()=>{
    await fetch('/api/admin/items',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)})
    setForm({name:'', sale_price:0, cost_price:0, category_id:'', image_url:'', description:''})
    mutate()
  }
  return (
    <div className="card p-4">
      <h2 className="font-semibold mb-2">Món ăn/đồ uống (giá gốc chỉ hiển thị ở đây)</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 overflow-x-auto">
          {!data ? <p>Đang tải…</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th>Tên</th><th>Danh mục</th><th>Giá bán</th><th>Giá gốc</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {data.map((it:any)=>(
                  <tr key={it.id}><td>{it.name}</td><td>{it.category_id?.slice(0,6)||'-'}</td><td>{Number(it.sale_price).toLocaleString()}₫</td><td>{Number(it.cost_price).toLocaleString()}₫</td><td>{it.is_active?'Hiện':'Ẩn'}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="space-y-2">
          <input className="input" placeholder="Tên món" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input className="input" placeholder="Ảnh URL" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} />
          <select className="input" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})}>
            <option value="">Chọn danh mục/nhóm</option>
            {cats?.map((c:any)=>(<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <input className="input" placeholder="Mô tả" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          <input className="input" type="number" placeholder="Giá bán" value={form.sale_price} onChange={e=>setForm({...form, sale_price:Number(e.target.value)})} />
          <input className="input" type="number" placeholder="Giá gốc (admin)" value={form.cost_price} onChange={e=>setForm({...form, cost_price:Number(e.target.value)})} />
          <button className="btn btn-primary w-full" onClick={submit}>Thêm món</button>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-2">* Người dùng chỉ thấy giá bán. Giá gốc chỉ hiển thị trong trang Admin, và được lấy server-side.</p>
    </div>
  )
}

function OrdersHint(){
  return (
    <div className="card p-4">
      <h2 className="font-semibold">Đơn hàng</h2>
      <p className="text-sm text-neutral-600">Đơn hàng được tạo từ trang Checkout. Bạn có thể xem báo cáo lợi nhuận ở trên. (Có thể bổ sung trang danh sách đơn chi tiết theo yêu cầu.)</p>
    </div>
  )
}
