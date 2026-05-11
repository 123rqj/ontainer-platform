-- ============================================================
-- 订箱平台 - Supabase 数据库 Schema
-- ============================================================

-- 启用 UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- 表: profiles (用户扩展信息，关联 auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  company text,
  phone text,
  created_at timestamptz default now()
);

-- ============================================================
-- 表: containers (集装箱箱号管理)
-- ============================================================
create table if not exists public.containers (
  id uuid default uuid_generate_v4() primary key,
  container_no text unique not null,
  type text not null check (type in ('20GP', '40GP', '40HQ', '40HC', '45HC', '20RF', '40RF')),
  status text not null default 'available' check (status in ('available', 'reserved', 'in-use', 'maintenance')),
  current_order_id uuid,
  location text default '国内仓库',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 表: quotes (询价单)
-- ============================================================
create table if not exists public.quotes (
  id uuid default uuid_generate_v4() primary key,
  quote_no text unique not null,
  origin text not null,
  destination text not null,
  container_type text not null,
  quantity integer not null check (quantity > 0),
  lease_days integer not null check (lease_days > 0),
  estimated_date date,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  remarks text,
  status text not null default 'pending' check (status in ('pending', 'quoted', 'confirmed', 'cancelled')),
  quoted_rent_usd decimal(12,2),
  quoted_loss_fee_usd decimal(12,2),
  quoted_by uuid references public.profiles(id),
  quoted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 表: orders (订单)
-- ============================================================
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_no text unique not null,
  quote_id uuid references public.quotes(id),
  customer_id uuid references public.profiles(id),
  container_ids uuid[] default '{}',
  rent_usd decimal(12,2) not null,
  loss_fee_usd decimal(12,2) not null,
  origin text not null,
  destination text not null,
  container_type text not null,
  quantity integer not null,
  lease_days integer not null,
  estimated_date date,
  actual_start_date date,
  actual_end_date date,
  status text not null default 'confirmed' check (status in ('confirmed', 'in-use', 'returned', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 外键: containers.current_order_id -> orders.id
-- ============================================================
alter table public.containers
  add constraint fk_container_order
  foreign key (current_order_id) references public.orders(id) on delete set null;

-- ============================================================
-- 索引
-- ============================================================
create index if not exists idx_containers_status on public.containers(status);
create index if not exists idx_containers_type on public.containers(type);
create index if not exists idx_quotes_status on public.quotes(status);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- profiles: 用户只能查看/更新自己的资料
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- containers: 所有人可查看库存状态，内部管理才需要精确箱号
alter table public.containers enable row level security;
create policy "Anyone can view containers" on public.containers for select using (true);
create policy "Authenticated users can manage containers" on public.containers for all using (auth.role() = 'authenticated');

-- quotes: 所有人可提交询价，客户只能查看自己的询价单
alter table public.quotes enable row level security;
create policy "Anyone can create quotes" on public.quotes for insert with check (true);
create policy "Anyone can view quotes" on public.quotes for select using (true);
create policy "Users can update own quotes" on public.quotes for update using (auth.uid() = quoted_by or quoted_by is null);

-- orders: 客户只能查看自己的订单
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = customer_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() is not null);
create policy "Users can update own orders" on public.orders for update using (auth.uid() = customer_id);

-- ============================================================
-- 初始化: 110个40HQ箱号
-- ============================================================
do $$
declare
  i integer;
  container_no text;
begin
  -- 检查是否已有数据
  if not exists (select 1 from public.containers limit 1) then
    for i in 1..110 loop
      container_no := 'YLGH-40HQ-' || lpad(i::text, 3, '0');
      insert into public.containers (container_no, type, status) values (container_no, '40HQ', 'available');
    end loop;
    raise notice 'Initialized 110 40HQ containers';
  end if;
end $$;

-- ============================================================
-- Auto-update updated_at 触发器
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger containers_updated_at before update on public.containers
  for each row execute function public.handle_updated_at();

create trigger quotes_updated_at before update on public.quotes
  for each row execute function public.handle_updated_at();

create trigger orders_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 生成询价单号函数
-- ============================================================
create or replace function public.generate_quote_no()
returns text as $$
declare
  seq_no integer;
  date_str text;
begin
  date_str := to_char(now(), 'YYYYMMDD');
  select coalesce(max(substring(quote_no from 13 for 3)::integer), 0) + 1
  into seq_no
  from public.quotes
  where quote_no like 'QT-' || date_str || '-%';
  return 'QT-' || date_str || '-' || lpad(seq_no::text, 3, '0');
end;
$$ language plpgsql;

-- ============================================================
-- 生成订单号函数
-- ============================================================
create or replace function public.generate_order_no()
returns text as $$
declare
  seq_no integer;
  date_str text;
begin
  date_str := to_char(now(), 'YYYYMMDD');
  select coalesce(max(substring(order_no from 13 from 3)::integer), 0) + 1
  into seq_no
  from public.orders
  where order_no like 'SO-' || date_str || '-%';
  return 'SO-' || date_str || '-' || lpad(seq_no::text, 3, '0');
end;
$$ language plpgsql;
