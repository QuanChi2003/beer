require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const moment = require('moment');
const { migrateIfNeeded, db } = require('../src/pgdb');
const { sendTelegramMessage, sendTelegramDocument } = require('../src/helpers/telegram');
const { generateInvoicePDF } = require('../src/helpers/invoice');
const { applyCouponSync } = require('../src/helpers/coupons');
const { hash, compare } = require('../src/helpers/bcrypt');
const { money } = require('../src/helpers/money');

const app = express();

let MIGRATED = false;
async function ensureMigrate(){
  if (!MIGRATED){
    await migrateIfNeeded();
    MIGRATED = true;
  }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(helmet({ contentSecurityPolicy:false }));
app.use(express.urlencoded({ extended:true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use(cookieSession({
  name: 'sess',
  keys: [process.env.COOKIE_KEY_1 || 'k1', process.env.COOKIE_KEY_2 || 'k2'],
  httpOnly: true, sameSite: 'lax', secure: true, maxAge: 7*24*60*60*1000
}));

const csrfProtection = csrf();

function ensureAuth(req,res,next){
  if (req.session && req.session.user) return next();
  res.redirect('/auth/login?next=' + encodeURIComponent(req.originalUrl));
}
function ensureRole(roles){
  return (req,res,next)=>{
    if (!req.session || !req.session.user) return res.redirect('/auth/login');
    if (!roles.includes(req.session.user.role)) return res.status(403).render('static',{title:'403',content:'Không có quyền'});
    next();
  };
}

app.use((req,res,next)=>{
  res.locals.user = req.session.user || null;
  res.locals.moment = moment;
  res.locals.APP_URL = process.env.APP_URL || 'http://localhost:3000';
  next();
});

app.get('/', csrfProtection, async (req,res)=>{
  await ensureMigrate();
  res.render('index',{ title:'Trang chủ', csrfToken: req.csrfToken() });
});

app.get('/auth/login', (req,res)=> res.render('auth/login',{ title:'Đăng nhập', next:req.query.next||'/' }));
app.post('/auth/login', async (req,res)=>{
  await ensureMigrate();
  const { email, password, next } = req.body;
  const r = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  const u = r.rows[0];
  if (!u || !(await compare(password, u.password_hash))) return res.redirect('/auth/login?err=1');
  req.session.user = { id: u.id, email: u.email, name: u.name, role: u.role };
  res.redirect(next || '/');
});
app.get('/auth/register', (req,res)=> res.render('auth/register',{ title:'Đăng ký' }));
app.post('/auth/register', async (req,res)=>{
  await ensureMigrate();
  const { email, name, password } = req.body;
  const ex = await db.query('SELECT 1 FROM users WHERE email=$1', [email]);
  if (ex.rows.length) return res.redirect('/auth/register?err=2');
  const pw = await hash(password);
  await db.query('INSERT INTO users (email,name,password_hash,role) VALUES ($1,$2,$3,$4)', [email, name, pw, 'customer']);
  res.redirect('/auth/login?just=1');
});
app.post('/auth/logout', (req,res)=>{ req.session = null; res.redirect('/'); });

app.get('/menu', csrfProtection, async (req,res)=>{
  await ensureMigrate();
  const branch_id = parseInt(req.query.branch_id||'1',10);
  const branches = (await db.query('SELECT * FROM branches ORDER BY name')).rows;
  const branch = (await db.query('SELECT * FROM branches WHERE id=$1', [branch_id])).rows[0];
  const categories = (await db.query('SELECT * FROM categories ORDER BY name')).rows;
  const subcategories = (await db.query('SELECT * FROM subcategories ORDER BY name')).rows;
  const items = (await db.query('SELECT * FROM menu_items WHERE is_available=true AND branch_id=$1', [branch_id])).rows;
  res.render('menu', { title:'Thực đơn', branches, branch, categories, subcategories, items, csrfToken: req.csrfToken() });
});

app.get('/account', ensureAuth, csrfProtection, (req,res)=> res.render('account', { title:'Tài khoản', csrfToken: req.csrfToken() }));
app.get('/orders', ensureAuth, csrfProtection, async (req,res)=>{
  const orders = (await db.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.session.user.id])).rows;
  res.render('orders', { title:'Đơn hàng', orders, csrfToken: req.csrfToken() });
});
app.get('/checkout', ensureAuth, csrfProtection, async (req,res)=>{
  const branches = (await db.query('SELECT * FROM branches ORDER BY name')).rows;
  res.render('checkout', { title:'Thanh toán', branches, csrfToken: req.csrfToken() });
});

app.post('/api/cart/add', async (req,res)=>{
  await ensureMigrate();
  const { item_id, qty=1 } = req.body;
  const item = (await db.query('SELECT * FROM menu_items WHERE id=$1', [item_id])).rows[0];
  if (!item) return res.status(404).json({ error:'Item not found' });
  if (!req.session.cart) req.session.cart = { items:[], branch_id:item.branch_id, coupon_code:null };
  if (req.session.cart.branch_id !== item.branch_id) req.session.cart = { items:[], branch_id:item.branch_id, coupon_code:null };
  const found = (req.session.cart.items||[]).find(i=>i.id===item.id);
  if (found) found.qty += parseInt(qty,10);
  else req.session.cart.items.push({ id:item.id, name:item.name, qty: parseInt(qty,10), sale_price:item.sale_price, cost_price:item.cost_price });
  res.json({ ok:true, cart:req.session.cart });
});
app.post('/api/cart/clear', (req,res)=>{ req.session.cart = { items:[], branch_id:1, coupon_code:null }; res.json({ok:true}); });
app.post('/api/cart/coupon', (req,res)=>{ const code = (req.body.code||'').trim(); req.session.cart = req.session.cart || { items:[] }; req.session.cart.coupon_code = code || null; res.json({ ok:true, cart:req.session.cart }); });

app.post('/api/checkout', ensureAuth, async (req,res)=>{
  await ensureMigrate();
  const { order_type, branch_id, table_number, delivery_name, delivery_phone, delivery_address } = req.body;
  if (!order_type || !['dine-in','delivery'].includes(order_type)) return res.status(400).json({ error:'Loại đơn không hợp lệ' });
  if (!branch_id) return res.status(400).json({ error:'Thiếu chi nhánh' });
  if (order_type === 'dine-in' && !table_number) return res.status(400).json({ error:'Thiếu số bàn' });
  if (order_type === 'delivery' && (!delivery_name || !delivery_phone || !delivery_address)) return res.status(400).json({ error:'Thiếu thông tin giao hàng' });

  const cart = req.session.cart || { items:[] };
  if (!cart.items.length) return res.status(400).json({ error:'Giỏ hàng trống' });

  const subtotalSale = cart.items.reduce((s,i)=> s + i.sale_price*i.qty, 0);
  const subtotalCost = cart.items.reduce((s,i)=> s + i.cost_price*i.qty, 0);
  const cr = applyCouponSync(cart.coupon_code, subtotalSale);
  if (!cr.ok) return res.status(400).json({ error: cr.message });
  const discount = cr.discount || 0;
  const total = Math.max(subtotalSale - discount, 0);
  const profit = (subtotalSale - discount) - subtotalCost;

  const now = new Date();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const ins = await client.query(
      `INSERT INTO orders (user_id,branch_id,order_type,table_number,delivery_name,delivery_phone,delivery_address,status,subtotal_sale,subtotal_cost,discount,total,profit,coupon_id,created_at,shipping_fee,shipping_cost,extra_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10,$11,$12,$13,$14,0,0,0) RETURNING id`,
      [req.session.user.id, branch_id, order_type, table_number||null, delivery_name||null, delivery_phone||null, delivery_address||null, subtotalSale, subtotalCost, discount, total, profit, cr.coupon?cr.coupon.id:null, now]
    );
    const orderId = ins.rows[0].id;
    for (const it of cart.items){
      await client.query(
        'INSERT INTO order_items (order_id,item_id,name,qty,sale_price,cost_price) VALUES ($1,$2,$3,$4,$5,$6)',
        [orderId, it.id, it.name, it.qty, it.sale_price, it.cost_price]
      );
    }
    await client.query('COMMIT');

    try {
      const includeProfit = (process.env.TELEGRAM_INCLUDE_PROFIT || 'false').toLowerCase()==='true';
      let text = `🍽️ <b>ĐƠN HÀNG MỚI #${orderId}</b>\n` +
                 `🏪 Chi nhánh: <b>${branch_id}</b>\n` +
                 `📦 Hình thức: <b>${order_type==='dine-in'?'Tại bàn':'Giao hàng'}</b>\n`;
      if (order_type==='dine-in'){
        text += `🪑 Bàn: <b>${table_number}</b>\n`;
      } else {
        text += `👤 Khách: <b>${delivery_name}</b>\n📞 ${delivery_phone}\n📍 ${delivery_address}\n`;
        text += `\n⚠️ <i>Lưu ý: quán sẽ tính phí ship riêng tuỳ theo nơi</i>\n`;
      }
      text += `\n<b>Danh sách món</b>\n`;
      cart.items.forEach(i => { text += `• ${i.name} x${i.qty} — ${money(i.sale_price*i.qty)}\n`; });
      text += `\nTạm tính: <b>${money(subtotalSale)}</b>\n` +
              (discount?`Giảm: <b>-${money(discount)}</b>\n`:``) +
              `TỔNG: <b>${money(total)}</b>`;
      if (includeProfit){ text += `\n💰 Lợi nhuận (ước tính): <b>${money(profit)}</b>`; }
      await sendTelegramMessage(text);
      if ((process.env.TELEGRAM_SEND_PDF || 'false').toLowerCase()==='true'){
        const pdfPath = await generateInvoicePDF(orderId, { orderAt: now, type: order_type, branch_id, table_number, delivery_name, delivery_phone, delivery_address, items: cart.items, subtotalSale, discount, total, profit });
        await sendTelegramDocument(pdfPath, `Hóa đơn #${orderId}`);
      }
    } catch(e){ console.error('[TG]', e); }

    req.session.cart = { items:[], branch_id:1, coupon_code:null };
    res.json({ ok:true, order_id: orderId });
  } catch(e){
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error:'Lỗi tạo đơn' });
  } finally {
    client.release();
  }
});

