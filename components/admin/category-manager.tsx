'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  pos: number;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [pos, setPos] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: `cat-${Date.now()}`, name, parent_id: parentId || null, pos }),
      });
      if (res.ok) {
        setToast('Thêm danh mục thành công');
        setName('');
        setParentId('');
        setPos(0);
        fetch('/api/admin/categories').then((res) => res.json()).then(setCategories);
      } else {
        setToast('Thêm danh mục thất bại');
      }
    } catch {
      setToast('Thêm danh mục thất bại');
    }
  };

  return (
    <Card className="p-4 mt-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
      <div className="mt-4">
        <Input
          placeholder="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="ID danh mục cha (nếu có)"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mb-2"
        />
        <Input
          type="number"
          placeholder="Vị trí"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="mb-2"
        />
        <Button onClick={handleSubmit} variant="primary">
          Thêm danh mục
        </Button>
      </div>
      <div className="mt-4">
        {categories.map((cat) => (
          <div key={cat.id} className="border-t py-2">
            <p>{cat.name} (ID: {cat.id}, Parent: {cat.parent_id || 'None'}, Pos: {cat.pos})</p>
          </div>
        ))}
      </div>
    </Card>
  );
}