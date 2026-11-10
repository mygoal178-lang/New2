/**
 * ORDERFLOW - Global International Type Definitions
 * Commercial Multi-Tenant E-commerce Order Management SaaS
 * Supports all countries, ISO 4217 currencies, IANA time zones, and multilingual localization.
 */

export type Role = 'owner' | 'admin' | 'manager' | 'staff';

export type MeasurementSystem = 'metric' | 'imperial';
export type DateFormat = 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD';
export type ClockFormat = '12h' | '24h';
export type TaxCalculationType = 'exclusive' | 'inclusive';

export type SupportedLanguage =
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'pt' // Portuguese
  | 'ar' // Arabic (RTL)
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'zh' // Chinese Simplified
  | 'hi' // Hindi
  | 'bn'; // Bengali

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  preferred_language: SupportedLanguage;
  created_at: string;
}

export interface TaxConfig {
  name: string; // e.g. "VAT", "GST", "Sales Tax", "MwSt"
  tax_name?: string;
  rate_percentage: number; // e.g. 20 for UK VAT, 8.875 for NYC Sales Tax, 0 for Tax-free
  default_rate?: number;
  calculation_type: TaxCalculationType;
  is_inclusive?: boolean;
  is_enabled: boolean;
  tax_number_label?: string; // e.g. "VAT ID", "EIN", "GSTIN", "BIN"
  tax_id_number?: string;
}

export interface BusinessWorkspace {
  id: string;
  name: string;
  slug: string;
  category: string;
  country: string; // ISO 3166-1 alpha-2 or display name (e.g. "US", "GB", "DE", "JP", "BD")
  country_code: string; // e.g. "US", "GB", "DE", "JP", "BD"
  currency: string; // ISO 4217 code e.g. "USD", "EUR", "GBP", "JPY", "BDT"
  currency_code?: string;
  currency_symbol: string; // "$", "€", "£", "¥", "৳"
  currency_decimals: number; // 2 for USD, 0 for JPY/KRW
  phone_country_code: string; // "+1", "+44", "+49", "+81", "+880"
  phone: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  address?: string;
  city: string;
  state_province_region: string;
  state_province?: string;
  postal_zip_code: string;
  postal_code?: string;
  timezone: string; // IANA e.g. "America/New_York", "Europe/London", "Asia/Tokyo"
  language: SupportedLanguage;
  date_format: DateFormat;
  clock_format: ClockFormat;
  measurement_system: MeasurementSystem;
  tax_config: TaxConfig;
  logo_url: string;
  tax_number?: string;
  inside_dhaka_delivery_charge?: number;
  outside_dhaka_delivery_charge?: number;
  created_at: string;
  subscription_plan: 'free' | 'starter' | 'pro';
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled';
  monthly_order_limit: number;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  joined_at: string;
  status: 'active' | 'invited' | 'disabled';
  user_profile?: { full_name: string; email: string };
}

export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string; // e.g. "Size: L / Color: Navy"
  sku: string;
  stock: number;
  price_adjustment: number;
  weight?: number;
  barcode?: string;
}

export interface Product {
  id: string;
  business_id: string;
  title: string;
  sku: string;
  barcode?: string;
  category: string;
  description: string;
  purchase_price: number; // Cost of goods sold (in workspace currency)
  selling_price: number;
  stock: number;
  min_stock_alert: number;
  status: ProductStatus;
  image_url: string;
  weight?: number; // In workspace weight unit (kg or lb)
  weight_unit?: 'kg' | 'lb';
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'in' };
  tax_exempt?: boolean;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'stripe'
  | 'paypal'
  | 'bank_transfer'
  | 'cod'
  | 'cash'
  | 'apple_pay'
  | 'google_pay'
  | 'mfs_mobile'
  | 'mfs_bkash'
  | 'mfs_nagad'
  | 'other';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  variant_name?: string;
  sku: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
}

export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  status: OrderStatus;
  note: string;
  actor_name: string;
}

