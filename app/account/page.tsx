'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';

interface Order {
  id: string;
  created_at: string;
  total: number;
}
interface Member {
  name: string;
  points: number;
  tier: string;
}

export default function Account() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      const res = await fetch(`/api/account/orders?phone=${phone}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
        setMember(data.member);
      } else {
        setToast(data.error || 'Không tìm thấy thông tin');
      }
    } catch {
      setToast('Lỗi khi tra cứu');
    }
  };

  return (
    <div className="p-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Card className="p-4">
        <h2 className="text-2xl font-bold">Tài khoản</h2>
        <div className="mt-4">
          <Input
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button onClick={handleSearch} variant="primary" className="mt-2">
            Tra cứu
          </Button>
        </div>
        {member && (
          <div className="mt-4">
            <p>Họ tên: {member.name || 'Chưa cập nhật'}</p>
            <p>Điểm: {member.points}</p>
            <p>Hạng: {member.tier}</p>
          </div>
        )}
        {orders.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">Lịch sử đơn hàng</h3>
            {orders.map((order) => (
              <div key={order.id} className="border-t py-2">
                <p>Mã đơn: {order.id}</p>
                <p>Ngày: {new Date(order.created_at).toLocaleString()}</p>
                <p>Tổng: {order.total} VND</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}