'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrderFormProps {
  setToast: (message: string | null) => void;
}

export default function OrderForm({ setToast }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const handleSubmit = async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          order_type: orderType,
          table_number: orderType === 'dine-in' ? tableNumber : undefined,
          customer_name: orderType === 'delivery' ? customerName : undefined,
          phone: orderType === 'delivery' ? phone : undefined,
          address: orderType === 'delivery' ? address : undefined,
          note,
          coupon_code: couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast(`Đặt thành công! Mã đơn: ${data.id}`);
        localStorage.removeItem('cart');
      } else {
        setToast(data.error || 'Đặt hàng thất bại');
      }
    } catch {
      setToast('Đặt hàng thất bại');
    }
  };

  return (
    <div className="mt-4">
      <label>
        Loại đơn:
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as 'dine-in' | 'delivery')}
          className="ml-2"
        >
          <option value="dine-in">Tại bàn</option>
          <option value="delivery">Ship</option>
        </select>
      </label>
      {orderType === 'dine-in' && (
        <Input
          placeholder="Số bàn"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="mt-2"
        />
      )}
      {orderType === 'delivery' && (
        <>
          <Input
            placeholder="Tên khách hàng"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-2"
          />
          <Input
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2"
          />
          <Input
            placeholder="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2"
          />
        </>
      )}
      <Input
        placeholder="Ghi chú"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2"
      />
      <Input
        placeholder="Mã coupon"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        className="mt-2"
      />
      <Button onClick={handleSubmit} variant="primary" className="mt-4">
        Đặt hàng
      </Button>
    </div>
  );
}