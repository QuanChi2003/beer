
-- 02_seed.sql
insert into categories (name, parent_id, pos) values
('Drinks', null, 1),
('Bites', null, 2),
('Fast Food', null, 3),
('Snacks', null, 4),
('Beer & Spirits', null, 5);

with roots as (
  select id, name from categories where parent_id is null
)
insert into categories (name, parent_id, pos)
values
('Carbonated', (select id from roots where name='Drinks'), 1),
('Non-carbonated', (select id from roots where name='Drinks'), 2),
('Chicken', (select id from roots where name='Bites'), 1),
('Duck', (select id from roots where name='Bites'), 2);

insert into items (name, description, image_url, category_id, cost_price, sale_price, is_active) values
('Cola 330ml','Chilled can','https://images.unsplash.com/photo-1517686469429-8bdb88b9f907',
 (select id from categories where name='Carbonated'), 7000, 15000, true),
('Iced Tea','Homemade tea','https://images.unsplash.com/photo-1519677100203-a0e668c92439',
 (select id from categories where name='Non-carbonated'), 5000, 12000, true),
('Fried Chicken','Crispy chicken','https://images.unsplash.com/photo-1544025162-d76694265947',
 (select id from categories where name='Chicken'), 35000, 65000, true),
('Crispy Duck','Golden roasted duck','https://images.unsplash.com/photo-1625944527793-08d0b1a4dd1a',
 (select id from categories where name='Duck'), 45000, 90000, true);
