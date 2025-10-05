
import Logo from '@/components/Logo'
import Link from 'next/link'

export default async function Home(){
  return (
    <section className="py-8 space-y-10">
      <div className="hero foam-divider p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="mb-3"><Logo /></div>
          <p className="text-lg text-neutral-700">
            UX thân thiện • Chuẩn SEO • Hiển thị hoàn hảo trên mọi thiết bị. <br />
            <span className="text-sm text-neutral-500">cre:Quân</span>
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            (Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi)
          </p>
          <div className="flex flex-wrap gap-3 pt-6">
            <Link href="/menu" className="btn btn-primary">Xem Menu</Link>
            <Link href="/checkout" className="btn">Đặt món</Link>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-1">Quản lý đa chi nhánh</h3>
          <p className="text-sm text-neutral-600">Một website – một hệ thống để điều phối nhiều cửa hàng.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-1">Mã giảm giá & Marketing</h3>
          <p className="text-sm text-neutral-600">Tạo mã nhanh, theo dõi hiệu quả ngay trong Admin.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-1">Thông báo tức thời</h3>
          <p className="text-sm text-neutral-600">Gửi Telegram khi đơn thành công, hiển thị rõ lợi nhuận.</p>
        </div>
      </div>
    </section>
  )
}
