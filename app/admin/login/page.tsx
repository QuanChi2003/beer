
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
export default function AdminLogin(){
  const [u,setU]=useState(''); const [p,setP]=useState(''); const [err,setErr]=useState('')
  const router = useRouter(); const { push } = useToast()
  const submit=async()=>{
    setErr('')
    const r = await fetch('/api/admin/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:u,password:p})})
    if(r.ok){ push('Đăng nhập thành công'); router.push('/admin') } else setErr(await r.text()||'Sai tài khoản/mật khẩu')
  }
  return <section className="max-w-sm mx-auto space-y-3">
    <h1 className="text-2xl font-bold">Đăng nhập Admin</h1>
    <div className="card p-4 space-y-2">
      <div><label className="text-sm">Tài khoản</label><input className="input" value={u} onChange={e=>setU(e.target.value)} placeholder="admin (mặc định)" /></div>
      <div><label className="text-sm">Mật khẩu</label><input className="input" type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="admin (mặc định)" /></div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn btn-primary w-full" onClick={submit}>Đăng nhập</button>
    </div>
  </section>
}
