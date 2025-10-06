import '@/styles/globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Beer Cầu Gẫy',
  description: 'Website đặt hàng Beer Cầu Gẫy',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}