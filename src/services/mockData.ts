/**
 * ORDERFLOW - Global International Demonstration Workspaces & Mock Data
 * Contains sample stores for USA, UK, Germany, Japan, Australia, and Bangladesh.
 */

import {
  BusinessWorkspace,
  Customer,
  Product,
  Order,
  CourierConfig,
  CourierShipment,
  Expense,
  AppNotification,
  WhiteLabelConfig,
  BusinessMember,
  ECommerceIntegration
} from '../types';

export const INITIAL_WHITE_LABEL: WhiteLabelConfig = {
  app_name: 'OrderFlow',
  logo_url: '',
  primary_color: '#4f46e5',
  secondary_color: '#9333ea',
  company_legal_name: 'OrderFlow Global Technologies Inc.',
  support_email: 'support@orderflow.io',
  support_phone: '+1 (800) 555-0199',
  default_currency: 'USD',
  default_currency_symbol: '$',
  default_language: 'en',
  invoice_footer_note: 'Thank you for your business! For returns or warranty claims, contact support within 14 days of delivery.',
  enable_courier_integrations: true,
  enable_multi_currency: true,
  enable_gdpr_tools: true
};

export const INITIAL_WORKSPACES: BusinessWorkspace[] = [
  // 1. USA Store: Apex Peak Apparel (New York)
  {
    id: 'biz_us_apex',
    name: 'Apex Peak Studio Apparel',
    slug: 'apex-peak-us',
    category: 'Fashion & Outerwear',
    country: 'United States',
    country_code: 'US',
    currency: 'USD',
    currency_symbol: '$',
    currency_decimals: 2,
    phone_country_code: '+1',
    phone: '+1 212 555 0142',
    email: 'orders@apexpeak.com',
    address_line1: '450 West 33rd Street',
    address_line2: 'Suite 800',
    city: 'New York',
    state_province_region: 'NY',
    postal_zip_code: '10001',
    timezone: 'America/New_York',
    language: 'en',
    date_format: 'MM/DD/YYYY',
    clock_format: '12h',
    measurement_system: 'imperial',
    tax_config: {
      name: 'Sales Tax',
      rate_percentage: 8.875,
      calculation_type: 'exclusive',
      is_enabled: true,
      tax_number_label: 'EIN'
    },
    logo_url: '',
    tax_number: 'EIN-12-3456789',
    created_at: '2025-01-10T10:00:00Z',
    subscription_plan: 'pro',
    subscription_status: 'active',
    monthly_order_limit: 10000
  },

  // 2. UK Store: Lumina Audio Labs (London)
  {
    id: 'biz_uk_lumina',
    name: 'Lumina Audio Labs UK',
    slug: 'lumina-audio-uk',
    category: 'Consumer Electronics & Sound',
    country: 'United Kingdom',
    country_code: 'GB',
    currency: 'GBP',
    currency_symbol: '£',
    currency_decimals: 2,
    phone_country_code: '+44',
    phone: '+44 20 7946 0912',
    email: 'fulfillment@luminaaudio.co.uk',
    address_line1: '24 Silicon Roundabout',
    address_line2: 'Shoreditch',
    city: 'London',
    state_province_region: 'Greater London',
    postal_zip_code: 'EC1V 1AB',
    timezone: 'Europe/London',
    language: 'en',
    date_format: 'DD/MM/YYYY',
    clock_format: '24h',
    measurement_system: 'metric',
    tax_config: {
      name: 'VAT',
      rate_percentage: 20,
      calculation_type: 'inclusive',
      is_enabled: true,
      tax_number_label: 'UK VAT Reg'
    },
    logo_url: '',
    tax_number: 'GB982341203',
    created_at: '2025-01-15T09:00:00Z',
    subscription_plan: 'pro',
    subscription_status: 'active',
    monthly_order_limit: 10000
  },

  // 3. Germany Store: Bauhaus Studio Gear (Berlin)
  {
    id: 'biz_de_bauhaus',
    name: 'Bauhaus Studio Gear GmbH',
    slug: 'bauhaus-gear-de',
    category: 'Minimalist Workspace & Tech',
    country: 'Germany',
    country_code: 'DE',
    currency: 'EUR',
    currency_symbol: '€',
    currency_decimals: 2,
    phone_country_code: '+49',
    phone: '+49 30 1234567',
    email: 'kontakt@bauhausgear.de',
    address_line1: 'Friedrichstraße 176',
    address_line2: 'Mitte',
    city: 'Berlin',
    state_province_region: 'Berlin',
    postal_zip_code: '10117',
    timezone: 'Europe/Berlin',
    language: 'de',
    date_format: 'DD/MM/YYYY',
    clock_format: '24h',
    measurement_system: 'metric',
    tax_config: {
      name: 'MwSt.',
      rate_percentage: 19,
      calculation_type: 'inclusive',
      is_enabled: true,
      tax_number_label: 'USt-IdNr.'
    },
    logo_url: '',
    tax_number: 'DE384729102',
    created_at: '2025-01-20T11:00:00Z',
    subscription_plan: 'starter',
    subscription_status: 'active',
    monthly_order_limit: 500
  },

  // 4. Japan Store: Koto Minimal Design (Tokyo)
  {
    id: 'biz_jp_koto',
    name: 'Koto Minimal Design Tokyo (古都デザイン)',
    slug: 'koto-design-jp',
    category: 'Home & Accessories',
    country: 'Japan',
    country_code: 'JP',
    currency: 'JPY',
    currency_symbol: '¥',
    currency_decimals: 0,
    phone_country_code: '+81',
    phone: '+81 3 5555 0188',
    email: 'support@kotodesign.jp',
    address_line1: '1-10-1 Roppongi',
    address_line2: 'Roppongi Hills',
    city: 'Minato-ku',
    state_province_region: 'Tokyo',
    postal_zip_code: '106-0032',
    timezone: 'Asia/Tokyo',
    language: 'ja',
    date_format: 'YYYY-MM-DD',
    clock_format: '24h',
    measurement_system: 'metric',
    tax_config: {
      name: '消費税',
      rate_percentage: 10,
      calculation_type: 'inclusive',
      is_enabled: true,
      tax_number_label: '登録番号'
    },
    logo_url: '',
    tax_number: 'T1234567890123',
    created_at: '2025-02-01T14:00:00Z',
    subscription_plan: 'pro',
    subscription_status: 'active',
    monthly_order_limit: 10000
  },

  // 5. Australia Store: Outback Coastal Living (Sydney)
  {
    id: 'biz_au_outback',
    name: 'Outback Coastal Goods',
    slug: 'outback-coastal-au',
    category: 'Outdoor & Surf Apparel',
    country: 'Australia',
    country_code: 'AU',
    currency: 'AUD',
    currency_symbol: 'A$',
    currency_decimals: 2,
    phone_country_code: '+61',
    phone: '+61 2 9876 5432',
    email: 'crew@outbackcoastal.com.au',
    address_line1: '12 Bondi Beach Road',
    address_line2: 'Suite 4',
    city: 'Sydney',
    state_province_region: 'NSW',
    postal_zip_code: '2026',
    timezone: 'Australia/Sydney',
    language: 'en',
    date_format: 'DD/MM/YYYY',
    clock_format: '12h',
    measurement_system: 'metric',
    tax_config: {
      name: 'GST',
      rate_percentage: 10,
      calculation_type: 'inclusive',
      is_enabled: true,
      tax_number_label: 'ABN'
    },
    logo_url: '',
    tax_number: 'ABN 12 345 678 901',
    created_at: '2025-02-05T08:00:00Z',
    subscription_plan: 'starter',
    subscription_status: 'active',
    monthly_order_limit: 500
  },

  // 6. Bangladesh Store: Gadget Hub International (Dhaka)
  {
    id: 'biz_bd_gadget',
    name: 'Gadget Hub International',
    slug: 'gadget-hub-bd',
    category: 'Consumer Electronics & Accessories',
    country: 'Bangladesh',
    country_code: 'BD',
    currency: 'BDT',
    currency_symbol: '৳',
    currency_decimals: 2,
    phone_country_code: '+880',
    phone: '+8801711223344',
    email: 'support@gadgethubbd.com',
    address_line1: 'Level 4, Multiplan Centre',
    address_line2: 'New Elephant Road',
    city: 'Dhaka',
    state_province_region: 'Dhaka Division',
    postal_zip_code: '1205',
    timezone: 'Asia/Dhaka',
    language: 'bn',
    date_format: 'DD/MM/YYYY',
    clock_format: '12h',
    measurement_system: 'metric',
    tax_config: {
      name: 'VAT',
      rate_percentage: 5,
      calculation_type: 'exclusive',
      is_enabled: true,
      tax_number_label: 'BIN'
    },
    logo_url: '',
    tax_number: 'BIN-18492049102',
    created_at: '2025-01-15T09:00:00Z',
    subscription_plan: 'pro',
    subscription_status: 'active',
    monthly_order_limit: 10000
  }
];

