'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import Image from 'next/image';
import MenuItem from '@/components/menu-item';

interface Category { id: string; name: string; parent_id: string | null; pos: number }
interface Item { id: string; name: string; description: string; image_url: string; category_id: string; sale_price: number }

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/menu')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories);
        setItems(data.items);
      });

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      // Cart logic handled in MenuItem component
    }
  }, []);

  const parentCategories = categories.filter((c) => !c.parent_id);
  return (
    <div className="p-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {parentCategories.map((parent) => (
        <div key={parent.id} className="mb-8">
          <h2 className="text-2xl font-bold">{parent.name}</h2>
          {categories.filter((c) => c.parent_id === parent.id).map((child) => (
            <div key={child.id} className="mt-4">
              <h3 className="text-xl font-semibold">{child.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.filter((i) => i.category_id === child.id).map((item) => (
                  <MenuItem key={item.id} item={item} setToast={setToast} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}