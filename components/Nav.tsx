
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import Logo from './Logo'

export default function Nav(){
  const pathname = usePathname()
  const Item = ({href, children}:{href:string, children:React.ReactNode}) => (
    <Link href={href} className={clsx(
      'px-3 py-2 rounded-md hover:text-brand transition',
      pathname===href && 'text-brand font-semibold bg-brand/10'
    )}>
      {children}
    </Link>
  )
  return (
    <header className="nav-glass">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2"><Logo small /></Link>
        <nav className="flex items-center gap-1">
          <Item href="/menu">Menu</Item>
          <Item href="/checkout">Đặt món</Item>
          <Item href="/account">Tài khoản</Item>
          <Item href="/admin">Admin</Item>
        </nav>
      </div>
    </header>
  )
}