export const INITIAL_MEMBERS: BusinessMember[] = [
  {
    id: 'mem_1',
    business_id: 'biz_us_apex',
    user_id: 'usr_owner',
    name: 'Alexander Wright',
    email: 'alex@apexpeak.com',
    role: 'owner',
    joined_at: '2025-01-10T10:00:00Z',
    status: 'active'
  },
  {
    id: 'mem_2',
    business_id: 'biz_us_apex',
    user_id: 'usr_admin',
    name: 'Sarah Jenkins',
    email: 'sarah.ops@apexpeak.com',
    role: 'admin',
    joined_at: '2025-01-12T11:00:00Z',
    status: 'active'
  },
  {
    id: 'mem_3',
    business_id: 'biz_us_apex',
    user_id: 'usr_staff',
    name: 'Marcus Chen',
    email: 'marcus@apexpeak.com',
    role: 'staff',
    joined_at: '2025-01-20T14:30:00Z',
    status: 'active'
  }
];

// Global Courier Integrations for US Workspace
export const INITIAL_COURIERS: CourierConfig[] = [
  {
    id: 'cour_fedex',
    business_id: 'biz_us_apex',
    provider: 'fedex',
    name: 'FedEx Express & Ground',
    country_scope: 'global',
    is_connected: true,
    is_active: true,
    account_number: 'FDX-774910294',
    api_key: 'fdx_live_994817293847',
    client_id: 'apex_fedex_merchant',
    domestic_flat_rate: 9.50,
    international_flat_rate: 34.00,
    cash_collection_fee_pct: 0.0,
    tracking_url_template: 'https://www.fedex.com/fedextrack/?trknbr={TRACKING_ID}',
    notes: 'Default domestic 2-day ground and priority dispatch partner.'
  },
  {
    id: 'cour_ups',
    business_id: 'biz_us_apex',
    provider: 'ups',
    name: 'UPS Worldwide',
    country_scope: 'global',
    is_connected: true,
    is_active: true,
    account_number: 'UPS-1Z99824',
    api_key: 'ups_sec_4481029384',
    domestic_flat_rate: 11.00,
    international_flat_rate: 38.50,
    cash_collection_fee_pct: 0.0,
    tracking_url_template: 'https://www.ups.com/track?tracknum={TRACKING_ID}',
    notes: 'Used for heavy freight parcels and cross-border Canada/EU.'
  },
  {
    id: 'cour_dhl',
    business_id: 'biz_us_apex',
    provider: 'dhl',
    name: 'DHL Express Worldwide',
    country_scope: 'global',
    is_connected: false,
    is_active: true,
    domestic_flat_rate: 14.00,
    international_flat_rate: 29.00,
    cash_collection_fee_pct: 0.0,
    tracking_url_template: 'https://www.dhl.com/global-en/home/tracking.html?tracking-id={TRACKING_ID}',
    notes: 'Preferred international air express courier.'
  },
  {
    id: 'cour_usps',
    business_id: 'biz_us_apex',
    provider: 'usps',
    name: 'USPS Priority Mail',
    country_scope: 'domestic',
    is_connected: true,
    is_active: true,
    domestic_flat_rate: 7.20,
    international_flat_rate: 26.00,
    cash_collection_fee_pct: 0.0,
    tracking_url_template: 'https://tools.usps.com/go/TrackConfirmAction?tLabels={TRACKING_ID}',
    notes: 'Standard US residential delivery & PO Box service.'
  }
];

