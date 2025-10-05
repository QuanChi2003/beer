
'use client'
import { useCart } from '@/components/Cart'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

export default function CheckoutPage(){
  const { items, setQty, remove, clear, total } = useCart()
  const { push } = useToast()
  const [orderType,setOrderType]=useState<'dine-in'|'delivery'>('dine-in')
  const [tableNo,setTableNo]=useState('')
  const [name,setName]=useState('')
  const [phone,setPhone]=useState('')
  const [addr,setAddr]=useState('')
  const [note,setNote]=useState('')
  const [coupon,setCoupon]=useState('')
  const [done,setDone]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')

  const validate=()=>{
    if (!items.length) return 'Giỏ hàng trống'
    if (orderType==='dine-in' && !tableNo.trim()) return 'Vui lòng nhập số bàn'
    if (orderType==='delivery' && (!name.trim()||!phone.trim()||!addr.trim())) return 'Vui lòng nhập đủ tên, SĐT, địa chỉ'
    return ''
  }
  const place=async()=>{
    const v=validate(); if(v){ setErr(v); push(v); return }
    setErr(''); setLoading(true)
    try{
      const res = await fetch('/api/orders',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        items: items.map(i=>({id:i.id, qty:i.qty})), order_type: orderType, table_number: tableNo||undefined, customer_name:name||undefined, phone:phone||undefined, address:addr||undefined, note:note||undefined, coupon_code: coupon||undefined
      })})
      const text = await res.text(); setLoading(false)
      if(!res.ok){ setErr(text||'Lỗi'); push('Có lỗi'); return }
      const data = JSON.parse(text); setDone(data); clear(); push(data.notify?'Đặt thành công (đã gửi Telegram)':'Đặt thành công (chưa gửi Telegram)')
    }catch{ setLoading(false); setErr('Lỗi kết nối'); push('Lỗi kết nối') }
  }

  return (
    <section className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-3">Thanh toán</h1>
        {err && <p className="text-red-600">{err}</p>}
        {!done && (
          <div className="card p-4 space-y-3">
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" checked={orderType==='dine-in'} onChange={()=>setOrderType('dine-in')} /> Tại bàn</label>
              <label className="flex items-center gap-2"><input type="radio" checked={orderType==='delivery'} onChange={()=>setOrderType('delivery')} /> Ship</label>
            </div>
            {orderType==='dine-in' ? (
              <div><label className="text-sm">Số bàn</label><input className="input" value={tableNo} onChange={e=>setTableNo(e.target.value)} placeholder="VD: B12" /></div>
            ):(
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-sm">Tên khách</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
                <div><label className="text-sm">Số điện thoại</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
                <div className="sm:col-span-2"><label className="text-sm">Địa chỉ</label><input className="input" value={addr} onChange={e=>setAddr(e.target.value)} /></div>
                <p className="sm:col-span-2 text-xs text-neutral-500">(Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi)</p>
              </div>
            )}
            <div><label className="text-sm">Mã giảm giá</label><input className="input" placeholder="VD: BEER10" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} /></div>
            <div><label className="text-sm">Ghi chú</label><input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Không cay, thêm đá..." /></div>
            <button className="btn btn-primary" disabled={loading} onClick={place}>{loading?'Đang đặt…':'Đặt món'}</button>
          </div>
        )}
        {done && <div className="card p-4"><h2 className="font-semibold">Đặt hàng thành công 🎉</h2><p>Tổng: <b>{done.total.toLocaleString()}₫</b> · Lợi nhuận: <b>{done.profit.toLocaleString()}₫</b></p></div>}
      </div>
      <aside className="lg:col-span-1 card p-4">
        <h3 className="font-semibold mb-2">Giỏ hàng</h3>
        {!items.length ? <p>Chưa có món.</p> : items.map(i=>(
          <div key={i.id} className="flex items-center justify-between gap-2 py-1">
            <div><div className="font-medium">{i.name}</div><div className="text-xs text-neutral-500">{i.price.toLocaleString()}₫</div></div>
            <div className="flex items-center gap-2">
              <button className="btn" onClick={()=>setQty(i.id, Math.max(1,i.qty-1))}>-</button>
              <span>{i.qty}</span>
              <button className="btn" onClick={()=>setQty(i.id, i.qty+1)}>+</button>
              <button className="btn" onClick={()=>{if(confirm('Xoá món này?')) remove(i.id)}}>X</button>
            </div>
          </div>
        ))}
        <div className="flex justify-between font-semibold pt-2 border-t mt-2"><span>Tạm tính</span><span>{total.toLocaleString()}₫</span></div>
      </aside>
    </section>
  )
}
