'use client';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Member {
  phone: string;
  name: string | null;
  points: number;
  tier: string;
}

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch('/api/admin/members')
      .then((res) => res.json())
      .then(setMembers);
  }, []);

  return (
    <Card className="p-4 mt-4">
      <h2 className="text-2xl font-bold">Danh sách thành viên</h2>
      <div className="mt-4">
        {members.map((member) => (
          <div key={member.phone} className="border-t py-2">
            <p>
              {member.name || 'Chưa cập nhật'} (SĐT: {member.phone}, Điểm: {member.points}, Hạng: {member.tier})
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}