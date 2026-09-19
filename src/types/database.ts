// Hand-written types mirroring supabase/migrations/0001_schema.sql.
// If you connect a live Supabase project, prefer regenerating this with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type AdminRole =
  | "super_admin"
  | "product_manager"
  | "order_manager"
  | "sales_manager"
  | "content_manager";

export type ProductGender = "men" | "women" | "boys" | "girls" | "unisex";

export type OrderStatus =
  | "order_placed"
  | "payment_confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type CustomRequestType = "custom_uniform" | "bulk_order";

export type CustomRequestStatus =
  | "submitted"
  | "under_review"
  | "need_more_info"
  | "quote_sent"
  | "customer_approved"
  | "production"
  | "quality_check"
  | "ready_for_dispatch"
  | "completed"
  | "cancelled";

export type MeasurementUnit = "cm" | "inch";
export type CouponType = "percentage" | "fixed";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  short_description: string | null;
  gender: ProductGender;
  age_group: string | null;
  fabric: string | null;
  care_instructions: string | null;
  price: number;
  mrp: number | null;
  gst_rate: number;
  tags: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  seo_title: string | null;
  meta_description: string | null;
  size_chart_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  colour: string;
  size: string;
  sku: string;
  price_override: number | null;
  stock_available: number;
  stock_reserved: number;
  stock_sold: number;
  low_stock_threshold: number;
  is_active: boolean;
}

export interface SizeChart {
  id: string;
  garment_type: string;
  name: string;
}

export interface SizeChartEntry {
  id: string;
  size_chart_id: string;
  size_label: string;
  measurements: Record<string, number>;
  display_order: number;
}

export interface ProductWithRelations extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  saved_for_later: boolean;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  min_order_value: number;
  max_discount: number | null;
  category_id: string | null;
  product_id: string | null;
  usage_limit: number | null;
  used_count: number;
  first_order_only: boolean;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Address_ {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  gst_amount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Address_;
  billing_address: Address_;
  customer_notes: string | null;
  delay_note: string | null;
  delay_note_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  sku: string;
  colour: string;
  size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_signature: string | null;
  amount: number;
  status: PaymentStatus;
  raw_response: Record<string, unknown> | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface SizeQuantityRow {
  size: string;
  [group: string]: string | number;
}

export interface CustomRequest {
  id: string;
  request_number: string;
  request_type: CustomRequestType;
  status: CustomRequestStatus;
  user_id: string | null;
  customer_name: string;
  organization_name: string | null;
  email: string;
  phone: string;
  whatsapp_number: string | null;
  city: string | null;
  state: string | null;
  uniform_type: string;
  wearer_type: string | null;
  garments: string[];
  customization_options: string[];
  fabric_preference: string | null;
  colour_preference: string | null;
  branding_placement: string | null;
  branding_method: string | null;
  measurement_mode: string | null;
  size_quantity_matrix: SizeQuantityRow[];
  total_quantity: number;
  delivery_date: string | null;
  delivery_location: string | null;
  additional_notes: string | null;
  admin_notes: string | null;
  assigned_staff: string | null;
  quote_amount: number | null;
  quote_notes: string | null;
  quote_valid_until: string | null;
  source_product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomRequestMeasurement {
  id: string;
  custom_request_id: string;
  garment_type: string;
  unit: MeasurementUnit;
  measurements: Record<string, number>;
}

export interface CustomRequestFile {
  id: string;
  custom_request_id: string;
  file_url: string;
  file_name: string | null;
  file_purpose: "reference" | "logo";
  uploaded_at: string;
}

export interface SiteSettings {
  id: true;
  company_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  default_gst_rate: number;
  flat_shipping_fee: number;
  free_shipping_threshold: number | null;
  social_links: Record<string, string>;
  updated_at: string;
}

export interface CustomizationOption {
  id: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface GarmentOption {
  id: string;
  category_group: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Minimal Database generic so @supabase/ssr's generics compile; the app
// mostly relies on the interfaces above rather than deep Supabase generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