app.get('/kitchen', ensureRole(['kitchen','manager','admin']), (req,res)=> res.render('kitchen', { title:'KDS' }));
app.get('/api/kitchen/orders', ensureRole(['kitchen','manager','admin']), async (req,res)=>{
  const rows = (await db.query(`SELECT * FROM orders WHERE status IN ('pending','confirmed','preparing','ready') ORDER BY created_at DESC LIMIT 100`)).rows;
  res.json(rows);
});
app.post('/api/kitchen/update', ensureRole(['kitchen','manager','admin']), async (req,res)=>{
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({error:'missing'});
  await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status, id]);
  res.json({ok:true});
});

app.get('/admin', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const stats = {
    users: (await db.query('SELECT COUNT(*)::int c FROM users')).rows[0].c,
    orders: (await db.query('SELECT COUNT(*)::int c FROM orders')).rows[0].c,
    revenue_today: (await db.query(`SELECT COALESCE(SUM(total),0)::bigint s FROM orders WHERE status='completed' AND created_at::date = CURRENT_DATE`)).rows[0].s,
    profit_today: (await db.query(`SELECT COALESCE(SUM(profit - shipping_cost - extra_cost),0)::bigint s FROM orders WHERE status='completed' AND created_at::date = CURRENT_DATE`)).rows[0].s,
  };
  res.render('admin/dashboard',{ title:'Bảng điều khiển', stats, csrfToken: req.csrfToken() });
});

