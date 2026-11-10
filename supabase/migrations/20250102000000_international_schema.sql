-- ====================================================================
-- OrderFlow International SaaS Migration
-- Version: 20250102000000_international_schema.sql
-- Description: Non-destructive migration to upgrade OrderFlow into
--              a fully international, multi-currency, multi-lingual,
--              tax-compliant, and multi-channel eCommerce SaaS platform.
-- ====================================================================

-- 1. EXTEND BUSINESSES (WORKSPACES) TABLE
ALTER TABLE IF EXISTS businesses
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS state_province VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30) DEFAULT '',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  ADD COLUMN IF NOT EXISTS clock_format VARCHAR(10) DEFAULT '12h',
  ADD COLUMN IF NOT EXISTS measurement_system VARCHAR(20) DEFAULT 'metric',
  ADD COLUMN IF NOT EXISTS tax_config JSONB DEFAULT '{
    "tax_name": "Sales Tax",
    "default_rate": 0,
    "is_inclusive": false,
    "tax_id_number": ""
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS supported_currencies TEXT[] DEFAULT ARRAY['USD', 'EUR', 'GBP'];

-- 2. EXTEND ORDERS TABLE WITH INTERNATIONAL ADDRESS & TAX SNAPSHOTS
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(10) DEFAULT '$',
  ADD COLUMN IF NOT EXISTS exchange_rate_snapshot NUMERIC(12, 6) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS shipping_address_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS shipping_country_code VARCHAR(10) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(30) DEFAULT '',
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(6, 3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_name VARCHAR(50) DEFAULT 'Tax',
  ADD COLUMN IF NOT EXISTS is_tax_inclusive BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sales_channel VARCHAR(50) DEFAULT 'direct_store',
  ADD COLUMN IF NOT EXISTS package_weight_kg NUMERIC(8, 3) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS courier_tracking_url TEXT DEFAULT '';

-- 3. EXTEND CUSTOMERS TABLE WITH GLOBAL FIELDS
ALTER TABLE IF EXISTS customers
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS country_name VARCHAR(100) DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS state_province VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30) DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'USD';

-- 4. EXTEND PRODUCTS TABLE FOR GLOBAL COMMERCE
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8, 3) DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS dimensions_cm JSONB DEFAULT '{"length": 15, "width": 10, "height": 5}'::jsonb,
  ADD COLUMN IF NOT EXISTS hs_code VARCHAR(30) DEFAULT '',
  ADD COLUMN IF NOT EXISTS origin_country VARCHAR(10) DEFAULT 'US';

-- 5. CREATE E-COMMERCE CHANNELS / INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS ecommerce_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- shopify, woocommerce, amazon, ebay, etsy, custom
  store_name VARCHAR(255) NOT NULL,
  store_url TEXT DEFAULT '',
  api_key_masked VARCHAR(50) DEFAULT '',
  is_connected BOOLEAN DEFAULT true,
  auto_sync_orders BOOLEAN DEFAULT true,
  auto_sync_inventory BOOLEAN DEFAULT true,
  orders_synced_count INT DEFAULT 0,
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security for Integrations
ALTER TABLE ecommerce_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ecommerce integrations in their businesses"
  ON ecommerce_integrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = ecommerce_integrations.business_id
      AND business_members.user_id = auth.uid()
    )
  );

-- 6. CREATE MULTI-CURRENCY CONSOLIDATION VIEW
CREATE OR REPLACE VIEW v_orders_consolidated_usd AS
SELECT
  o.id,
  o.business_id,
  o.order_number,
  o.created_at,
  o.status,
  o.payment_status,
  o.currency_code,
  o.total_amount,
  o.exchange_rate_snapshot,
  -- Calculate USD equivalent for global executive roll-up
  CASE 
    WHEN o.exchange_rate_snapshot > 0 THEN (o.total_amount / o.exchange_rate_snapshot)
    ELSE o.total_amount
  END AS total_amount_usd,
  CASE
    WHEN o.exchange_rate_snapshot > 0 THEN (o.estimated_profit / o.exchange_rate_snapshot)
    ELSE o.estimated_profit
  END AS estimated_profit_usd
FROM orders o;

-- 7. INDEXES FOR HIGH-THROUGHPUT GLOBAL QUERIES
CREATE INDEX IF NOT EXISTS idx_orders_business_created ON orders (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders (business_id, currency_code);
CREATE INDEX IF NOT EXISTS idx_customers_country ON customers (business_id, country_code);
CREATE INDEX IF NOT EXISTS idx_integrations_business ON ecommerce_integrations (business_id);