// E-Commerce Channel Integrations
export const INITIAL_INTEGRATIONS: ECommerceIntegration[] = [
  {
    id: 'integ_shopify',
    business_id: 'biz_us_apex',
    channel: 'shopify',
    name: 'Shopify Storefront',
    is_connected: true,
    store_url: 'apex-peak-apparel.myshopify.com',
    api_key: 'shpat_99481729384710293847',
    last_sync_at: '2025-02-23T10:45:00Z',
    orders_synced_count: 342,
    auto_sync: true
  },
  {
    id: 'integ_woo',
    business_id: 'biz_us_apex',
    channel: 'woocommerce',
    name: 'WooCommerce Wholesale Portal',
    is_connected: false,
    store_url: 'b2b.apexpeak.com',
    orders_synced_count: 0,
    auto_sync: false
  },
  {
    id: 'integ_amazon',
    business_id: 'biz_us_apex',
    channel: 'amazon',
    name: 'Amazon Marketplace FBM',
    is_connected: true,
    last_sync_at: '2025-02-23T09:15:00Z',
    orders_synced_count: 118,
    auto_sync: true
  }
];

// 30 International Products with variants and weights
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    business_id: 'biz_us_apex',
    title: 'Merino Wool Trail Thermal Pullover',
    sku: 'APP-MTR-01',
    barcode: '081023456701',
    category: 'Outerwear',
    description: '100% Australian Merino wool, moisture-wicking and odor-resistant for outdoor alpine trails.',
    purchase_price: 38.00,
    selling_price: 98.00,
    stock: 64,
    min_stock_alert: 12,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    weight: 1.1,
    weight_unit: 'lb',
    variants: [
      { id: 'v_1a', product_id: 'prod_1', name: 'Size: M / Heather Charcoal', sku: 'APP-MTR-M-GRY', stock: 32, price_adjustment: 0 },
      { id: 'v_1b', product_id: 'prod_1', name: 'Size: L / Pine Green', sku: 'APP-MTR-L-GRN', stock: 32, price_adjustment: 0 }
    ],
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-02-12T10:00:00Z'
  },
  {
    id: 'prod_2',
    business_id: 'biz_us_apex',
    title: 'Waterproof All-Weather Commuter Backpack 28L',
    sku: 'BAG-AW28-02',
    barcode: '081023456702',
    category: 'Bags & Packs',
    description: 'Cordura 500D ballistic nylon with magnetic Fidlock sternum buckle and 16-inch padded laptop pocket.',
    purchase_price: 45.00,
    selling_price: 125.00,
    stock: 38,
    min_stock_alert: 8,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    weight: 2.2,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-11T11:00:00Z',
    updated_at: '2025-02-14T09:00:00Z'
  },
  {
    id: 'prod_3',
    business_id: 'biz_us_apex',
    title: 'Wireless Active Noise-Cancelling Headphones Pro',
    sku: 'AUD-ANC-03',
    barcode: '081023456703',
    category: 'Audio',
    description: 'Custom 40mm beryllium drivers, 38-hour battery with USB-C fast charge and spatial audio support.',
    purchase_price: 65.00,
    selling_price: 189.00,
    stock: 22,
    min_stock_alert: 6,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    weight: 0.8,
    weight_unit: 'lb',
    variants: [
      { id: 'v_3a', product_id: 'prod_3', name: 'Matte Space Gray', sku: 'AUD-ANC-SGRY', stock: 12, price_adjustment: 0 },
      { id: 'v_3b', product_id: 'prod_3', name: 'Arctic Silver', sku: 'AUD-ANC-SLVR', stock: 10, price_adjustment: 0 }
    ],
    created_at: '2025-01-12T12:00:00Z',
    updated_at: '2025-02-15T14:00:00Z'
  },
  {
    id: 'prod_4',
    business_id: 'biz_us_apex',
    title: 'Aerospace Titanium Carabiner Keychain Tool',
    sku: 'EDC-TI-04',
    barcode: '081023456704',
    category: 'Everyday Carry',
    description: 'CNC machined Grade 5 titanium with integrated pry bar, bottle opener, and hex bit driver.',
    purchase_price: 11.00,
    selling_price: 36.00,
    stock: 140,
    min_stock_alert: 25,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&q=80',
    weight: 0.2,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-13T10:30:00Z',
    updated_at: '2025-02-10T12:00:00Z'
  },
  {
    id: 'prod_5',
    business_id: 'biz_us_apex',
    title: 'MagSafe Wireless Charging Desk Valet 3-in-1',
    sku: 'CHG-VALET-05',
    barcode: '081023456705',
    category: 'Electronics',
    description: 'Solid American walnut tray with aircraft-grade aluminum stand for iPhone, AirPods, and Apple Watch.',
    purchase_price: 39.00,
    selling_price: 110.00,
    stock: 18,
    min_stock_alert: 5,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&q=80',
    weight: 1.5,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-14T09:15:00Z',
    updated_at: '2025-02-18T11:00:00Z'
  },
  {
    id: 'prod_6',
    business_id: 'biz_us_apex',
    title: 'Heavyweight Loopback French Terry Hoodie',
    sku: 'APP-HDY-06',
    barcode: '081023456706',
    category: 'Outerwear',
    description: '450 GSM organic combed cotton with double-needle reverse coverstitching and ribbed side gussets.',
    purchase_price: 29.00,
    selling_price: 85.00,
    stock: 50,
    min_stock_alert: 10,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80',
    weight: 1.8,
    weight_unit: 'lb',
    variants: [
      { id: 'v_6a', product_id: 'prod_6', name: 'Size: S / Vintage Black', sku: 'APP-HDY-S-BLK', stock: 15, price_adjustment: 0 },
      { id: 'v_6b', product_id: 'prod_6', name: 'Size: M / Vintage Black', sku: 'APP-HDY-M-BLK', stock: 20, price_adjustment: 0 },
      { id: 'v_6c', product_id: 'prod_6', name: 'Size: L / Oatmeal Melange', sku: 'APP-HDY-L-OTM', stock: 15, price_adjustment: 0 }
    ],
    created_at: '2025-01-15T15:00:00Z',
    updated_at: '2025-02-19T13:00:00Z'
  },
  {
    id: 'prod_7',
    business_id: 'biz_us_apex',
    title: 'Custom Keyboard Mechanical Desk Mat 900x400mm',
    sku: 'MAT-TOP-07',
    barcode: '081023456707',
    category: 'Accessories',
    description: 'Micro-textured waterproof cloth surface with anti-slip natural rubber base and topographical linework.',
    purchase_price: 9.50,
    selling_price: 29.00,
    stock: 85,
    min_stock_alert: 15,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=400&q=80',
    weight: 1.2,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-16T11:45:00Z',
    updated_at: '2025-02-16T16:00:00Z'
  },
  {
    id: 'prod_8',
    business_id: 'biz_us_apex',
    title: 'Precision CNC Aluminum Laptop Riser',
    sku: 'STN-ALUM-08',
    barcode: '081023456708',
    category: 'Accessories',
    description: 'Ergonomic dual-hinge design with silicone anti-scratch padding and ventilated cooling aperture.',
    purchase_price: 18.00,
    selling_price: 49.00,
    stock: 4, // Low stock trigger
    min_stock_alert: 8,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
    weight: 2.4,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-17T14:10:00Z',
    updated_at: '2025-02-17T17:00:00Z'
  },
  {
    id: 'prod_9',
    business_id: 'biz_us_apex',
    title: 'Braided Type-C Thunderbolt 4 Cable 2M (240W)',
    sku: 'CBL-TB4-09',
    barcode: '081023456709',
    category: 'Electronics',
    description: '40Gbps data transfer, 8K video output, and 240W Power Delivery with certified E-Marker chip.',
    purchase_price: 8.00,
    selling_price: 28.00,
    stock: 120,
    min_stock_alert: 20,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400&q=80',
    weight: 0.3,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-02-20T12:00:00Z'
  },
  {
    id: 'prod_10',
    business_id: 'biz_us_apex',
    title: 'Insulated Ceramic Travel Tumbler 16oz',
    sku: 'DRK-TMB-10',
    barcode: '081023456710',
    category: 'Home & Drinkware',
    description: 'Double-wall vacuum insulated stainless steel with True Taste interior ceramic coating and leakproof splash guard.',
    purchase_price: 12.00,
    selling_price: 38.00,
    stock: 0, // Sold out trigger
    min_stock_alert: 10,
    status: 'active',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80',
    weight: 0.9,
    weight_unit: 'lb',
    variants: [],
    created_at: '2025-01-19T09:00:00Z',
    updated_at: '2025-02-15T15:00:00Z'
  }
];

