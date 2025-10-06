'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import Cart from '@/components/cart';
import OrderForm from '@/components/order-form';

export default function Checkout() {
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="p-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Card className="p-4">
        <h2 className="text-2xl font-bold">Thanh toán</h2>
        <Cart setToast={setToast} />
        <OrderForm setToast={setToast} />
        <p className="mt-4 text-sm text-gray-600">
          Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi
        </p>
      </Card>
    </div>
  );
}