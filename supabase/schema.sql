create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10, 2) not null check (price >= 0),
  original_price numeric(10, 2) not null check (original_price >= price),
  rating numeric(2, 1) not null default 0,
  reviews integer not null default 0 check (reviews >= 0),
  badge text not null default '',
  emoji text not null default '✳',
  color text not null default '#f0eff6',
  image_url text,
  is_active boolean not null default true
);

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on public.products for select
  using (is_active = true);
