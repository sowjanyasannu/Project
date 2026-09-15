-- =============================================================================
-- Jobert Apparels — Core schema (Phase 1 + Phase 2 + Custom Requirement Engine)
-- =============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────
create type public.admin_role as enum (
  'super_admin', 'product_manager', 'order_manager', 'sales_manager', 'content_manager'
);

create type public.product_gender as enum ('men', 'women', 'boys', 'girls', 'unisex');

create type public.order_status as enum (
  'order_placed', 'payment_confirmed', 'processing', 'packed',
  'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'
);

create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create type public.custom_request_type as enum ('custom_uniform', 'bulk_order');

create type public.custom_request_status as enum (
  'submitted', 'under_review', 'need_more_info', 'quote_sent', 'customer_approved',
  'production', 'quality_check', 'ready_for_dispatch', 'completed', 'cancelled'
);

create type public.measurement_unit as enum ('cm', 'inch');
create type public.coupon_type as enum ('percentage', 'fixed');

-- ── Helpers ──────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Sequential, human-readable document numbers e.g. JOB-20260914-00001
create table public.number_sequences (
  seq_key text primary key,
  last_value integer not null default 0
);

create or replace function public.next_document_number(p_prefix text, p_pad integer default 5)
returns text language plpgsql as $$
declare
  v_key text := p_prefix || '-' || to_char(current_date, 'YYYYMMDD');
  v_next integer;
begin
  insert into public.number_sequences (seq_key, last_value)
  values (v_key, 1)
  on conflict (seq_key) do update set last_value = public.number_sequences.last_value + 1
  returning last_value into v_next;
  return v_key || '-' || lpad(v_next::text, p_pad, '0');
end;
$$;

-- ── Identity ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  whatsapp_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.admin_role not null default 'product_manager',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Catalogue ────────────────────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index categories_parent_idx on public.categories (parent_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  description text,
  short_description text,
  gender public.product_gender not null default 'unisex',
  age_group text,
  fabric text,
  care_instructions text,
  price numeric(10, 2) not null check (price >= 0),
  mrp numeric(10, 2) check (mrp >= 0),
  gst_rate numeric(4, 2) not null default 5,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true,
  seo_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_active_idx on public.products (is_active);
create index products_tags_idx on public.products using gin (tags);
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt_text text,
  display_order integer not null default 0
);
create index product_images_product_idx on public.product_images (product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  colour text not null,
  size text not null,
  sku text not null unique,
  price_override numeric(10, 2),
  stock_available integer not null default 0 check (stock_available >= 0),
  stock_reserved integer not null default 0 check (stock_reserved >= 0),
  stock_sold integer not null default 0 check (stock_sold >= 0),
  low_stock_threshold integer not null default 5,
  is_active boolean not null default true,
  unique (product_id, colour, size)
);
create index product_variants_product_idx on public.product_variants (product_id);

create table public.size_charts (
  id uuid primary key default gen_random_uuid(),
  garment_type text not null,
  name text not null unique
);

create table public.size_chart_entries (
  id uuid primary key default gen_random_uuid(),
  size_chart_id uuid not null references public.size_charts (id) on delete cascade,
  size_label text not null,
  measurements jsonb not null default '{}',
  display_order integer not null default 0
);
create index size_chart_entries_chart_idx on public.size_chart_entries (size_chart_id);

alter table public.products
  add column size_chart_id uuid references public.size_charts (id) on delete set null;

-- ── Cart & Wishlist ──────────────────────────────────────────────────────
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  session_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger carts_set_updated_at before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  saved_for_later boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);
create index cart_items_cart_idx on public.cart_items (cart_id);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ── Coupons ──────────────────────────────────────────────────────────────
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.coupon_type not null,
  value numeric(10, 2) not null check (value > 0),
  min_order_value numeric(10, 2) not null default 0,
  max_discount numeric(10, 2),
  category_id uuid references public.categories (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  usage_limit integer,
  used_count integer not null default 0,
  first_order_only boolean not null default false,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Orders ───────────────────────────────────────────────────────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'order_placed',
  payment_status public.payment_status not null default 'pending',
  subtotal numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  gst_amount numeric(10, 2) not null default 0,
  shipping_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  coupon_code text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id);
