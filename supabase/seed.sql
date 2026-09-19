-- =============================================================================
-- DEMO / DEVELOPMENT SEED DATA — DO NOT RUN AGAINST PRODUCTION
--
-- Everything in this file (prices, stock counts, descriptions, images) is
-- placeholder content so the application is browsable during development.
-- Per spec §54/§50, real product photography, pricing, GSTIN, and any trust
-- statistics must be entered by the Jobert team through the Admin Panel
-- before launch — none of it is invented here.
-- =============================================================================

-- Categories -----------------------------------------------------------------
insert into public.categories (id, name, slug, description, image_url, display_order) values
  ('11111111-0000-0000-0000-000000000001', 'School Uniforms', 'school-uniforms', 'Shirts, trousers, skirts, blazers and sportswear for schools.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=School+Uniforms', 1),
  ('11111111-0000-0000-0000-000000000002', 'Corporate Uniforms', 'corporate-uniforms', 'Formal and corporate wear for companies.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=Corporate+Uniforms', 2),
  ('11111111-0000-0000-0000-000000000003', 'Industrial Uniforms', 'industrial-uniforms', 'Workwear, safety wear and factory uniforms.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=Industrial+Uniforms', 3),
  ('11111111-0000-0000-0000-000000000004', 'Hospitality', 'hospitality', 'Hotel, restaurant and housekeeping uniforms.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=Hospitality', 4),
  ('11111111-0000-0000-0000-000000000005', 'Healthcare', 'healthcare', 'Scrubs, nurse and doctor uniforms.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=Healthcare', 5),
  ('11111111-0000-0000-0000-000000000006', 'Sportswear', 'sportswear', 'Jerseys, tracksuits and team sportswear.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=Sportswear', 6),
  ('11111111-0000-0000-0000-000000000007', 'Accessories', 'accessories', 'Ties, belts, caps and socks.', 'https://placehold.co/800x600/1e3a5f/ffffff?text=Accessories', 7);

insert into public.categories (parent_id, name, slug, description, display_order) values
  ('11111111-0000-0000-0000-000000000001', 'School Shirts', 'school-shirts', 'Shirts for boys and girls.', 1),
  ('11111111-0000-0000-0000-000000000001', 'School Trousers', 'school-trousers', 'Trousers and shorts.', 2),
  ('11111111-0000-0000-0000-000000000006', 'Team Jerseys', 'team-jerseys', 'Sublimation and polyester jerseys.', 1);

-- Size charts ------------------------------------------------------------------
insert into public.size_charts (id, garment_type, name) values
  ('22222222-0000-0000-0000-000000000001', 'shirt', 'Boys Shirt'),
  ('22222222-0000-0000-0000-000000000002', 'adult', 'Adult Unisex (XS-XXXL)');

insert into public.size_chart_entries (size_chart_id, size_label, measurements, display_order) values
  ('22222222-0000-0000-0000-000000000001', '24', '{"chest_in": 28, "shoulder_in": 11, "length_in": 20}', 1),
  ('22222222-0000-0000-0000-000000000001', '26', '{"chest_in": 30, "shoulder_in": 12, "length_in": 22}', 2),
  ('22222222-0000-0000-0000-000000000001', '28', '{"chest_in": 32, "shoulder_in": 13, "length_in": 24}', 3),
  ('22222222-0000-0000-0000-000000000001', '30', '{"chest_in": 34, "shoulder_in": 14, "length_in": 26}', 4),
  ('22222222-0000-0000-0000-000000000001', '32', '{"chest_in": 36, "shoulder_in": 15, "length_in": 28}', 5),
  ('22222222-0000-0000-0000-000000000002', 'S', '{"chest_in": 38, "shoulder_in": 17, "length_in": 27}', 1),
  ('22222222-0000-0000-0000-000000000002', 'M', '{"chest_in": 40, "shoulder_in": 18, "length_in": 28}', 2),
  ('22222222-0000-0000-0000-000000000002', 'L', '{"chest_in": 42, "shoulder_in": 19, "length_in": 29}', 3),
  ('22222222-0000-0000-0000-000000000002', 'XL', '{"chest_in": 44, "shoulder_in": 20, "length_in": 30}', 4);

