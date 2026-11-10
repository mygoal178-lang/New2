-- ==============================================================================
-- ORDERFLOW: SAMPLE SEED DATA SCRIPT
-- Seeds default business workspace, couriers, products, and categories
-- ==============================================================================

DO $$
DECLARE
  v_biz_id UUID := 'b0000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert demo business
  INSERT INTO public.businesses (id, name, slug, category, country, currency, currency_symbol, phone, email, address, city, timezone, subscription_plan, subscription_status)
  VALUES (
    v_biz_id,
    'Gadget Hub Bangladesh',
    'gadget-hub-bd',
    'Consumer Electronics & Accessories',
    'Bangladesh',
    'BDT',
    '৳',
    '+8801711223344',
    'support@gadgethubbd.com',
    'Level 4, Multiplan Centre, New Elephant Road',
    'Dhaka',
    'Asia/Dhaka',
    'pro',
    'active'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Couriers
  INSERT INTO public.couriers (business_id, provider, name, is_connected, is_active, inside_city_rate, outside_city_rate, cash_collection_fee_pct)
  VALUES
    (v_biz_id, 'pathao', 'Pathao Courier', true, true, 60.00, 120.00, 1.00),
    (v_biz_id, 'steadfast', 'Steadfast Courier', true, true, 70.00, 130.00, 1.00),
    (v_biz_id, 'redx', 'RedX Logistics', false, true, 60.00, 120.00, 1.00),
    (v_biz_id, 'paperfly', 'Paperfly Go', false, false, 75.00, 140.00, 1.50)
  ON CONFLICT DO NOTHING;

  -- Insert Categories
  INSERT INTO public.product_categories (business_id, name, slug)
  VALUES
    (v_biz_id, 'Wireless Audio', 'wireless-audio'),
    (v_biz_id, 'Smart Wearables', 'smart-wearables'),
    (v_biz_id, 'Power & Cables', 'power-cables'),
    (v_biz_id, 'Phone Accessories', 'phone-accessories')
  ON CONFLICT DO NOTHING;
END $$;
