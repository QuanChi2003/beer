'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Item {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category_id: string;
  sale_price: number;
}

interface MenuItemProps {
  item: Item;
  setToast: (message: string | null) => void;
}

export default function MenuItem({ item, setToast }: MenuItemProps) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex((i: { id: string }) => i.id === item.id);
    if (index >= 0) cart[index].qty += 1;
    else cart.push({ id: item.id, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    setToast(`Đã thêm ${item.name} vào giỏ`);
  };

  return (
    <Card className="p-4">
      <Image src={item.image_url} alt={item.name} width={200} height={200} className="rounded" />
      <h4 className="font-semibold">{item.name}</h4>
      <p>{item.description}</p>
      <p>{item.sale_price} VND</p>
      <Button onClick={addToCart}>Thêm</Button>
    </Card>
  );
}