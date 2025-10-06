'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setToast(data.error || 'Đăng nhập thất bại');
      }
    } catch {
      setToast('Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Card className="p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Đăng nhập Admin</h2>
        <Input
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4"
        />
        <Input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleLogin} variant="primary">
          Đăng nhập
        </Button>
      </Card>
    </div>
  );
}