-- ============================================================
-- S&S FASHION — Full database schema (CORRECTED ORDER)
-- Run in Supabase SQL Editor
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- Core functions (MUST BE FIRST) ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- Brands ----------
create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

-- ---------- Categories ----------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  gender text not null default 'Unisex' check (gender in ('Men','Women','Kids','Unisex')),
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  description text not null default '',
  short_description text not null default '',
  sizes jsonb not null default '[]',
  colors jsonb not null default '[]',
  images jsonb not null default '[]',
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count integer not null default 0,
  stock_count integer not null default 0,
  sold_count integer not null default 0,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  slug text not null unique,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);

-- ---------- Product variants ----------
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  stock integer not null default 0,
  unique(product_id, size, color)
);

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  address text,
  city text,
  region text,
  created_at timestamptz not null default now()
);

-- is_admin() must exist before RLS policies reference it
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Wishlists ----------
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------- Cart items ----------
create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  quantity integer not null default 1 check (quantity > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id, size, color)
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id text primary key default 'ORD-' || lpad((floor(random() * 1000000))::text, 6, '0'),
  user_id uuid references auth.users(id) on delete set null,
  items jsonb not null default '[]',
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  payment_method text not null default 'card' check (payment_method in ('cod','momo','card')),
  payment_reference text,
  coupon_code text,
  shipping_address jsonb not null default '{}',
  customer_email text,
  customer_name text,
  customer_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- ---------- Order items ----------
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  image_url text,
  size text,
  color text,
  qty integer not null default 1,
  price integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------- Coupons ----------
create table if not exists public.coupons (
  code text primary key,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value > 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Reviews ----------
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.reviews(product_id);

-- ---------- Banner ----------
create table if not exists public.banner (
  id uuid primary key default uuid_generate_v4(),
  enabled boolean not null default true,
  badge text,
  title text not null,
  subtitle text,
  discount_text text,
  discount_label text,
  cta_text text,
  cta_link text,
  image text,
  image_alt text,
  background_color text not null default 'brand-black',
  text_color text not null default 'brand-white',
  accent_color text not null default 'brand-gold',
  badge_color text not null default 'brand-red',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_banner_updated_at on public.banner;
create trigger touch_banner_updated_at
  before update on public.banner
  for each row execute function public.touch_updated_at();

alter table public.banner enable row level security;
create policy "Public read banner" on public.banner for select using (enabled = true);
create policy "Admin write banner" on public.banner for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Notifications ----------
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('new_order','order_status')),
  order_id text references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null default '',
  message text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_type on public.notifications(type);

-- ---------- Order notification trigger ----------
create or replace function public.handle_order_notification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  status_label text;
begin
  if (tg_op = 'INSERT') then
    insert into public.notifications (type, order_id, user_id, title, message)
    values (
      'new_order', new.id, null,
      'New Order ' || new.id,
      coalesce(new.customer_name, 'A customer') || ' placed an order of ' ||
        round(new.total / 100.0, 2)::text
    );
    return new;
  end if;

  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    status_label := case new.status
      when 'paid' then 'confirmed'
      when 'shipped' then 'on its way'
      when 'delivered' then 'delivered'
      when 'cancelled' then 'cancelled'
      else new.status
    end;

    insert into public.notifications (type, order_id, user_id, title, message)
    values (
      'order_status', new.id, new.user_id,
      'Order ' || new.id || ' ' || initcap(new.status),
      'Your order has been ' || status_label || '.'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_change on public.orders;
create trigger on_order_change
  after insert or update of status on public.orders
  for each row execute function public.handle_order_notification();

-- ---------- Updated_at triggers ----------
drop trigger if exists touch_orders_updated_at on public.orders;
create trigger touch_orders_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_products_updated_at on public.products;
create trigger touch_products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

create policy "Public read brands" on public.brands for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read products" on public.products for select using (true);
create policy "Public read variants" on public.product_variants for select using (true);
create policy "Public read reviews" on public.reviews for select using (true);

create policy "Admin write brands" on public.brands for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin write variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

create policy "Public read coupons" on public.coupons for select using (is_active);
create policy "Admin write coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "Own profile read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Own profile insert" on public.profiles for insert with check (auth.uid() = id);

create policy "Own wishlist" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own cart" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Own orders read" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "User create order" on public.orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

create policy "Read order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));
create policy "User create order items" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)));

create policy "Write own review" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Update own review" on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own review" on public.reviews for delete using (auth.uid() = user_id);

create policy "Admin notifications" on public.notifications for all
  using (type = 'new_order' and public.is_admin()) with check (type = 'new_order' and public.is_admin());
create policy "Own notifications read" on public.notifications for select using (user_id = auth.uid());
create policy "Own notifications update" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.banner;