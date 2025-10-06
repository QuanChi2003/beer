'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface CartItem {
  id: string;
  qty: number;
}
interface Item {
  id: string;
  name: string;
  sale_price: number;
}

interface CartProps {
  setToast: (message: string | null) => void;
}

export default function Cart({ setToast }: CartProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    fetch('/api/public/menu')
      .then((res) => res.json())
      .then((data) => setItems(data.items));
  }, []);

  return (
    <Card className="p-4 mt-4">
      <h3 className="text-xl font-semibold">Giỏ hàng</h3>
      {cart.map((it) => {
        const item = items.find((i) => i.id === it.id);
        return item ? (
          <div key={it.id} className="border-t py-2">
            {item.name} x {it.qty} = {item.sale_price * it.qty} VND
          </div>
        ) : null;
      })}
    </Card>
  );
}