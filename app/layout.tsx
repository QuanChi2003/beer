
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { CartProvider } from '@/components/Cart'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beer-kappa.vercel.app'),
  title: 'Beer Cầu Gẫy — Order',
  description: 'Đặt món nhanh, trải nghiệm mượt.',
  openGraph: { title: 'Beer Cầu Gẫy', images: ['/og.png'] }
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="vi">
      <body className="bg-foam">
        <CartProvider>
          <Nav />
          <main className="container">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
