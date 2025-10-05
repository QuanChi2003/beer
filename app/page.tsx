
import Link from 'next/link'
export default async function Home(){
  return (
    <section className="py-8 space-y-10">
      <div className="p-8 md:p-12 border rounded-xl bg-white shadow-card">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold">Beer Cầu Gẫy</h1>
          <p className="text-lg text-neutral-700">UX thân thiện • Chuẩn SEO • Mobile first <span className="text-sm text-neutral-500"> · cre:Quân</span></p>
          <p className="mt-1 text-sm text-neutral-600">(Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi)</p>
          <div className="flex flex-wrap gap-3 pt-6">
            <Link href="/menu" className="btn btn-primary">Xem Menu</Link>
            <Link href="/checkout" className="btn">Đặt món</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