app.get('/admin/branches', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const list = (await db.query('SELECT * FROM branches ORDER BY id')).rows;
  res.render('admin/branches',{ title:'Chi nhánh', list, csrfToken: req.csrfToken() });
});
app.post('/admin/branches/add', ensureRole(['manager','admin']), async (req,res)=>{
  const { name,address,phone,hours } = req.body;
  await db.query('INSERT INTO branches (name,address,phone,hours) VALUES ($1,$2,$3,$4)', [name,address,phone,hours]);
  res.redirect('/admin/branches');
});
app.post('/admin/branches/delete', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('DELETE FROM branches WHERE id=$1', [req.body.id]);
  res.redirect('/admin/branches');
});

app.get('/admin/menu', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const branches = (await db.query('SELECT * FROM branches ORDER BY name')).rows;
  const categories = (await db.query('SELECT * FROM categories ORDER BY name')).rows;
  const subcategories = (await db.query('SELECT s.*, c.name as category_name FROM subcategories s JOIN categories c ON c.id=s.category_id ORDER BY c.name, s.name')).rows;
  const items = (await db.query('SELECT * FROM menu_items ORDER BY id DESC')).rows;
  res.render('admin/menu',{ title:'Thực đơn', branches, categories, subcategories, items, csrfToken: req.csrfToken() });
});
app.post('/admin/categories/add', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('INSERT INTO categories (name) VALUES ($1)', [req.body.name]);
  res.redirect('/admin/menu');
});
app.post('/admin/categories/update', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('UPDATE categories SET name=$1 WHERE id=$2', [req.body.name, req.body.id]);
  res.redirect('/admin/menu');
});
app.post('/admin/categories/delete', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('DELETE FROM categories WHERE id=$1', [req.body.id]);
  res.redirect('/admin/menu');
});
app.get('/admin/subcategories', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const cats = (await db.query('SELECT * FROM categories ORDER BY name')).rows;
  const subs = (await db.query('SELECT s.*, c.name as category_name FROM subcategories s JOIN categories c ON c.id=s.category_id ORDER BY c.name, s.name')).rows;
  res.render('admin/subcategories',{ title:'Nhóm nhỏ (Subcategories)', cats, subs, csrfToken: req.csrfToken() });
});
app.post('/admin/subcategories/add', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('INSERT INTO subcategories (category_id,name) VALUES ($1,$2)', [req.body.category_id, req.body.name]);
  res.redirect('/admin/subcategories');
});
app.post('/admin/subcategories/update', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('UPDATE subcategories SET name=$1, category_id=$2 WHERE id=$3', [req.body.name, req.body.category_id, req.body.id]);
  res.redirect('/admin/subcategories');
});
app.post('/admin/subcategories/delete', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('DELETE FROM subcategories WHERE id=$1', [req.body.id]);
  res.redirect('/admin/subcategories');
});
app.post('/admin/menu/add', ensureRole(['manager','admin']), async (req,res)=>{
  const { branch_id, category_id, subcategory_id, name, description, image_url, sale_price, cost_price } = req.body;
  await db.query('INSERT INTO menu_items (branch_id,category_id,subcategory_id,name,description,image_url,sale_price,cost_price,is_available) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)',
                 [branch_id, category_id||null, subcategory_id||null, name, description||'', image_url||'', sale_price, cost_price]);
  res.redirect('/admin/menu');
});
app.post('/admin/menu/toggle', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('UPDATE menu_items SET is_available=$1 WHERE id=$2', [req.body.is_available==='1', req.body.id]);
  res.redirect('/admin/menu');
});
app.post('/admin/menu/delete', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('DELETE FROM menu_items WHERE id=$1', [req.body.id]);
  res.redirect('/admin/menu');
});

