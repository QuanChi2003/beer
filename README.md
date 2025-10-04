# Beer Cầu Gẫy · Vercel-ready

Express chạy dưới dạng **Vercel Serverless Function**, dùng **Supabase Postgres** (qua connection string), **cookie-session**, PDF tạo ở `/tmp`, Telegram thông báo (kèm PDF/QR).

## Deploy 1 phát (Vercel)
1. Tạo project **Supabase** (nếu chưa có).
2. Lấy **Connection string** (psql) trong Supabase: *Project Settings → Database → Connection string*. Đặt vào biến môi trường **`SUPABASE_DB_URL`** trên Vercel.
3. Trên Vercel, tạo Project (Import từ repo này hoặc upload), thêm ENV:
   - `SUPABASE_DB_URL` = `postgres://...@db.xxx.supabase.co:5432/postgres`
   - `APP_URL` = `https://tên-miền-của-bạn.vercel.app`
   - `SESSION_SECRET`, `COOKIE_KEY_1`, `COOKIE_KEY_2`
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (để bật gửi Telegram)
   - (Tuỳ chọn email) `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SENDER_EMAIL`
   - (Tuỳ chọn seed admin) `ADMIN_USER`, `ADMIN_PASS`
4. **Deploy**. Lần chạy đầu, hệ thống **tự migrate & seed** DB (admin mặc định `admin@example.com` / `admin`).

> Không cần chạy migration thủ công.

## Tính năng
- Đặt món (Tại bàn / Giao hàng) + **lưu ý phí ship**
- **Menu phân cấp**: Danh mục → Nhóm nhỏ
- Giá bán/giá gốc (giá gốc chỉ admin/manager)
- **Lãi gộp** theo đơn, **Lãi ròng** = lãi gộp − shipping_cost − extra_cost
- Báo cáo **ngày/tuần/tháng/năm**; Tải **CSV/XLSX**
- **KDS** (/kitchen) cho bếp (role kitchen/manager/admin)
- **Telegram** (emoji) + **PDF** (QR) gửi kèm
- **Phân quyền**: customer/staff/kitchen/manager/admin

## Dev local
```bash
cp .env.example .env
# sửa SUPABASE_DB_URL thành chuỗi kết nối Postgres của bạn
npm install
vercel dev
# http://localhost:3000
```
