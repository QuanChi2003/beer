
'use client'
import { useCart } from '@/components/Cart'
import { useState } from 'react'

export default function CheckoutPage(){
  const { items, setQty, remove, clear, total } = useCart()
  const [orderType, setOrderType] = useState<'dine-in'|'delivery'>('dine-in')
  const [tableNo, setTableNo] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [addr, setAddr] = useState('')
  const [note, setNote] = useState('')
  const [coupon, setCoupon] = useState('')
  const [done, setDone] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const place = async()=>{
    setLoading(true)
    const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      items: items.map(i=>({id:i.id, qty:i.qty})), order_type: orderType, table_number: tableNo || undefined, customer_name: name || undefined, phone: phone || undefined, address: addr || undefined, note, coupon_code: coupon || undefined
    }) })
    setLoading(false)
    if (!res.ok){ alert('Có lỗi xảy ra'); return }
    const data = await res.json(); setDone(data); clear()
  }

  if (!items.length && !done) return <p className="py-10">Giỏ hàng trống. Vui lòng thêm món từ trang Menu.</p>
  return (
    <section className="py-6 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
        {!done && (
          <div className="card p-4 space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="t" checked={orderType==='dine-in'} onChange={()=>setOrderType('dine-in')} /> Tại bàn</label>
              <label className="flex items-center gap-2"><input type="radio" name="t" checked={orderType==='delivery'} onChange={()=>setOrderType('delivery')} /> Ship</label>
            </div>
            {orderType==='dine-in' ? (
              <div>
                <label className="label">Số bàn</label>
                <input className="input" value={tableNo} onChange={e=>setTableNo(e.target.value)} placeholder="VD: B12" />
              </div>
            ):(
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Tên khách</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
                <div><label className="label">Số điện thoại</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
                <div className="sm:col-span-2"><label className="label">Địa chỉ</label><input className="input" value={addr} onChange={e=>setAddr(e.target.value)} /></div>
                <p className="sm:col-span-2 text-sm text-neutral-500">(Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi)</p>
              </div>
            )}
            <div><label className="label">Ghi chú</label><input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Không cay, thêm đá..." /></div>
            <div><label className="label">Mã giảm giá</label><input className="input" value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Nhập mã nếu có" /></div>
          </div>
        )}
        {done && (
          <div className="card p-4">
            <h2 className="font-semibold">Đặt hàng thành công 🎉</h2>
            <p className="text-sm text-neutral-600">Mã đơn: <span className="font-mono">{done.id}</span></p>
            <p>Tổng: <strong>{done.total.toLocaleString()}₫</strong> · Lợi nhuận: <strong>{done.profit.toLocaleString()}₫</strong></p>
          </div>
        )}
      </div>
      <aside className="lg:col-span-1">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Giỏ hàng</h3>
          {!items.length ? <p className="text-sm text-neutral-600">Chưa có món.</p> : (
            <div className="space-y-3">
              {items.map(i=>(
                <div key={i.id} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-neutral-500">{i.price.toLocaleString()}₫</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn" onClick={()=>setQty(i.id, Math.max(1, i.qty-1))}>-</button>
                    <span>{i.qty}</span>
                    <button className="btn" onClick={()=>setQty(i.id, i.qty+1)}>+</button>
                    <button className="btn" onClick={()=>remove(i.id)}>X</button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Tạm tính</span><span>{total.toLocaleString()}₫</span>
              </div>
              {!done && <button disabled={!items.length||loading} onClick={place} className="btn btn-primary w-full">{loading?'Đang đặt…':'Đặt món'}</button>}
            </div>
          )}
        </div>
      </aside>
    </section>
  )
}