app.get('/admin/orders', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const orders = (await db.query('SELECT * FROM orders ORDER BY created_at DESC')).rows;
  res.render('admin/orders',{ title:'Đơn hàng', orders, csrfToken: req.csrfToken() });
});
app.post('/admin/orders/update', ensureRole(['manager','admin']), async (req,res)=>{
  const { id, status, shipping_cost=0, extra_cost=0 } = req.body;
  await db.query('UPDATE orders SET status=$1, shipping_cost=$2, extra_cost=$3 WHERE id=$4', [status, parseInt(shipping_cost||0,10), parseInt(extra_cost||0,10), id]);
  res.redirect('/admin/orders');
});

const { buildReports } = require('../src/helpers/reports');
app.get('/admin/reports', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const range = req.query.range || 'daily';
  const rows = await buildReports(range);
  res.render('admin/reports', { title:'Báo cáo', range, rows, csrfToken: req.csrfToken() });
});
app.get('/admin/reports.csv', ensureRole(['manager','admin']), async (req,res)=>{
  const range = req.query.range || 'daily';
  const rows = await buildReports(range);
  let csv = 'period,orders,revenue,gross_profit,net_profit\n';
  rows.forEach(r=> csv += `${r.period},${r.orders},${r.revenue||0},${r.gross_profit||0},${r.net_profit||0}\n`);
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="report_${range}.csv"`);
  res.send(csv);
});
app.get('/admin/reports.xlsx', ensureRole(['manager','admin']), async (req,res)=>{
  const range = req.query.range || 'daily';
  const rows = await buildReports(range);
  const xlsx = require('xlsx');
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, 'Report');
  const buf = xlsx.write(wb, { type:'buffer', bookType:'xlsx' });
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="report_${range}.xlsx"`);
  res.send(buf);
});

app.get('/admin/users', ensureRole(['manager','admin']), csrfProtection, async (req,res)=>{
  const users = (await db.query('SELECT id,email,name,role FROM users ORDER BY id DESC')).rows;
  res.render('admin/users', { title:'Người dùng', users, csrfToken: req.csrfToken() });
});
app.post('/admin/users/role', ensureRole(['manager','admin']), async (req,res)=>{
  await db.query('UPDATE users SET role=$1 WHERE id=$2', [req.body.role, req.body.id]);
  res.redirect('/admin/users');
});

app.use((req,res)=> res.status(404).render('static',{title:'404',content:'Không tìm thấy trang.'}));

module.exports = app;
