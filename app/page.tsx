
import Link from 'next/link'
export default function Home(){
  return (
    <section className="space-y-6">
      <div className="hero">
        <div className="flex items-start gap-6">
          <img src="/logo.svg" alt="Beer Cầu Gẫy" className="h-16 w-auto" />
          <div>
            <h1 className="text-4xl font-extrabold">Beer Cầu Gẫy — DB</h1>
            <p className="text-neutral-600">UI mượt, DB bật sẵn, báo cáo, coupon, membership · <span className="text-sm">cre:Quân</span></p>
            <p className="text-sm text-neutral-500 mt-1">Lưu ý: quán tính phí ship riêng tuỳ nơi</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link className="btn btn-primary" href="/menu">Xem Menu</Link>
              <Link className="btn" href="/checkout">Đặt món</Link>
              <Link className="btn" href="/account">Tra cứu đơn</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