export interface OrderAddress {
  recipient_name?: string;
  phone_country_code?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  line1?: string;
  line2?: string;
  city: string;
  state_province_region?: string;
  state_province?: string;
  postal_zip_code?: string;
  postal_code?: string;
  country: string;
  country_code?: string;
}

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  shipping_city?: string;
  shipping_country_code?: string;
  address?: OrderAddress;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  currency: string; // ISO 4217 original currency code
  currency_code?: string;
  currency_symbol: string;
  exchange_rate_to_usd?: number; // Snapshot of exchange rate at transaction creation
  subtotal: number;
  discount: number;
  delivery_charge: number;
  tax_amount: number;
  tax_name?: string;
  tax_rate?: number;
  total_amount: number;
  total_cost: number; // for net profit calculation
  estimated_profit: number;
  items: OrderItem[];
  courier_id?: string;
  courier_name?: string;
  courier_tracking_id?: string;
  courier_tracking_url?: string;
  consignment_id?: string;
  package_weight?: number;
  package_weight_kg?: number;
  package_weight_unit?: 'kg' | 'lb';
  customs_declared_value?: number;
  internal_notes?: string;
  timeline: OrderTimelineEvent[];
  created_at: string;
  updated_at: string;
}

export type CustomerCategory = 'new' | 'regular' | 'vip' | 'inactive';

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone_country_code?: string;
  phone: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  address?: string;
  city: string;
  state_province_region?: string;
  state_province?: string;
  postal_zip_code?: string;
  postal_code?: string;
  country?: string;
  country_name?: string;
  country_code?: string;
  currency_code?: string;
  category: CustomerCategory;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  notes?: string;
  created_at: string;
}

export type GlobalCourierProvider =
  | 'dhl'
  | 'fedex'
  | 'ups'
  | 'usps'
  | 'royal_mail'
  | 'canada_post'
  | 'australia_post'
  | 'aramex'
  | 'pathao'
  | 'steadfast'
  | 'redx'
  | 'paperfly'
  | 'custom_courier'
  | 'manual';

export type CourierProvider = GlobalCourierProvider;

export interface CourierConfig {
  id: string;
  business_id: string;
  provider: GlobalCourierProvider;
  name: string;
  country_scope: 'global' | 'domestic' | 'regional';
  is_connected: boolean;
  is_active: boolean;
  api_key?: string;
  api_secret?: string;
  account_number?: string;
  client_id?: string;
  store_id?: string;
  webhook_url?: string;
  domestic_flat_rate: number;
  international_flat_rate: number;
  inside_city_rate?: number;
  outside_city_rate?: number;
  cash_collection_fee_pct: number;
  tracking_url_template?: string;
  notes?: string;
}

export interface CourierShipment {
  id: string;
  business_id: string;
  order_id: string;
  order_number: string;
  courier_provider: GlobalCourierProvider;
  courier_name: string;
  tracking_id: string;
  tracking_url?: string;
  consignment_id: string;
  cod_amount: number;
  delivery_fee: number;
  status: 'booked' | 'in_transit' | 'delivered' | 'returned' | 'failed';
  recipient_name: string;
  recipient_phone: string;
  recipient_address_summary: string;
  destination_country: string;
  weight?: number;
  weight_unit?: 'kg' | 'lb';
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory =
  | 'inventory_purchase'
  | 'shipping_postage'
  | 'packaging'
  | 'meta_facebook_ads'
  | 'google_ads'
  | 'influencer_marketing'
  | 'employee_salaries'
  | 'office_warehouse_rent'
  | 'utilities'
  | 'software_subscriptions'
  | 'bank_gateway_fees'
  | 'other';

export interface Expense {
  id: string;
  business_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  payment_method: string;
  date: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  product_title: string;
  variant_name?: string;
  quantity_change: number; // +10 or -2
  resulting_stock: number;
  type: 'sale' | 'restock' | 'return_restore' | 'cancellation_restore' | 'damage' | 'audit_adjustment';
  reference_order_number?: string;
  notes?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  business_id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'delivery' | 'billing' | 'system' | 'integration';
  is_read: boolean;
  link_tab?: string;
  created_at: string;
}

export interface ECommerceIntegration {
  id: string;
  business_id: string;
  channel: 'shopify' | 'woocommerce' | 'amazon' | 'ebay' | 'etsy';
  name: string;
  is_connected: boolean;
  store_url?: string;
  api_key?: string;
  api_secret?: string;
  last_sync_at?: string;
  orders_synced_count: number;
  auto_sync: boolean;
}

export interface WhiteLabelConfig {
  app_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  company_legal_name: string;
  support_email: string;
  support_phone: string;
  default_currency: string;
  default_currency_symbol: string;
  default_language: SupportedLanguage;
  invoice_footer_note: string;
  enable_courier_integrations: boolean;
  enable_multi_currency: boolean;
  enable_gdpr_tools: boolean;
}
