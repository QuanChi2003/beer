'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';

interface Item {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category_id: string;
  sale_price: number;
  cost_price: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function ItemManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [salePrice, setSalePrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/items').then((res) => res.json()).then(setItems);
    fetch('/api/admin/categories').then((res) => res.json()).then(setCategories);
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `item-${Date.now()}`,
          name,
          description,
          image_url: imageUrl,
          category_id: categoryId,
          sale_price: salePrice,
          cost_price: costPrice,
          is_active: isActive,
        }),
      });
      if (res.ok) {
        setToast('Thêm món thành công');
        setName('');
        setDescription('');
        setImageUrl('');
        setCategoryId('');
        setSalePrice(0);
        setCostPrice(0);
        setIsActive(true);
        fetch('/api/admin/items').then((res) => res.json()).then(setItems);
      } else {
        setToast('Thêm món thất bại');
      }
    } catch {
      setToast('Thêm món thất bại');
    }
  };

  return (
    <Card className="p-4 mt-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h2 className="text-2xl font-bold">Quản lý món</h2>
      <div className="mt-4">
        <Input
          placeholder="Tên món"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="URL ảnh"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mb-2"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mb-2 border rounded px-3 py-2 w-full"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Giá bán"
          value={salePrice}
          onChange={(e) => setSalePrice(Number(e.target.value))}
          className="mb-2"
        />
        <Input
          type="number"
          placeholder="Giá gốc"
          value={costPrice}
          onChange={(e) => setCostPrice(Number(e.target.value))}
          className="mb-2"
        />
        <label>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Kích hoạt
        </label>
        <Button onClick={handleSubmit} variant="primary" className="mt-2">
          Thêm món
        </Button>
      </div>
      <div className="mt-4">
        {items.map((item) => (
          <div key={item.id} className="border-t py-2">
            <p>
              {item.name} (Giá bán: {item.sale_price}, Giá gốc: {item.cost_price}, Kích hoạt: {item.is_active ? 'Có' : 'Không'})
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}