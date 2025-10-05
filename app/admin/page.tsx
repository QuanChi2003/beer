
'use client'
import useSWR from 'swr'
import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
const { Bar } = { Bar: dynamic(()=>import('react-chartjs-2').then(m=>m.Bar), { ssr: false }) }
const fetcher=(u:string)=>fetch(u).then(async r=>{ if(!r.ok) throw new Error(await r.text()); return r.json() })

function Guard({children}:{children:React.ReactNode}){
  const [ok,setOk]=useState<boolean|null>(null)
  useEffect(()=>{ fetch('/api/admin/me').then(r=>setOk(r.ok)).catch(()=>setOk(false)) },[])
  if (ok===null) return <p>Đang kiểm tra đăng nhập…</p>
  if (!ok) return <p>Vui lòng đăng nhập tại <a className="underline" href="/admin/login">/admin/login</a></p>
  return <>{children}</>
}

export default function Admin(){
  return <Guard>
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
      <Reports/>
      <div className="grid lg:grid-cols-2 gap-6">
        <ManageCategories/>
        <ManageItems/>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <ManageCoupons/>
        <ManageMembers/>
      </div>
    </section>
  </Guard>
}

function Reports(){
  const [range,setRange]=useState<'day'|'week'|'month'|'year'>('day')
  const { data, error } = useSWR('/api/admin/reports?range='+range, fetcher)
  const chart = useMemo(()=>{
    if (!data) return null
    return { labels: data.map((r:any)=> new Date(r.bucket).toLocaleDateString('vi-VN')), datasets: [ { label:'Doanh thu', data: data.map((r:any)=>r.revenue) }, { label:'Lợi nhuận', data: data.map((r:any)=>r.profit) } ] }
  },[data])
  return <div className="card p-4">
    <div className="flex items-center justify-between"><h2 className="font-semibold">Báo cáo</h2>
      <select className="input w-auto" value={range} onChange={e=>setRange(e.target.value as any)}>
        <option value="day">Ngày</option><option value="week">Tuần</option><option value="month">Tháng</option><option value="year">Năm</option>
      </select>
    </div>
    {error ? <p className="text-sm text-red-600">Lỗi: {String(error.message||error)}</p> : !data ? <p>Đang tải…</p> : <div className="mt-3"><Bar data={chart as any} /></div>}
  </div>
}

function ManageCategories(){
  const { data, error, mutate } = useSWR('/api/admin/categories', fetcher)
  const [name,setName]=useState(''); const [parent,setParent]=useState(''); const [pos,setPos]=useState<number|string>('')
  if (error) return <div className="card p-4"><h2 className="font-semibold">Phân loại</h2><p className="text-red-600 text-sm">Lỗi: {String(error.message||error)}</p></div>
  if (!data) return <div className="card p-4"><h2 className="font-semibold">Phân loại</h2><p>Đang tải…</p></div>
  const roots=data.filter((c:any)=>!c.parent_id)
  async function submit(){ const r=await fetch('/api/admin/categories',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name, parent_id: parent||null, pos: Number(pos)||0})}); if (r.ok){ setName(''); setParent(''); setPos(''); mutate(); } }
  return <div className="card p-4 space-y-3">
    <h2 className="font-semibold">Phân loại</h2>
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="sm:col-span-2">
        <ul className="list-disc pl-6">
          {roots.map((r:any)=>(<li key={r.id}><b>{r.name}</b><ul className="list-disc pl-6">{data.filter((c:any)=>c.parent_id===r.id).map((s:any)=>(<li key={s.id}>{s.name}</li>))}</ul></li>))}
        </ul>
      </div>
      <div className="space-y-2">
        <input className="input" placeholder="Tên danh mục/nhóm" value={name} onChange={e=>setName(e.target.value)} />
        <select className="input" value={parent} onChange={e=>setParent(e.target.value)}>
          <option value="">(Không — danh mục gốc)</option>
          {roots.map((r:any)=>(<option key={r.id} value={r.id}>{r.name}</option>))}
        </select>
        <input className="input" type="number" placeholder="Vị trí (số)" value={pos} onChange={e=>setPos(e.target.value)} />
        <button className="btn btn-primary w-full" onClick={submit}>Thêm</button>
      </div>
    </div>
  </div>
}