-- Products ---------------------------------------------------------------------
insert into public.products (id, category_id, name, slug, sku, description, short_description, gender, age_group, fabric, price, mrp, gst_rate, tags, is_featured, is_best_seller, is_new_arrival, size_chart_id) values
  ('33333333-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'School Uniform Shirt', 'school-uniform-shirt', 'JOB-SHT-001', 'Durable cotton-blend school shirt built for daily wear, easy care and years of use.', 'Classic cotton-blend school shirt.', 'unisex', 'kids', 'Cotton Blend', 699, 899, 5, array['school','shirt','bestseller'], true, true, false, '22222222-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'Corporate Formal Shirt', 'corporate-formal-shirt', 'JOB-SHT-002', 'Wrinkle-resistant formal shirt for corporate teams, tailored for a sharp everyday fit.', 'Wrinkle-resistant corporate shirt.', 'unisex', 'adult', 'Cotton Blend', 899, 1099, 12, array['corporate','shirt'], true, false, true, '22222222-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000006', 'Sublimation Sports Jersey', 'sublimation-sports-jersey', 'JOB-JRS-001', 'Lightweight breathable jersey with full sublimation printing, ideal for teams and tournaments.', 'Breathable full-sublimation team jersey.', 'unisex', 'adult', 'Sports Polyester', 549, 699, 5, array['sports','jersey','bestseller'], true, true, true, '22222222-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000005', 'Medical Scrub Set', 'medical-scrub-set', 'JOB-SCR-001', 'Comfortable, breathable scrub set for nurses and hospital staff with reinforced stitching.', 'Comfortable scrub set for hospital staff.', 'unisex', 'adult', 'Cotton Blend', 999, 1249, 5, array['healthcare','scrubs'], false, false, true, '22222222-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000004', 'Hotel Reception Blazer', 'hotel-reception-blazer', 'JOB-BLZ-001', 'Sharp tailored blazer for hospitality front-desk teams.', 'Tailored blazer for front-desk staff.', 'unisex', 'adult', 'Poly Wool Blend', 1799, 2199, 12, array['hospitality','blazer'], false, false, false, '22222222-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000003', 'Industrial Cargo Workwear', 'industrial-cargo-workwear', 'JOB-WRK-001', 'Heavy-duty cargo workwear set built for factory and industrial environments.', 'Heavy-duty industrial cargo set.', 'unisex', 'adult', 'Cotton Twill', 1299, 1599, 12, array['industrial','workwear'], false, true, false, '22222222-0000-0000-0000-000000000002');

insert into public.product_images (product_id, url, alt_text, display_order) values
  ('33333333-0000-0000-0000-000000000001', 'https://placehold.co/900x1100/f4f6f8/1e3a5f?text=School+Shirt', 'School Uniform Shirt', 1),
  ('33333333-0000-0000-0000-000000000002', 'https://placehold.co/900x1100/f4f6f8/1e3a5f?text=Corporate+Shirt', 'Corporate Formal Shirt', 1),
  ('33333333-0000-0000-0000-000000000003', 'https://placehold.co/900x1100/f4f6f8/1e3a5f?text=Sports+Jersey', 'Sublimation Sports Jersey', 1),
  ('33333333-0000-0000-0000-000000000004', 'https://placehold.co/900x1100/f4f6f8/1e3a5f?text=Medical+Scrubs', 'Medical Scrub Set', 1),
  ('33333333-0000-0000-0000-000000000005', 'https://placehold.co/900x1100/f4f6f8/1e3a5f?text=Hotel+Blazer', 'Hotel Reception Blazer', 1),
  ('33333333-0000-0000-0000-000000000006', 'https://placehold.co/900x1100/f4f6f8/1e3a5f?text=Industrial+Workwear', 'Industrial Cargo Workwear', 1);

