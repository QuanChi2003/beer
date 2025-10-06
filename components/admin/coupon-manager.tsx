'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';

interface Coupon {
  code: string;
  percent_off: number;
  max_uses: number;
  used: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [percentOff, setPercentOff] = useState(0);
  const [maxUses, setMaxUses] = useState(0);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [active, setActive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/coupons').then((res) => res.json()).then(setCoupons);
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          percent_off: percentOff,
          max_uses: maxUses,
          valid_from: validFrom,
          valid_to: validTo,
          active,
        }),
      });
      if (res.ok) {
        setToast('Thêm coupon thành công');
        setCode('');
        setPercentOff(0);
        setMaxUses(0);
        setValidFrom('');
        setValidTo('');
        setActive(true);
        fetch('/api/admin/coupons').then((res) => res.json()).then(setCoupons);
      } else {
        setToast('Thêm coupon thất bại');
      }
    } catch {
      setToast('Thêm coupon thất bại');
    }
  };

  return (
    <Card className="p-4 mt-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h2 className="text-2xl font-bold">Quản lý coupon</h2>
      <div className="mt-4">
        <Input
          placeholder="Mã coupon"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-2"
        />
        <Input
          type="number"
          placeholder="% giảm"
          value={percentOff}
          onChange={(e) => setPercentOff(Number(e.target.value))}
          className="mb-2"
        />
        <Input
          type="number"
          placeholder="Số lần sử dụng tối đa"
          value={maxUses}
          onChange={(e) => setMaxUses(Number(e.target.value))}
          className="mb-2"
        />
        <Input
          type="datetime-local"
          placeholder="Hiệu lực từ"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
          className="mb-2"
        />
        <Input
          type="datetime-local"
          placeholder="Hiệu lực đến"
          value={validTo}
          onChange={(e) => setValidTo(e.target.value)}
          className="mb-2"
        />
        <label>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Kích hoạt
        </label>
        <Button onClick={handleSubmit} variant="primary" className="mt-2">
          Thêm coupon
        </Button>
      </div>
      <div className="mt-4">
        {coupons.map((coupon) => (
          <div key={coupon.code} className="border-t py-2">
            <p>
              {coupon.code} ({coupon.percent_off}%, Đã dùng: {coupon.used}/{coupon.max_uses}, Kích hoạt: {coupon.active ? 'Có' : 'Không'})
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}