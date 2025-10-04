const { Pool } = require('pg');
const { hash } = require('./helpers/bcrypt');

const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });

async function migrateIfNeeded(){
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      create table if not exists users(
        id serial primary key,
        email text unique not null,
        name text not null,
        password_hash text not null,
        role text not null default 'customer'
      );
      create table if not exists branches(
        id serial primary key,
        name text not null,
        address text,
        phone text,
        hours text
      );
      create table if not exists categories(
        id serial primary key,
        name text not null
      );
      create table if not exists subcategories(
        id serial primary key,
        category_id int not null references categories(id) on delete cascade,
        name text not null
      );
      create table if not exists menu_items(
        id serial primary key,
        branch_id int not null references branches(id) on delete cascade,
        category_id int references categories(id),
        subcategory_id int references subcategories(id),
        name text not null,
        description text,
        image_url text,
        sale_price int not null,
        cost_price int not null,
        is_available boolean not null default true
      );
      create table if not exists coupons(
        id serial primary key,
        code text unique not null,
        type text not null check (type in ('percent','fixed')),
        value int not null,
        min_total int not null default 0,
        redemptions int not null default 0
      );
      create table if not exists orders(
        id serial primary key,
        user_id int not null references users(id),
        branch_id int not null references branches(id),
        order_type text not null check (order_type in ('dine-in','delivery')),
        table_number text,
        delivery_name text, delivery_phone text, delivery_address text,
        status text not null default 'pending',
        subtotal_sale int not null default 0,
        subtotal_cost int not null default 0,
        discount int not null default 0,
        total int not null default 0,
        profit int not null default 0,
        coupon_id int references coupons(id),
        created_at timestamptz not null default now(),
        shipping_fee int not null default 0,
        shipping_cost int not null default 0,
        extra_cost int not null default 0
      );
      create table if not exists order_items(
        id serial primary key,
        order_id int not null references orders(id) on delete cascade,
        item_id int not null references menu_items(id),
        name text not null,
        qty int not null,
        sale_price int not null,
        cost_price int not null
      );
    `);

    // Seed admin
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminEmail = adminUser.includes('@') ? adminUser : (adminUser + '@example.com');
    const adminPass = process.env.ADMIN_PASS || 'admin';
    const ex = await client.query('select 1 from users where email=$1', [adminEmail]);
    if (!ex.rowCount){
      const pw = await hash(adminPass);
      await client.query('insert into users (email,name,password_hash,role) values ($1,$2,$3,$4)', [adminEmail, 'Admin', pw, 'admin']);
    }
    // Seed branches
    const br = await client.query('select count(*) c from branches'); const bc = parseInt(br.rows[0].c,10);
    if (!bc){
      await client.query('insert into branches (name,address,phone,hours) values ($1,$2,$3,$4)', ['Trung tâm','123 ABC, Q.1','0123 456 789','08:00 - 22:00']);
    }
    // Seed categories/subcategories
    const ccount = await client.query('select count(*) c from categories'); const cc = parseInt(ccount.rows[0].c,10);
    if (!cc){
      const cats = ['Nước','Đồ nhậu','Đồ ăn nhanh','Đồ ăn vặt','Bia rượu'];
      for (const n of cats) await client.query('insert into categories (name) values ($1)', [n]);
      const cmapRows = await client.query('select id,name from categories'); const cmap = {}; cmapRows.rows.forEach(c=> cmap[c.name]=c.id);
      const subs = [['Nước','Có ga'], ['Nước','Không ga'], ['Đồ nhậu','Gà'], ['Đồ nhậu','Vịt'], ['Bia rượu','Bia'], ['Bia rượu','Rượu']];
      for (const [cat, name] of subs) await client.query('insert into subcategories (category_id,name) values ($1,$2)', [cmap[cat], name]);
    }
    // Seed items
    const icount = await client.query('select count(*) c from menu_items'); const ic = parseInt(icount.rows[0].c,10);
    if (!ic){
      const cidRows = await client.query('select id,name from categories'); const cid = {}; cidRows.rows.forEach(c=> cid[c.name]=c.id);
      const sidrows = await client.query('select s.id, s.name sname, c.name cname from subcategories s join categories c on c.id=s.category_id');
      const sid = {}; sidrows.rows.forEach(x=> sid[`${x.cname}:${x.sname}`]=x.id);
      const items = [
        { name:'Coca-Cola lon', sale:15000, cost:7000, cat: cid['Nước'], sub: sid['Nước:Có ga'] },
        { name:'Trà đào', sale:30000, cost:15000, cat: cid['Nước'], sub: sid['Nước:Không ga'] },
        { name:'Gà nướng', sale:150000, cost:90000, cat: cid['Đồ nhậu'], sub: sid['Đồ nhậu:Gà'] },
        { name:'Vịt quay', sale:170000, cost:110000, cat: cid['Đồ nhậu'], sub: sid['Đồ nhậu:Vịt'] },
        { name:'Burger bò', sale:55000, cost:30000, cat: cid['Đồ ăn nhanh'], sub: null },
        { name:'Bia Heineken chai', sale:25000, cost:15000, cat: cid['Bia rượu'], sub: sid['Bia rượu:Bia'] },
      ];
      for (const i of items){
        await client.query('insert into menu_items (branch_id,category_id,subcategory_id,name,description,image_url,sale_price,cost_price,is_available) values (1,$1,$2,$3,$4,$5,$6,$7,true)',
          [i.cat, i.sub, i.name, '', '', i.sale, i.cost]);
      }
    }
    // Seed coupon
    const cp = await client.query('select 1 from coupons where code=$1',['WELCOME5']);
    if (!cp.rowCount){
      await client.query("insert into coupons (code,type,value,min_total,redemptions) values ('WELCOME5','percent',5,100000,0)");
    }

    await client.query('COMMIT');
  } catch(e){
    await client.query('ROLLBACK'); throw e;
  } finally {
    client.release();
  }
}

module.exports = { db: pool, migrateIfNeeded };