function ManageItems(){
  const { data, error, mutate } = useSWR('/api/admin/items', fetcher)
  const { data: cats } = useSWR('/api/admin/categories', fetcher)
  const [f,setF]=useState<any>({ name:'', image_url:'', category_id:'', description:'', sale_price:'', cost_price:'', is_active:true })
  if (error) return <div className="card p-4"><h2 className="font-semibold">Món ăn/đồ uống</h2><p className="text-red-600 text-sm">Lỗi: {String(error.message||error)}</p></div>
  if (!data) return <div className="card p-4"><h2 className="font-semibold">Món ăn/đồ uống</h2><p>Đang tải…</p></div>
  async function submit(){ const r=await fetch('/api/admin/items',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...f, sale_price:Number(f.sale_price||0), cost_price:Number(f.cost_price||0)})}); if (r.ok){ setF({ name:'', image_url:'', category_id:'', description:'', sale_price:'', cost_price:'', is_active:true }); mutate() } }
  return <div className="card p-4 space-y-3">
    <h2 className="font-semibold">Món ăn/đồ uống (giá gốc chỉ hiển thị ở đây)</h2>
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="sm:col-span-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Tên</th><th>Danh mục</th><th>Giá bán</th><th>Giá gốc</th><th>TT</th></tr></thead>
          <tbody>{data.map((it:any)=>(<tr key={it.id}><td>{it.name}</td><td>{it.category_id}</td><td>{Number(it.sale_price).toLocaleString()}₫</td><td>{Number(it.cost_price).toLocaleString()}₫</td><td>{it.is_active?'Hiện':'Ẩn'}</td></tr>))}</tbody>
        </table>
      </div>
      <div className="space-y-2">
        <input className="input" placeholder="Tên món" value={f.name} onChange={e=>setF({...f, name:e.target.value})} />
        <input className="input" placeholder="Ảnh URL" value={f.image_url} onChange={e=>setF({...f, image_url:e.target.value})} />
        <select className="input" value={f.category_id} onChange={e=>setF({...f, category_id:e.target.value})}>
          <option value="">Chọn danh mục/nhóm</option>
          {cats?.map((c:any)=>(<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <input className="input" placeholder="Mô tả" value={f.description} onChange={e=>setF({...f, description:e.target.value})} />
        <input className="input" type="number" placeholder="Giá bán (VND)" value={f.sale_price} onChange={e=>setF({...f, sale_price:e.target.value})} inputMode="numeric" />
        <input className="input" type="number" placeholder="Giá gốc (VND - chỉ admin)" value={f.cost_price} onChange={e=>setF({...f, cost_price:e.target.value})} inputMode="numeric" />
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={f.is_active} onChange={e=>setF({...f, is_active:e.target.checked})} /> Hiển thị bán</label>
        <button className="btn btn-primary w-full" onClick={submit}>Thêm món</button>
      </div>
    </div>
  </div>
}

function ManageCoupons(){
  const { data, error, mutate } = useSWR('/api/admin/coupons', fetcher)
  const [f,setF]=useState<any>({ code:'', percent_off:'', max_uses:'', active:true })
  if (error) return <div className="card p-4"><h2 className="font-semibold">Mã giảm giá</h2><p className="text-red-600 text-sm">Lỗi: {String(error.message||error)}</p></div>
  if (!data) return <div className="card p-4"><h2 className="font-semibold">Mã giảm giá</h2><p>Đang tải…</p></div>
  async function submit(){ const r=await fetch('/api/admin/coupons',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...f, percent_off:Number(f.percent_off||0), max_uses: f.max_uses?Number(f.max_uses):null })}); if (r.ok){ setF({ code:'', percent_off:'', max_uses:'', active:true }); mutate() } }
  return <div className="card p-4 space-y-3">
    <h2 className="font-semibold">Mã giảm giá</h2>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="overflow-x-auto sm:col-span-1">
        <table className="w-full text-sm"><thead><tr className="text-left"><th>Mã</th><th>%</th><th>Used</th><th>Max</th><th>TT</th></tr></thead>
          <tbody>{data.map((c:any)=>(<tr key={c.code}><td className="font-mono">{c.code}</td><td>{c.percent_off}</td><td>{c.used||0}</td><td>{c.max_uses||'-'}</td><td>{c.active?'Bật':'Tắt'}</td></tr>))}</tbody></table>
      </div>
      <div className="space-y-2">
        <input className="input" placeholder="Mã (VD: BEER10)" value={f.code} onChange={e=>setF({...f, code:e.target.value.toUpperCase()})} />
        <input className="input" type="number" placeholder="% giảm (0-100)" value={f.percent_off} onChange={e=>setF({...f, percent_off:e.target.value})} />
        <input className="input" type="number" placeholder="Số lần tối đa (tuỳ chọn)" value={f.max_uses} onChange={e=>setF({...f, max_uses:e.target.value})} />
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={f.active} onChange={e=>setF({...f, active:e.target.checked})}/> Kích hoạt</label>
        <button className="btn btn-primary w-full" onClick={submit}>Tạo mã</button>
      </div>
    </div>
  </div>
}

function ManageMembers(){
  const { data, error } = useSWR('/api/admin/members', fetcher)
  if (error) return <div className="card p-4"><h2 className="font-semibold">Thành viên</h2><p className="text-red-600 text-sm">Lỗi: {String(error.message||error)}</p></div>
  if (!data) return <div className="card p-4"><h2 className="font-semibold">Thành viên</h2><p>Đang tải…</p></div>
  return <div className="card p-4 overflow-x-auto">
    <h2 className="font-semibold mb-2">Thành viên</h2>
    <table className="w-full text-sm"><thead><tr className="text-left"><th>SĐT</th><th>Tên</th><th>Điểm</th><th>Hạng</th></tr></thead>
      <tbody>{data.map((m:any)=>(<tr key={m.phone}><td className="font-mono">{m.phone}</td><td>{m.name||'-'}</td><td>{m.points}</td><td>{m.tier}</td></tr>))}</tbody>
    </table>
  </div>
}
