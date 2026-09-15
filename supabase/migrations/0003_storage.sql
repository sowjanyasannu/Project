-- =============================================================================
-- Storage buckets
-- product-images: public bucket, admin-managed product photography.
-- custom-uploads: private bucket for customer reference images / logos /
--   PDFs submitted with a custom uniform or bulk-order request. Uploaded via
--   a server route using the service-role key (so uploads are validated for
--   type/size server-side before landing here), read by the owner or admin.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 10485760,
  array['image/png','image/jpeg','image/webp','image/avif']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'custom-uploads', 'custom-uploads', false, 15728640,
  array['image/png','image/jpeg','image/webp','image/svg+xml','application/pdf']
)
on conflict (id) do nothing;

create policy "product_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_bucket_admin_write"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Files are namespaced as `<user_id-or-guest>/<request_id>/<filename>`.
-- Admins can read everything; a signed-in customer can read only their own
-- folder. Guest submissions are fetched via the admin panel only.
create policy "custom_uploads_admin_read"
  on storage.objects for select
  using (bucket_id = 'custom-uploads' and public.is_admin());

create policy "custom_uploads_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'custom-uploads'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
