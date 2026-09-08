-- Prima Facie — LARA CROFT: Supabase schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Users table (synced from Supabase Auth)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  supabase_id text unique not null,
  email text unique not null,
  name text not null,
  avatar text,
  role text not null default 'user' check (role in ('user', 'admin', 'manager')),
  addresses jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{"newsletter":true,"notifications":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  image text,
  order_num int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category_id uuid references categories(id) on delete set null,
  brand text not null,
  price int not null check (price >= 0),
  original_price int not null check (original_price >= 0),
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  stock int not null default 0 check (stock >= 0),
  stock_by_size jsonb,
  description text not null,
  featured boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cart (one row per user, items as jsonb)
create table if not exists cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal int not null,
  shipping int not null,
  tax int not null,
  total int not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  shipping_address jsonb not null,
  billing_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_featured on products(featured);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_cart_user on cart(user_id);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_razorpay_id on orders(razorpay_order_id);
create index if not exists idx_users_supabase_id on users(supabase_id);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users for each row execute function update_updated_at();
create trigger categories_updated_at before update on categories for each row execute function update_updated_at();
create trigger products_updated_at before update on products for each row execute function update_updated_at();
create trigger cart_updated_at before update on cart for each row execute function update_updated_at();
create trigger orders_updated_at before update on orders for each row execute function update_updated_at();

-- Enable RLS (Row Level Security) but allow service role full access
alter table users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table cart enable row level security;
alter table orders enable row level security;

-- Service role bypasses RLS, so no policies needed for backend access.
-- If you add Supabase client-side queries later, add policies per table.

-- Admin password login support
alter table users add column if not exists password_hash text;
