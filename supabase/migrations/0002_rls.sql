-- =============================================================================
-- Row Level Security
--
-- Design: the public catalogue is world-readable. Personal data (addresses,
-- orders, wishlist, custom requests) is readable only by its owner or an
-- admin. Anything that involves pricing, stock, document numbering or file
-- uploads (order creation, payment verification, custom request submission)
-- is written exclusively through server routes using the service-role key,
-- which bypasses RLS — so those tables intentionally have no client INSERT
-- policy. This keeps "never trust totals from the browser" enforceable.
-- =============================================================================

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and is_active = true
  );
$$;

-- profiles
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_upsert_own" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

-- admin_users
alter table public.admin_users enable row level security;
create policy "admin_users_select_self" on public.admin_users for select using (id = auth.uid() or public.is_admin());

-- addresses
alter table public.addresses enable row level security;
create policy "addresses_owner_select" on public.addresses for select using (user_id = auth.uid() or public.is_admin());
create policy "addresses_owner_insert" on public.addresses for insert with check (user_id = auth.uid());
create policy "addresses_owner_update" on public.addresses for update using (user_id = auth.uid());
create policy "addresses_owner_delete" on public.addresses for delete using (user_id = auth.uid());

-- catalogue: public read, admin write
alter table public.categories enable row level security;
create policy "categories_public_read" on public.categories for select using (is_active or public.is_admin());
create policy "categories_admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

alter table public.products enable row level security;
create policy "products_public_read" on public.products for select using (is_active or public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

alter table public.product_images enable row level security;
create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_images_admin_write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

alter table public.product_variants enable row level security;
create policy "product_variants_public_read" on public.product_variants for select using (true);
create policy "product_variants_admin_write" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

alter table public.size_charts enable row level security;
create policy "size_charts_public_read" on public.size_charts for select using (true);
create policy "size_charts_admin_write" on public.size_charts for all using (public.is_admin()) with check (public.is_admin());

alter table public.size_chart_entries enable row level security;
create policy "size_chart_entries_public_read" on public.size_chart_entries for select using (true);
create policy "size_chart_entries_admin_write" on public.size_chart_entries for all using (public.is_admin()) with check (public.is_admin());

-- cart & wishlist: signed-in users manage their own rows directly; guest
-- carts are mutated only via server routes (service role).
alter table public.carts enable row level security;
create policy "carts_owner_all" on public.carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.cart_items enable row level security;
create policy "cart_items_owner_all" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

alter table public.wishlist_items enable row level security;
create policy "wishlist_owner_all" on public.wishlist_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- coupons: never exposed to the client directly, validated server-side
alter table public.coupons enable row level security;
create policy "coupons_admin_all" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- orders: read own, no client inserts/updates (checkout API uses service role)
alter table public.orders enable row level security;
create policy "orders_owner_select" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders_admin_update" on public.orders for update using (public.is_admin());

alter table public.order_items enable row level security;
create policy "order_items_owner_select" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

alter table public.payments enable row level security;
create policy "payments_owner_select" on public.payments for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

alter table public.inventory_transactions enable row level security;
create policy "inventory_transactions_admin_select" on public.inventory_transactions for select using (public.is_admin());

-- reviews: public read approved, authenticated write own, admin moderate
alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews for select using (is_approved or user_id = auth.uid() or public.is_admin());
create policy "reviews_owner_insert" on public.reviews for insert with check (user_id = auth.uid());
create policy "reviews_owner_update" on public.reviews for update using (user_id = auth.uid() or public.is_admin());
create policy "reviews_admin_delete" on public.reviews for delete using (public.is_admin());

-- custom requests: read own, no client inserts (submission API uses service role)
alter table public.custom_requests enable row level security;
create policy "custom_requests_owner_select" on public.custom_requests for select using (user_id = auth.uid() or public.is_admin());
create policy "custom_requests_admin_update" on public.custom_requests for update using (public.is_admin());

alter table public.custom_request_measurements enable row level security;
create policy "custom_request_measurements_owner_select" on public.custom_request_measurements for select using (
  exists (select 1 from public.custom_requests r where r.id = custom_request_id and (r.user_id = auth.uid() or public.is_admin()))
);

alter table public.custom_request_files enable row level security;
create policy "custom_request_files_owner_select" on public.custom_request_files for select using (
  exists (select 1 from public.custom_requests r where r.id = custom_request_id and (r.user_id = auth.uid() or public.is_admin()))
);

-- settings & configurable option lists: public read, admin write
alter table public.site_settings enable row level security;
create policy "site_settings_public_read" on public.site_settings for select using (true);
create policy "site_settings_admin_update" on public.site_settings for update using (public.is_admin());

alter table public.customization_options enable row level security;
create policy "customization_options_public_read" on public.customization_options for select using (is_active or public.is_admin());
create policy "customization_options_admin_write" on public.customization_options for all using (public.is_admin()) with check (public.is_admin());

alter table public.garment_options enable row level security;
create policy "garment_options_public_read" on public.garment_options for select using (is_active or public.is_admin());
create policy "garment_options_admin_write" on public.garment_options for all using (public.is_admin()) with check (public.is_admin());

-- notifications: admin sees admin notifications, customers see their own
alter table public.notifications enable row level security;
create policy "notifications_scoped_select" on public.notifications for select using (
  (recipient_type = 'admin' and public.is_admin())
  or (recipient_type = 'customer' and recipient_id = auth.uid())
);
create policy "notifications_scoped_update" on public.notifications for update using (
  (recipient_type = 'admin' and public.is_admin())
  or (recipient_type = 'customer' and recipient_id = auth.uid())
);

-- contact & email logs: admin only (form submission goes through service role)
alter table public.contact_messages enable row level security;
create policy "contact_messages_admin_select" on public.contact_messages for select using (public.is_admin());

alter table public.email_logs enable row level security;
create policy "email_logs_admin_select" on public.email_logs for select using (public.is_admin());

-- Keep a profile row in sync with auth.users automatically
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
