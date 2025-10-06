'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import CategoryManager from '@/components/admin/category-manager';
import ItemManager from '@/components/admin/item-manager';
import CouponManager from '@/components/admin/coupon-manager';
import MemberList from '@/components/admin/member-list';

const ReportChart = dynamic(() => import('@/components/admin/report-chart'), { ssr: false });

export default function Admin() {
  const [range, setRange] = useState<'day' | 'week' | 'month' | 'year'>('day');

  return (
    <div className="p-4">
      <Card className="p-4 mb-4">
        <h2 className="text-2xl font-bold">Báo cáo</h2>
        <select value={range} onChange={(e) => setRange(e.target.value as any)} className="mb-4">
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
        <ReportChart range={range} />
      </Card>
      <CategoryManager />
      <ItemManager />
      <CouponManager />
      <MemberList />
    </div>
  );
}