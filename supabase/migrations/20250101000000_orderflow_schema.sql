-- ==============================================================================
-- ORDERFLOW: COMPLETE POSTGRESQL DATABASE SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Commercial E-commerce Order Management SaaS
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'ready_to_ship',
    'shipped', 'delivered', 'cancelled', 'returned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'partially_paid', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE customer_category AS ENUM ('new', 'regular', 'vip', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Businesses (Workspaces) Table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Retail & Fashion',
  country TEXT NOT NULL DEFAULT 'Bangladesh',
  currency TEXT NOT NULL DEFAULT 'BDT',
  currency_symbol TEXT NOT NULL DEFAULT '৳',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dhaka',
  timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
  logo_url TEXT,
  tax_number TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  monthly_order_limit INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Business Members Table (Multi-tenant Access Control)
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, user_id)
);

-- 6. Product Categories Table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, slug)
);

-- 7. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Cost of Goods Sold
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active', -- active, draft, archived
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, sku)
);

-- 8. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  price_adjustment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Inventory Movements (Stock Ledger) Table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT,
  quantity_change INT NOT NULL,
  resulting_stock INT NOT NULL,
  movement_type TEXT NOT NULL, -- sale, restock, return_restore, cancellation_restore, damage, audit_adjustment
  reference_order_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dhaka',
  category customer_category NOT NULL DEFAULT 'new',
  total_orders INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  last_order_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL DEFAULT 'Dhaka',
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  estimated_profit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  courier_id TEXT,
  courier_name TEXT,
  courier_tracking_id TEXT,
  consignment_id TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, order_number)
);

-- 12. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- 13. Order Status History (Audit Timeline) Table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  actor_name TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Couriers Table
CREATE TABLE IF NOT EXISTS public.couriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- pathao, steadfast, redx, paperfly, manual
  name TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_key TEXT,
  api_secret TEXT,
  client_id TEXT,
  store_id TEXT,
  webhook_url TEXT,
  inside_city_rate NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
  outside_city_rate NUMERIC(10, 2) NOT NULL DEFAULT 120.00,
  cash_collection_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Courier Shipments Table
CREATE TABLE IF NOT EXISTS public.courier_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  courier_provider TEXT NOT NULL,
  courier_name TEXT NOT NULL,
  tracking_id TEXT NOT NULL,
  consignment_id TEXT NOT NULL,
  cod_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'booked',
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, invoice_number)
);

-- 18. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_tab TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_business_created ON public.orders(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_prod ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON public.expenses(business_id, date DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Data Isolation: Users can ONLY access data in their businesses!
-- ==============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is member of business
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = b_id AND user_id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for businesses
CREATE POLICY "Users can view businesses they belong to"
  ON public.businesses FOR SELECT
  USING (public.is_business_member(id));

CREATE POLICY "Authenticated users can create a new business"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for products
CREATE POLICY "Members can select products"
  ON public.products FOR SELECT
  USING (public.is_business_member(business_id));

CREATE POLICY "Members can insert/update products"
  ON public.products FOR ALL
  USING (public.is_business_member(business_id));

-- Policies for orders
CREATE POLICY "Members can access orders"
  ON public.orders FOR ALL
  USING (public.is_business_member(business_id));

-- Policies for customers
CREATE POLICY "Members can access customers"
  ON public.customers FOR ALL
  USING (public.is_business_member(business_id));

-- Policies for expenses
CREATE POLICY "Members can access expenses"
  ON public.expenses FOR ALL
  USING (public.is_business_member(business_id));

-- Policies for courier shipments
CREATE POLICY "Members can access shipments"
  ON public.courier_shipments FOR ALL
  USING (public.is_business_member(business_id));

-- Policies for invoices
CREATE POLICY "Members can access invoices"
  ON public.invoices FOR ALL
  USING (public.is_business_member(business_id));

-- Policies for notifications
CREATE POLICY "Members can access notifications"
  ON public.notifications FOR ALL
  USING (public.is_business_member(business_id));
