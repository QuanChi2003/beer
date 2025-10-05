
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin(){
  const [u,setU] = useState('')
  const [p,setP] = useState('')
  const [err,setErr] = useState('')
  const router = useRouter()
  const submit = async()=>{
    setErr('')
    const res = await fetch('/api/admin/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username:u,password:p})})
    if (res.ok) router.push('/admin')
    else setErr('Sai tài khoản hoặc mật khẩu')
  }
  return (
    <section className="py-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Đăng nhập Admin</h1>
      <div className="card p-4 space-y-3">
        <div><label className="label">Tài khoản</label><input className="input" value={u} onChange={e=>setU(e.target.value)} /></div>
        <div><label className="label">Mật khẩu</label><input className="input" type="password" value={p} onChange={e=>setP(e.target.value)} /></div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button onClick={submit} className="btn btn-primary w-full">Đăng nhập</button>
      </div>
    </section>
  )
}
