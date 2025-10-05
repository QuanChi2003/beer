
# Beer Cầu Gẫy — Order Website (Next.js + Supabase + Telegram)

Skin: amber + foam, sticky nav, CTA bo tròn. Deploy nhanh lên Vercel.

## Setup
1) Copy `.env.example` → `.env` (đổi `JWT_SECRET`).
2) Supabase → SQL → chạy: `supabase/migrations/01_schema.sql` rồi `02_seed.sql`.
3) `npm i` → `npm run dev`

## Deploy (Vercel)
- Import repo, add ENV như `.env`, Deploy.

## Admin
- `/admin/login` → `ADMIN_USER` / `ADMIN_PASS`.
- Xem báo cáo lợi nhuận theo ngày/tuần/tháng/năm, quản lý danh mục & món.