create index orders_number_idx on public.orders (order_number);
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := public.next_document_number('JOB', 5);
  end if;
  return new;
end;
$$;
create trigger orders_set_number before insert on public.orders
  for each row execute function public.set_order_number();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  sku text not null,
  colour text not null,
  size text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null
);
create index order_items_order_idx on public.order_items (order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  amount numeric(10, 2) not null,
  status public.payment_status not null default 'pending',
  raw_response jsonb,
  created_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  change_qty integer not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  images text[] not null default '{}',
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_product_idx on public.reviews (product_id);

-- ── Custom Requirement Engine (custom uniforms + bulk orders) ───────────
create table public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique,
  request_type public.custom_request_type not null,
  status public.custom_request_status not null default 'submitted',
  user_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  organization_name text,
  email text not null,
  phone text not null,
  whatsapp_number text,
  city text,
  state text,
  uniform_type text not null,
  wearer_type text,
  garments text[] not null default '{}',
  customization_options text[] not null default '{}',
  fabric_preference text,
  colour_preference text,
  branding_placement text,
  branding_method text,
  measurement_mode text,
  size_quantity_matrix jsonb not null default '[]',
  total_quantity integer not null default 0,
  delivery_date date,
  delivery_location text,
  additional_notes text,
  admin_notes text,
  assigned_staff text,
  quote_amount numeric(10, 2),
  quote_notes text,
  quote_valid_until date,
  source_product_id uuid references public.products (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index custom_requests_user_idx on public.custom_requests (user_id);
create index custom_requests_status_idx on public.custom_requests (status);
create trigger custom_requests_set_updated_at before update on public.custom_requests
  for each row execute function public.set_updated_at();

create or replace function public.set_custom_request_number()
returns trigger language plpgsql as $$
begin
  if new.request_number is null then
    if new.request_type = 'bulk_order' then
      new.request_number := public.next_document_number('JOB-BULK', 4);
    else
      new.request_number := public.next_document_number('JOB-CUSTOM', 4);
    end if;
  end if;
  return new;
end;
$$;
create trigger custom_requests_set_number before insert on public.custom_requests
  for each row execute function public.set_custom_request_number();

create table public.custom_request_measurements (
  id uuid primary key default gen_random_uuid(),
  custom_request_id uuid not null references public.custom_requests (id) on delete cascade,
  garment_type text not null,
  unit public.measurement_unit not null default 'inch',
  measurements jsonb not null default '{}'
);
create index custom_request_measurements_request_idx on public.custom_request_measurements (custom_request_id);

create table public.custom_request_files (
  id uuid primary key default gen_random_uuid(),
  custom_request_id uuid not null references public.custom_requests (id) on delete cascade,
  file_url text not null,
  file_name text,
  file_purpose text not null default 'reference',
  uploaded_at timestamptz not null default now()
);
create index custom_request_files_request_idx on public.custom_request_files (custom_request_id);

-- ── Settings, notifications, contact ─────────────────────────────────────
create table public.site_settings (
  id boolean primary key default true constraint site_settings_singleton check (id),
  company_name text not null default 'Jobert Apparels Pvt. Ltd.',
  logo_url text,
  favicon_url text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  gstin text,
  hero_title text not null default 'Premium Uniforms. Made to Fit Your Team.',
  hero_subtitle text not null default 'School uniforms, corporate wear, sportswear and customized uniforms manufactured with quality and precision.',
  hero_image_url text,
  default_gst_rate numeric(4, 2) not null default 5,
  flat_shipping_fee numeric(10, 2) not null default 0,
  free_shipping_threshold numeric(10, 2),
  social_links jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (true);
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.customization_options (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table public.garment_options (
  id uuid primary key default gen_random_uuid(),
  category_group text not null,
  label text not null,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_type text not null,
  recipient_id uuid,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_recipient_idx on public.notifications (recipient_type, recipient_id);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  status text not null,
  error text,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);