insert into public.product_variants (product_id, colour, size, sku, stock_available, low_stock_threshold) values
  ('33333333-0000-0000-0000-000000000001', 'White', '24', 'JOB-SHT-001-WHT-24', 25, 5),
  ('33333333-0000-0000-0000-000000000001', 'White', '26', 'JOB-SHT-001-WHT-26', 40, 5),
  ('33333333-0000-0000-0000-000000000001', 'White', '28', 'JOB-SHT-001-WHT-28', 30, 5),
  ('33333333-0000-0000-0000-000000000001', 'Sky Blue', '24', 'JOB-SHT-001-SKB-24', 20, 5),
  ('33333333-0000-0000-0000-000000000001', 'Sky Blue', '26', 'JOB-SHT-001-SKB-26', 18, 5),
  ('33333333-0000-0000-0000-000000000002', 'White', 'S', 'JOB-SHT-002-WHT-S', 15, 5),
  ('33333333-0000-0000-0000-000000000002', 'White', 'M', 'JOB-SHT-002-WHT-M', 22, 5),
  ('33333333-0000-0000-0000-000000000002', 'White', 'L', 'JOB-SHT-002-WHT-L', 3, 5),
  ('33333333-0000-0000-0000-000000000003', 'Navy', 'M', 'JOB-JRS-001-NVY-M', 50, 10),
  ('33333333-0000-0000-0000-000000000003', 'Navy', 'L', 'JOB-JRS-001-NVY-L', 45, 10),
  ('33333333-0000-0000-0000-000000000003', 'Red', 'M', 'JOB-JRS-001-RED-M', 0, 10),
  ('33333333-0000-0000-0000-000000000004', 'Sky Blue', 'M', 'JOB-SCR-001-SKB-M', 28, 5),
  ('33333333-0000-0000-0000-000000000004', 'Sky Blue', 'L', 'JOB-SCR-001-SKB-L', 19, 5),
  ('33333333-0000-0000-0000-000000000005', 'Navy', 'M', 'JOB-BLZ-001-NVY-M', 12, 3),
  ('33333333-0000-0000-0000-000000000005', 'Navy', 'L', 'JOB-BLZ-001-NVY-L', 9, 3),
  ('33333333-0000-0000-0000-000000000006', 'Grey', 'M', 'JOB-WRK-001-GRY-M', 33, 5),
  ('33333333-0000-0000-0000-000000000006', 'Grey', 'L', 'JOB-WRK-001-GRY-L', 27, 5);

-- Custom Requirement Engine configuration --------------------------------------
insert into public.customization_options (label, display_order) values
  ('Logo Printing', 1), ('School Name Printing', 2), ('Student/Employee Name Printing', 3),
  ('Logo Embroidery', 4), ('Logo Embroidery + Printing', 5), ('Monogram', 6),
  ('Custom Design', 7), ('Custom Colour', 8), ('Custom Pattern', 9), ('Custom Text', 10), ('Other', 11);

insert into public.garment_options (category_group, label, display_order) values
  ('School Uniform', 'Shirt', 1), ('School Uniform', 'Trouser', 2), ('School Uniform', 'Skirt', 3),
  ('School Uniform', 'Shorts', 4), ('School Uniform', 'Blazer', 5), ('School Uniform', 'Sweater', 6),
  ('School Uniform', 'Tie', 7), ('School Uniform', 'Belt', 8), ('School Uniform', 'Socks', 9),
  ('School Uniform', 'Tracksuit', 10), ('School Uniform', 'Sports T-shirt', 11), ('School Uniform', 'Sports Shorts', 12),
  ('Corporate Uniform', 'Shirt', 1), ('Corporate Uniform', 'Trouser', 2), ('Corporate Uniform', 'Blazer', 3),
  ('Corporate Uniform', 'Jacket', 4), ('Corporate Uniform', 'T-shirt', 5), ('Corporate Uniform', 'Polo', 6),
  ('Corporate Uniform', 'Track Pant', 7),
  ('Hospital Uniform', 'Scrubs', 1), ('Hospital Uniform', 'Nurse Uniform', 2), ('Hospital Uniform', 'Lab Coat', 3),
  ('Hospital Uniform', 'Doctor Coat', 4), ('Hospital Uniform', 'Hospital Staff Uniform', 5),
  ('Sports Uniform', 'Jersey', 1), ('Sports Uniform', 'Shorts', 2), ('Sports Uniform', 'Tracksuit', 3),
  ('Hotel Uniform', 'Reception Blazer', 1), ('Hotel Uniform', 'Housekeeping Uniform', 2), ('Hotel Uniform', 'Chef Coat', 3),
  ('Industrial Uniform', 'Cargo Set', 1), ('Industrial Uniform', 'Reflective Jacket', 2), ('Industrial Uniform', 'Coverall', 3),
  ('Security Uniform', 'Shirt', 1), ('Security Uniform', 'Trouser', 2), ('Security Uniform', 'Beret/Cap', 3);

-- Site settings — contact details left blank for the real Jobert team to fill.
update public.site_settings set
  hero_image_url = 'https://placehold.co/1600x900/1e3a5f/ffffff?text=Jobert+Apparels'
where id = true;
