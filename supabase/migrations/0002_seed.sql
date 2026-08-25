-- ============================================================
-- S&S FASHION — Seed data
-- Run after 0001_schema.sql
-- ============================================================

-- ---------- Brands ----------
insert into public.brands (name, logo_url) values
  ('Nike',        null),
  ('Adidas',      null),
  ('Puma',        null),
  ('New Balance', null),
  ('Converse',    null),
  ('Vans',        null),
  ('Jordan',      null),
  ('Reebok',      null),
  ('Fila',        null),
  ('Skechers',    null),
  ('Other',       null)
on conflict (name) do nothing;

-- ---------- Categories ----------
insert into public.categories (name, slug, image_url) values
  ('Running',     'running',     null),
  ('Lifestyle',   'lifestyle',   null),
  ('Basketball',  'basketball',  null),
  ('Training',    'training',    null),
  ('Sneakers',    'sneakers',    null),
  ('Slides',      'slides',      null),
  ('Boots',       'boots',       null)
on conflict (name) do nothing;

-- ---------- Products ----------
with b as (select id, name from public.brands),
     c as (select id, name from public.categories)
insert into public.products (
  id, name, brand_id, category_id, gender, price, compare_at_price,
  description, short_description, sizes, colors, images,
  rating, review_count, stock_count, sold_count,
  is_featured, is_new, slug, tags
)
select * from (
  values
  -- Air Force 1
  (
    uuid_generate_v4(),
    'Air Force 1',
    (select id from b where name = 'Nike'),
    (select id from c where name = 'Lifestyle'),
    'Unisex',
    35000, 50000,
    'The radiance lives on in the Nike Air Force 1, the b-ball original that puts a fresh spin on what you know best: stitched overlays, bold colors and the perfect amount of flash to let you shine.',
    'Iconic basketball style with modern comfort.',
    '[{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true},{"value":"12","inStock":true}]'::jsonb,
    '[{"name":"Black","hex":"#000000","image":""},{"name":"Red","hex":"#e00b0b","image":""},{"name":"Blue","hex":"#417aec","image":""}]'::jsonb,
    '[{"url":"/images/banners/3fbe6638-dd4a-431d-87bd-7ad26b24d6c8.jpeg","alt":"hero-image.jpeg"},{"url":"/images/banners/84a94271-f3bb-4a41-a44f-b0e169b92303.jpeg","alt":"hero-image3.jpeg"}]'::jsonb,
    4.4, 0, 50, 120,
    true, true, 'air-force-1', '{"basketball"}'::text[]
  ),
  -- Puma RS-X Reinvent
  (
    uuid_generate_v4(),
    'Puma RS-X Reinvent',
    (select id from b where name = 'Puma'),
    (select id from c where name = 'Running'),
    'Unisex',
    30000, 50000,
    'The RS-X Reinvent takes the Running System design language to the next level with a bold, chunky silhouette and retro color blocking.',
    'Bold 80s-inspired chunky runner.',
    '[{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true},{"value":"12","inStock":true}]'::jsonb,
    '[{"name":"White","hex":"#f1eeee","image":""},{"name":"Black","hex":"#000000","image":""}]'::jsonb,
    '[{"url":"/images/banners/19a4acc6-290d-42bc-925f-9218385d288e.jpeg","alt":"hero-image3.jpeg"}]'::jsonb,
    4.5, 0, 45, 95,
    true, true, 'puma-rs-x-reinvent', '{"lifestyle","chunky","retro","bold"}'::text[]
  ),
  -- Air Max 270
  (
    uuid_generate_v4(),
    'Air Max 270',
    (select id from b where name = 'Nike'),
    (select id from c where name = 'Running'),
    'Unisex',
    42000, 55000,
    'Nike Air Max 270 delivers the ultimate in Air Max cushioning with a large, 270-degree visible Air unit in the heel.',
    'Max Air comfort with street-ready style.',
    '[{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true},{"value":"12","inStock":true}]'::jsonb,
    '[{"name":"Black/White","hex":"#000000","image":""},{"name":"Triple Black","hex":"#1a1a1a","image":""},{"name":"White/Red","hex":"#ffffff","image":""}]'::jsonb,
    '[{"url":"/images/banners/5e8f2d10-1a2b-3c4d-5e6f-7a8b9c0d1e2f.jpeg","alt":"air-max-270-1.jpeg"},{"url":"/images/banners/6f9a3e21-2b3c-4d5e-6f7a-8b9c0d1e2f3a.jpeg","alt":"air-max-270-2.jpeg"}]'::jsonb,
    4.6, 89, 30, 210,
    true, false, 'air-max-270', '{"running","air-max","lifestyle"}'::text[]
  ),
  -- Ultraboost 22
  (
    uuid_generate_v4(),
    'Ultraboost 22',
    (select id from b where name = 'Adidas'),
    (select id from c where name = 'Running'),
    'Unisex',
    55000, 68000,
    'The Ultraboost 22 returns more energy than ever with a re-engineered Primeknit upper and Linear Energy Push system.',
    'Responsive Boost cushioning for daily runs.',
    '[{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true}]'::jsonb,
    '[{"name":"Core Black","hex":"#1a1a1a","image":""},{"name":"Cloud White","hex":"#f5f5f5","image":""},{"name":"Solar Red","hex":"#e00b0b","image":""}]'::jsonb,
    '[{"url":"/images/banners/7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d.jpeg","alt":"ultraboost-22-1.jpeg"},{"url":"/images/banners/8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e.jpeg","alt":"ultraboost-22-2.jpeg"}]'::jsonb,
    4.7, 156, 25, 180,
    true, false, 'ultraboost-22', '{"running","boost","performance"}'::text[]
  ),
  -- Jordan Retro 4
  (
    uuid_generate_v4(),
    'Jordan Retro 4',
    (select id from b where name = 'Jordan'),
    (select id from c where name = 'Basketball'),
    'Unisex',
    65000, 80000,
    'The Air Jordan 4 Retro brings back the 1989 classic with premium materials and iconic details like the mesh inserts and wing eyelets.',
    'Heritage basketball icon reimagined.',
    '[{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true}]'::jsonb,
    '[{"name":"Bred","hex":"#000000","image":""},{"name":"White/Cement","hex":"#ffffff","image":""},{"name":"Military Blue","hex":"#1a3a5c","image":""}]'::jsonb,
    '[{"url":"/images/banners/9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f.jpeg","alt":"jordan-4-1.jpeg"},{"url":"/images/banners/0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a.jpeg","alt":"jordan-4-2.jpeg"}]'::jsonb,
    4.8, 234, 15, 120,
    true, false, 'jordan-retro-4', '{"basketball","retro","heritage"}'::text[]
  ),
  -- New Balance 550
  (
    uuid_generate_v4(),
    'New Balance 550',
    (select id from b where name = 'New Balance'),
    (select id from c where name = 'Lifestyle'),
    'Unisex',
    48000, 60000,
    'The 550 pays homage to the 1989 basketball original with clean lines, premium leather, and the signature "N" logo.',
    '80s court style for modern streets.',
    '[{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true}]'::jsonb,
    '[{"name":"White/Grey","hex":"#f5f5f5","image":""},{"name":"White/Green","hex":"#ffffff","image":""},{"name":"White/Red","hex":"#ffffff","image":""}]'::jsonb,
    '[{"url":"/images/banners/1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b.jpeg","alt":"nb-550-1.jpeg"},{"url":"/images/banners/2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c.jpeg","alt":"nb-550-2.jpeg"}]'::jsonb,
    4.5, 98, 35, 110,
    false, true, 'new-balance-550', '{"lifestyle","retro","basketball"}'::text[]
  ),
  -- Converse Chuck Taylor All Star
  (
    uuid_generate_v4(),
    'Chuck Taylor All Star',
    (select id from b where name = 'Converse'),
    (select id from c where name = 'Lifestyle'),
    'Unisex',
    22000, 28000,
    'The timeless classic that started it all. Canvas upper, rubber toe cap, and diamond-pattern outsole.',
    'Iconic canvas sneaker since 1917.',
    '[{"value":"5","inStock":true},{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true},{"value":"12","inStock":true}]'::jsonb,
    '[{"name":"Black","hex":"#000000","image":""},{"name":"White","hex":"#ffffff","image":""},{"name":"Red","hex":"#e00b0b","image":""},{"name":"Navy","hex":"#001f3f","image":""}]'::jsonb,
    '[{"url":"/images/banners/3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d.jpeg","alt":"chuck-taylor-1.jpeg"},{"url":"/images/banners/4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e.jpeg","alt":"chuck-taylor-2.jpeg"}]'::jsonb,
    4.3, 412, 100, 500,
    false, false, 'chuck-taylor-all-star', '{"lifestyle","canvas","classic"}'::text[]
  ),
  -- Vans Old Skool
  (
    uuid_generate_v4(),
    'Vans Old Skool',
    (select id from b where name = 'Vans'),
    (select id from c where name = 'Lifestyle'),
    'Unisex',
    28000, 35000,
    'The first Vans shoe to feature the iconic side stripe. Low-profile canvas and suede upper with reinforced toe caps.',
    'Skate heritage with the signature side stripe.',
    '[{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true}]'::jsonb,
    '[{"name":"Black/White","hex":"#000000","image":""},{"name":"Navy/White","hex":"#001f3f","image":""},{"name":"Checkerboard","hex":"#000000","image":""}]'::jsonb,
    '[{"url":"/images/banners/5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f.jpeg","alt":"vans-old-skool-1.jpeg"},{"url":"/images/banners/6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a.jpeg","alt":"vans-old-skool-2.jpeg"}]'::jsonb,
    4.4, 287, 60, 320,
    false, false, 'vans-old-skool', '{"lifestyle","skate","classic"}'::text[]
  ),
  -- Yeezy Slide
  (
    uuid_generate_v4(),
    'Yeezy Slide',
    (select id from b where name = 'Adidas'),
    (select id from c where name = 'Slides'),
    'Unisex',
    25000, 32000,
    'Injected EVA foam slide with a soft, comfortable footbed and ridged outsole for traction.',
    'Minimalist comfort slide.',
    '[{"value":"4","inStock":true},{"value":"5","inStock":true},{"value":"6","inStock":true},{"value":"7","inStock":true},{"value":"8","inStock":true},{"value":"9","inStock":true},{"value":"10","inStock":true},{"value":"11","inStock":true}]'::jsonb,
    '[{"name":"Bone","hex":"#d4c4b0","image":""},{"name":"Resin","hex":"#6b7a5a","image":""},{"name":"Onyx","hex":"#1a1a1a","image":""}]'::jsonb,
    '[{"url":"/images/banners/7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b.jpeg","alt":"yeezy-slide-1.jpeg"},{"url":"/images/banners/8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c.jpeg","alt":"yeezy-slide-2.jpeg"}]'::jsonb,
    4.2, 176, 80, 250,
    true, false, 'yeezy-slide', '{"slides","comfort","minimalist"}'::text[]
  ),
  -- Nike Tech Fleece Joggers
  (
    uuid_generate_v4(),
    'Nike Tech Fleece Joggers',
    (select id from b where name = 'Nike'),
    (select id from c where name = 'Lifestyle'),
    'Unisex',
    18000, 25000,
    'Premium lightweight fleece with a smooth feel on both sides. Tapered legs and zippered side pockets.',
    'Premium lightweight fleece for everyday wear.',
    '[{"value":"XS","inStock":true},{"value":"S","inStock":true},{"value":"M","inStock":true},{"value":"L","inStock":true},{"value":"XL","inStock":true},{"value":"XXL","inStock":true}]'::jsonb,
    '[{"name":"Black","hex":"#000000","image":""},{"name":"Grey","hex":"#808080","image":""},{"name":"Navy","hex":"#001f3f","image":""}]'::jsonb,
    '[{"url":"/images/banners/9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d.jpeg","alt":"tech-fleece-1.jpeg"},{"url":"/images/banners/0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e.jpeg","alt":"tech-fleece-2.jpeg"}]'::jsonb,
    4.5, 67, 40, 150,
    false, false, 'nike-tech-fleece-joggers', '{"apparel","fleece","lifestyle"}'::text[]
  )
) as v(id, name, brand_id, category_id, gender, price, compare_at_price, description, short_description, sizes, colors, images, rating, review_count, stock_count, sold_count, is_featured, is_new, slug, tags)
on conflict (slug) do nothing;