// 20 International Customers from USA, Canada, UK, Germany, Australia, Japan
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    business_id: 'biz_us_apex',
    name: 'Emily Watson',
    phone_country_code: '+1',
    phone: '+1 415 555 2671',
    email: 'emily.watson@gmail.com',
    address_line1: '742 Montgomery Street',
    address_line2: 'Apt 4B',
    city: 'San Francisco',
    state_province_region: 'CA',
    postal_zip_code: '94111',
    country: 'United States',
    country_code: 'US',
    category: 'vip',
    total_orders: 8,
    total_spent: 890.00,
    last_order_date: '2025-02-22T10:15:00Z',
    notes: 'Loyal VIP customer. Prefers FedEx 2-Day delivery to downtown office.',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'cust_2',
    business_id: 'biz_us_apex',
    name: 'Oliver Brooks',
    phone_country_code: '+44',
    phone: '+44 20 7946 0884',
    email: 'oliver.brooks@outlook.co.uk',
    address_line1: '18 Kensington Church Street',
    city: 'London',
    state_province_region: 'Greater London',
    postal_zip_code: 'W8 4EP',
    country: 'United Kingdom',
    country_code: 'GB',
    category: 'vip',
    total_orders: 5,
    total_spent: 620.00,
    last_order_date: '2025-02-21T14:30:00Z',
    notes: 'International repeat buyer for Merino wool pullovers.',
    created_at: '2025-01-12T11:00:00Z'
  },
  {
    id: 'cust_3',
    business_id: 'biz_us_apex',
    name: 'Maximilian Weber',
    phone_country_code: '+49',
    phone: '+49 89 2339900',
    email: 'm.weber@tech-muc.de',
    address_line1: 'Leopoldstraße 45',
    city: 'Munich',
    state_province_region: 'Bavaria',
    postal_zip_code: '80802',
    country: 'Germany',
    country_code: 'DE',
    category: 'regular',
    total_orders: 3,
    total_spent: 345.00,
    last_order_date: '2025-02-20T16:00:00Z',
    created_at: '2025-01-15T09:30:00Z'
  },
  {
    id: 'cust_4',
    business_id: 'biz_us_apex',
    name: 'Sophie Tremblay',
    phone_country_code: '+1',
    phone: '+1 514 555 0192',
    email: 'sophie.tremblay@videotron.ca',
    address_line1: '1240 Rue Saint-Denis',
    city: 'Montreal',
    state_province_region: 'QC',
    postal_zip_code: 'H2X 3J5',
    country: 'Canada',
    country_code: 'CA',
    category: 'vip',
    total_orders: 6,
    total_spent: 740.00,
    last_order_date: '2025-02-22T11:45:00Z',
    created_at: '2025-01-18T14:00:00Z'
  },
  {
    id: 'cust_5',
    business_id: 'biz_us_apex',
    name: 'Lucas Campbell',
    phone_country_code: '+61',
    phone: '+61 2 9234 5678',
    email: 'lucas.campbell@sydney.edu.au',
    address_line1: '55 George Street',
    city: 'Sydney',
    state_province_region: 'NSW',
    postal_zip_code: '2000',
    country: 'Australia',
    country_code: 'AU',
    category: 'regular',
    total_orders: 4,
    total_spent: 420.00,
    last_order_date: '2025-02-19T13:10:00Z',
    created_at: '2025-01-20T10:00:00Z'
  },
  {
    id: 'cust_6',
    business_id: 'biz_us_apex',
    name: 'Kenji Sato (佐藤 健司)',
    phone_country_code: '+81',
    phone: '+81 3 3456 7890',
    email: 'k.sato@ginzastudio.jp',
    address_line1: '4-12-15 Ginza',
    city: 'Chuo-ku',
    state_province_region: 'Tokyo',
    postal_zip_code: '104-0061',
    country: 'Japan',
    country_code: 'JP',
    category: 'regular',
    total_orders: 3,
    total_spent: 380.00,
    last_order_date: '2025-02-18T17:20:00Z',
    created_at: '2025-01-22T12:00:00Z'
  },
  {
    id: 'cust_7',
    business_id: 'biz_us_apex',
    name: 'Chloe Dubois',
    phone_country_code: '+33',
    phone: '+33 1 42 68 55 00',
    email: 'chloe.dubois@free.fr',
    address_line1: '8 Rue de Rivoli',
    city: 'Paris',
    state_province_region: 'Île-de-France',
    postal_zip_code: '75004',
    country: 'France',
    country_code: 'FR',
    category: 'regular',
    total_orders: 2,
    total_spent: 235.00,
    last_order_date: '2025-02-17T15:00:00Z',
    created_at: '2025-01-25T11:30:00Z'
  },
  {
    id: 'cust_8',
    business_id: 'biz_us_apex',
    name: 'David Miller',
    phone_country_code: '+1',
    phone: '+1 312 555 8821',
    email: 'david.miller@uchicago.edu',
    address_line1: '5801 S Ellis Ave',
    city: 'Chicago',
    state_province_region: 'IL',
    postal_zip_code: '60637',
    country: 'United States',
    country_code: 'US',
    category: 'vip',
    total_orders: 7,
    total_spent: 980.00,
    last_order_date: '2025-02-23T09:30:00Z',
    created_at: '2025-01-26T16:00:00Z'
  }
];

