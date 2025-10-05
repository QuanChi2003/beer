
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { CartProvider } from '@/components/Cart'
import { Bebas_Neue, Inter } from 'next/font/google'

const display = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata = {
  title: 'Beer Cầu Gẫy — Order',
  description: 'Đặt món nhanh, trải nghiệm mượt.',
  openGraph: { title: 'Beer Cầu Gẫy', images: ['/og.png'] }
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang="vi">
      <body className={`${display.variable} ${body.variable} font-body bg-foam`}>
        <CartProvider>
          <Nav />
          <main className="container">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