-- ---------- Coupons ----------
insert into public.coupons (code, discount_type, discount_value, is_active, expires_at) values
  ('WELCOME10', 'percent', 10, true, now() + interval '90 days'),
  ('FREESHIP',  'fixed',   5000, true, now() + interval '90 days'),
  ('SAVE50',    'fixed',   5000, true, now() + interval '30 days')
on conflict (code) do nothing;

-- ---------- Banner ----------
insert into public.banner (
  enabled, badge, title, subtitle, discount_text, discount_label,
  cta_text, cta_link, image, image_alt,
  background_color, text_color, accent_color, badge_color
) values (
  true,
  'Limited Time Only',
  'Summer Sale',
  'Get up to 40% off on selected sneakers, slides, and lifestyle shoes. Don''t miss these incredible deals.',
  '40%',
  'OFF',
  'Shop the Sale',
  '/shop?sale=true',
  'https://placehold.co/800x800/1a1a1a/D4A843?text=Summer+Sale',
  'Summer Sale Collection',
  'brand-black',
  'brand-white',
  'brand-gold',
  'brand-red'
)
on conflict (id) do nothing;

-- ---------- Admin user (run after creating auth user via Supabase dashboard) ----------
-- Update profiles set role = 'admin' where email = 'your-admin-email@example.com';