// Generate 50 realistic international orders
export function generateInitialOrders(): Order[] {
  const orders: Order[] = [];

  for (let i = 1; i <= 50; i++) {
    const custIndex = (i - 1) % INITIAL_CUSTOMERS.length;
    const cust = INITIAL_CUSTOMERS[custIndex];
    const orderNum = `ORD-US-${2000 + i}`;

    const prod1 = INITIAL_PRODUCTS[(i * 2) % INITIAL_PRODUCTS.length];
    const prod2 = INITIAL_PRODUCTS[(i * 3) % INITIAL_PRODUCTS.length];
    const qty1 = (i % 2) + 1;
    const qty2 = (i % 3 === 0) ? 1 : 0;

    const items = [
      {
        id: `oi_${i}_1`,
        order_id: `ord_${i}`,
        product_id: prod1.id,
        product_title: prod1.title,
        variant_name: prod1.variants.length > 0 ? prod1.variants[0].name : undefined,
        sku: prod1.sku,
        quantity: qty1,
        unit_price: prod1.selling_price,
        unit_cost: prod1.purchase_price,
        total_price: prod1.selling_price * qty1
      }
    ];

    if (qty2 > 0) {
      items.push({
        id: `oi_${i}_2`,
        order_id: `ord_${i}`,
        product_id: prod2.id,
        product_title: prod2.title,
        variant_name: prod2.variants.length > 0 ? prod2.variants[0].name : undefined,
        sku: prod2.sku,
        quantity: qty2,
        unit_price: prod2.selling_price,
        unit_cost: prod2.purchase_price,
        total_price: prod2.selling_price * qty2
      });
    }

    const subtotal = items.reduce((sum, it) => sum + it.total_price, 0);
    const totalCost = items.reduce((sum, it) => sum + (it.unit_cost * it.quantity), 0);
    const discount = (i % 6 === 0) ? 15.00 : 0;
    const isDomestic = cust.country_code === 'US';
    const deliveryCharge = isDomestic ? 9.50 : 28.00;
    const taxRate = 0.08875;
    const taxAmount = Number(((subtotal - discount) * taxRate).toFixed(2));
    const totalAmount = Number((subtotal - discount + deliveryCharge + taxAmount).toFixed(2));
    const estimatedProfit = Number((totalAmount - totalCost - (deliveryCharge * 0.7) - taxAmount).toFixed(2));

    const status = (i >= 46) ? 'pending'
      : (i >= 42) ? 'confirmed'
      : (i >= 38) ? 'processing'
      : (i >= 32) ? 'ready_to_ship'
      : (i >= 24) ? 'shipped'
      : (i === 11) ? 'returned'
      : (i === 9) ? 'cancelled'
      : 'delivered';

    let paymentStatus: Order['payment_status'] = 'paid';
    let paymentMethod: Order['payment_method'] = (i % 3 === 0) ? 'apple_pay' : (i % 4 === 0) ? 'paypal' : 'credit_card';

    if (status === 'pending') {
      paymentStatus = i % 2 === 0 ? 'paid' : 'unpaid';
    } else if (status === 'cancelled' || status === 'returned') {
      paymentStatus = 'refunded';
    }

    const courierProvider = isDomestic ? (i % 2 === 0 ? 'fedex' : 'usps') : 'dhl';
    const courierName = courierProvider === 'fedex' ? 'FedEx Express' : courierProvider === 'usps' ? 'USPS Priority Mail' : 'DHL Express Worldwide';
    const trackingId = (status !== 'pending' && status !== 'cancelled') ? `TRK-${courierProvider.toUpperCase()}-${800000 + i}` : undefined;

    const dayOffset = Math.floor((50 - i) / 2);
    const baseDate = new Date('2025-02-23T10:00:00Z');
    baseDate.setDate(baseDate.getDate() - dayOffset);
    baseDate.setMinutes(baseDate.getMinutes() + (i * 12));
    const createdDateStr = baseDate.toISOString();

    orders.push({
      id: `ord_${i}`,
      order_number: orderNum,
      business_id: 'biz_us_apex',
      customer_id: cust.id,
      customer_name: cust.name,
      customer_phone: `${cust.phone_country_code} ${cust.phone}`,
      customer_email: cust.email,
      shipping_address: {
        recipient_name: cust.name,
        phone_country_code: cust.phone_country_code,
        phone: cust.phone,
        email: cust.email,
        address_line1: cust.address_line1 || cust.address || '',
        address_line2: cust.address_line2,
        city: cust.city || 'San Francisco',
        state_province_region: cust.state_province_region || cust.state_province,
        postal_zip_code: cust.postal_zip_code || cust.postal_code,
        country: cust.country || cust.country_name || 'United States',
        country_code: cust.country_code || 'US'
      },
      status,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      currency: 'USD',
      currency_symbol: '$',
      exchange_rate_to_usd: 1.0,
      subtotal,
      discount,
      delivery_charge: deliveryCharge,
      tax_amount: taxAmount,
      tax_name: 'Sales Tax (8.875%)',
      total_amount: totalAmount,
      total_cost: totalCost,
      estimated_profit: estimatedProfit,
      items,
      courier_id: courierProvider,
      courier_name: courierName,
      courier_tracking_id: trackingId,
      courier_tracking_url: trackingId ? `https://www.google.com/search?q=${trackingId}` : undefined,
      consignment_id: trackingId ? `CN-${courierProvider.toUpperCase()}-${70000 + i}` : undefined,
      package_weight: items.reduce((sum, it) => sum + (it.quantity * 1.2), 0),
      package_weight_unit: 'lb',
      internal_notes: i % 5 === 0 ? 'Verified via Shopify automated fraud analysis (Low risk).' : undefined,
      timeline: [
        {
          id: `tl_${i}_1`,
          timestamp: createdDateStr,
          status: 'pending',
          note: 'Order imported from online checkout.',
          actor_name: 'Shopify Storefront Webhook'
        },
        ...(status !== 'pending' ? [{
          id: `tl_${i}_2`,
          timestamp: new Date(baseDate.getTime() + 1800000).toISOString(),
          status: 'confirmed' as const,
          note: 'Payment authorized and inventory reserved.',
          actor_name: 'Stripe Gateway'
        }] : []),
        ...(status === 'shipped' || status === 'delivered' ? [{
          id: `tl_${i}_3`,
          timestamp: new Date(baseDate.getTime() + 7200000).toISOString(),
          status: 'shipped' as const,
          note: `Shipping manifest scanned by ${courierName}. Tracking: ${trackingId}`,
          actor_name: 'Fulfillment Dispatch'
        }] : []),
        ...(status === 'delivered' ? [{
          id: `tl_${i}_4`,
          timestamp: new Date(baseDate.getTime() + 86400000).toISOString(),
          status: 'delivered' as const,
          note: 'Package signed and delivered to recipient.',
          actor_name: `${courierName} Webhook`
        }] : [])
      ],
      created_at: createdDateStr,
      updated_at: createdDateStr
    });
  }

  return orders;
}

