
'use client'
import useSWR from 'swr'
import { useState } from 'react'
const f=(u:string)=>fetch(u).then(async r=>{ if(!r.ok) throw new Error(await r.text()); return r.json() })
export default function Account(){
  const [phone,setPhone]=useState('')
  const [q,setQ]=useState<string|null>(null)
  const { data, error } = useSWR(q?('/api/account/orders?phone='+encodeURIComponent(q)):null, f)
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Tài khoản</h1>
      <div className="card p-4 space-y-3">
        <div className="flex gap-2"><input className="input" placeholder="Nhập số điện thoại đã đặt" value={phone} onChange={e=>setPhone(e.target.value)} /><button className="btn btn-primary" onClick={()=>setQ(phone.trim())}>Tra cứu</button></div>
        {error && <p className="text-red-600 text-sm">{String(error.message||error)}</p>}
        {data && (
          <>
            {data.member ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="badge border-amber-500 text-amber-600">Hạng: <b className="ml-1">{data.member.tier}</b></span>
                <span className="badge">Điểm: <b className="ml-1">{data.member.points}</b></span>
              </div>
            ):<p className="text-sm">Chưa có hồ sơ thành viên. Đặt đơn mới bằng SĐT này để hệ thống tự tạo & tích điểm.</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left"><th>Mã đơn</th><th>Ngày</th><th>Tổng</th></tr></thead>
                <tbody>{data.orders.map((o:any)=>(<tr key={o.id}><td className="font-mono">{o.id}</td><td>{new Date(o.created_at).toLocaleString('vi-VN')}</td><td>{Number(o.total).toLocaleString()}₫</td></tr>))}</tbody>
              </table>
            </div>
          </>
        )}
        {!data && !error && q && <p>Đang tải…</p>}
      </div>
    </section>
  )
}
