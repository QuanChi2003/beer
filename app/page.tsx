import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <Image src="/logo.png" alt="Beer Cầu Gẫy" width={200} height={100} />
      <p className="text-sm text-gray-600">cre:Quân</p>
      <div className="flex gap-4 mt-6">
        <Link href="/menu"><Button variant="primary">Menu</Button></Link>
        <Link href="/checkout"><Button>Đặt món</Button></Link>
        <Link href="/account"><Button>Tài khoản</Button></Link>
      </div>
      <p className="mt-4 text-sm text-gray-600">Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi</p>
    </div>
  );
}