export const INITIAL_ORDERS: Order[] = generateInitialOrders();

export const INITIAL_SHIPMENTS: CourierShipment[] = INITIAL_ORDERS
  .filter(o => o.courier_tracking_id)
  .slice(0, 30)
  .map(o => ({
    id: `shp_${o.id}`,
    business_id: 'biz_us_apex',
    order_id: o.id,
    order_number: o.order_number,
    courier_provider: (o.courier_id as any) || 'fedex',
    courier_name: o.courier_name || 'FedEx Express',
    tracking_id: o.courier_tracking_id!,
    tracking_url: o.courier_tracking_url,
    consignment_id: o.consignment_id || `CN-${o.order_number}`,
    cod_amount: o.payment_method === 'cod' ? o.total_amount : 0,
    delivery_fee: o.delivery_charge,
    status: o.status === 'delivered' ? 'delivered'
      : o.status === 'returned' ? 'returned'
      : o.status === 'cancelled' ? 'failed'
      : 'in_transit',
    recipient_name: o.customer_name,
    recipient_phone: o.customer_phone,
    recipient_address_summary: `${o.shipping_address.city}, ${o.shipping_address.state_province_region} ${o.shipping_address.country_code}`,
    destination_country: o.shipping_address.country,
    weight: o.package_weight || 1.5,
    weight_unit: 'lb',
    created_at: o.created_at,
    updated_at: o.updated_at
  }));

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    business_id: 'biz_us_apex',
    title: 'Meta / Instagram Dynamic Product Ads (February)',
    category: 'meta_facebook_ads',
    amount: 1450.00,
    currency: 'USD',
    payment_method: 'Corporate Visa Card',
    date: '2025-02-15',
    notes: 'Conversion campaign targeting US alpine and outdoor lifestyle audience.',
    created_at: '2025-02-15T12:00:00Z'
  },
  {
    id: 'exp_2',
    business_id: 'biz_us_apex',
    title: 'Recycled Corrugated Mailer Boxes & Custom Tissue (1,000 units)',
    category: 'packaging',
    amount: 620.00,
    currency: 'USD',
    payment_method: 'Bank ACH Transfer',
    date: '2025-02-10',
    notes: 'Eco-friendly branded packaging supplies from EcoEnclose.',
    created_at: '2025-02-10T14:30:00Z'
  },
  {
    id: 'exp_3',
    business_id: 'biz_us_apex',
    title: 'Brooklyn Fulfillment Warehouse Bay Monthly Lease',
    category: 'office_warehouse_rent',
    amount: 2200.00,
    currency: 'USD',
    payment_method: 'Wire Transfer',
    date: '2025-02-01',
    notes: 'Fulfillment hub & pick-pack facility rent for February.',
    created_at: '2025-02-01T09:00:00Z'
  },
  {
    id: 'exp_4',
    business_id: 'biz_us_apex',
    title: 'Warehouse Pack & Quality Assurance Specialist Wages',
    category: 'employee_salaries',
    amount: 3200.00,
    currency: 'USD',
    payment_method: 'Gusto Payroll',
    date: '2025-02-15',
    notes: 'Bi-weekly fulfillment team compensation.',
    created_at: '2025-02-15T10:00:00Z'
  },
  {
    id: 'exp_5',
    business_id: 'biz_us_apex',
    title: 'Stripe & PayPal Merchant Processing Gateway Fees',
    category: 'bank_gateway_fees',
    amount: 185.00,
    currency: 'USD',
    payment_method: 'Automated Balance Deduction',
    date: '2025-02-18',
    notes: 'Standard 2.9% + 30¢ credit card processing fees.',
    created_at: '2025-02-18T16:00:00Z'
  },
  {
    id: 'exp_6',
    business_id: 'biz_us_apex',
    title: 'Google Shopping & Performance Max Search Campaign',
    category: 'google_ads',
    amount: 890.00,
    currency: 'USD',
    payment_method: 'Corporate Credit Card',
    date: '2025-02-14',
    created_at: '2025-02-14T11:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    business_id: 'biz_us_apex',
    title: 'Low Inventory Alert: Laptop Riser',
    message: 'Precision CNC Aluminum Laptop Riser has only 4 units remaining (Threshold: 8).',
    type: 'stock',
    is_read: false,
    link_tab: 'inventory',
    created_at: '2025-02-23T09:10:00Z'
  },
  {
    id: 'notif_2',
    business_id: 'biz_us_apex',
    title: 'Shopify Channel Sync Completed',
    message: '14 new customer orders imported from Shopify online storefront.',
    type: 'integration',
    is_read: false,
    link_tab: 'integrations',
    created_at: '2025-02-23T08:30:00Z'
  },
  {
    id: 'notif_3',
    business_id: 'biz_us_apex',
    title: 'FedEx Parcel Delivered',
    message: 'Tracking #TRK-FEDEX-800045 was successfully delivered to customer in San Francisco.',
    type: 'delivery',
    is_read: true,
    link_tab: 'couriers',
    created_at: '2025-02-22T17:40:00Z'
  }
];
