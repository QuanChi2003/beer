
'use client'
import Link from 'next/link'
export default function Nav(){
  return (
    <header className="nav">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="btn" href="/menu">Menu</Link>
          <Link className="btn" href="/checkout">Đặt món</Link>
          <Link className="btn" href="/account">Tài khoản</Link>
          <Link className="btn" href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
