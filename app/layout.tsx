
import './globals.css'
import Nav from '@/components/Nav'
import { ToastProvider } from '@/components/Toast'
import { CartProvider } from '@/components/Cart'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beer-teal.vercel.app'),
  title: 'Beer Cầu Gẫy — DB',
  description: 'Website order cho quán Beer Cầu Gẫy (cre:Quân)',
  openGraph:{ images:['/og.png'] }
}
export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="vi"><body>
      <ToastProvider><CartProvider>
        <Nav />
        <main className="container py-6">{children}</main>
      </CartProvider></ToastProvider>
    </body></html>
  )
}
