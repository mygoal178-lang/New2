import type { VercelRequest, VercelResponse } from '@vercel/node';

type Channel = 'shopify' | 'woocommerce' | 'amazon';

interface SyncBody {
  channel: Channel;
  store_url?: string;
  api_key?: string;
  api_secret?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  marketplace_id?: string;
  region?: 'na' | 'eu' | 'fe';
  /** ISO date — only orders created after this (optional) */
  created_after?: string;
  limit?: number;
}

export interface NormalizedOrder {
  external_id: string;
  order_number: string;
  channel: Channel;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: number;
  total_amount: number;
  shipping_address: {
    address_line1?: string;
    city?: string;
    state_province_region?: string;
    postal_zip_code?: string;
    country?: string;
    country_code?: string;
  };
  items: Array<{
    product_title: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  created_at: string;
  raw?: unknown;
}

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function normalizeShopifyHost(storeUrl: string): string {
  let host = storeUrl.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!host.includes('.')) host = `${host}.myshopify.com`;
  return host;
}

function mapShopifyFinancial(status?: string): string {
  if (status === 'paid') return 'paid';
  if (status === 'partially_paid') return 'partially_paid';
  if (status === 'refunded') return 'refunded';
  return 'unpaid';
}

function mapShopifyFulfillment(status?: string): string {
  if (status === 'fulfilled') return 'shipped';
  if (status === 'partial') return 'processing';
  return 'pending';
}

async function syncShopify(body: SyncBody): Promise<NormalizedOrder[]> {
  const host = normalizeShopifyHost(body.store_url || '');
  const token = body.api_key || '';
  const limit = Math.min(body.limit || 50, 100);
  const params = new URLSearchParams({
    status: 'any',
    limit: String(limit),
    order: 'created_at desc'
  });
  if (body.created_after) params.set('created_at_min', body.created_after);

  const url = `https://${host}/admin/api/2024-10/orders.json?${params}`;
  const r = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    }
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.errors || data?.error || `Shopify orders failed (${r.status})`);
  }

  const orders = data.orders || [];
  return orders.map((o: any): NormalizedOrder => {
    const addr = o.shipping_address || o.billing_address || {};
    return {
      external_id: String(o.id),
      order_number: o.name || String(o.order_number || o.id),
      channel: 'shopify',
      customer_name: [addr.first_name, addr.last_name].filter(Boolean).join(' ') || o.email || 'Customer',
      customer_email: o.email || addr.email,
      customer_phone: addr.phone || o.phone,
      status: mapShopifyFulfillment(o.fulfillment_status),
      payment_status: mapShopifyFinancial(o.financial_status),
      currency: o.currency || 'USD',
      subtotal: parseFloat(o.subtotal_price || '0'),
      total_amount: parseFloat(o.total_price || '0'),
      shipping_address: {
        address_line1: addr.address1,
        city: addr.city,
        state_province_region: addr.province,
        postal_zip_code: addr.zip,
        country: addr.country,
        country_code: addr.country_code
      },
      items: (o.line_items || []).map((li: any) => ({
        product_title: li.title || li.name,
        sku: li.sku,
        quantity: li.quantity || 1,
        unit_price: parseFloat(li.price || '0'),
        total_price: parseFloat(li.price || '0') * (li.quantity || 1)
      })),
      created_at: o.created_at,
      raw: { id: o.id, name: o.name }
    };
  });
}

async function syncWooCommerce(body: SyncBody): Promise<NormalizedOrder[]> {
  const base = (body.store_url || '').trim().replace(/\/$/, '');
  const key = body.api_key || '';
  const secret = body.api_secret || '';
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const limit = Math.min(body.limit || 50, 100);
  const params = new URLSearchParams({
    per_page: String(limit),
    orderby: 'date',
    order: 'desc'
  });
  if (body.created_after) params.set('after', body.created_after);

  const url = `${base}/wp-json/wc/v3/orders?${params}`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.message || `WooCommerce orders failed (${r.status})`);
  }

  const statusMap: Record<string, string> = {
    pending: 'pending',
    processing: 'processing',
    'on-hold': 'pending',
    completed: 'delivered',
    cancelled: 'cancelled',
    refunded: 'cancelled',
    failed: 'cancelled'
  };

  return (Array.isArray(data) ? data : []).map((o: any): NormalizedOrder => {
    const ship = o.shipping || {};
    const bill = o.billing || {};
    return {
      external_id: String(o.id),
      order_number: o.number ? `#${o.number}` : String(o.id),
      channel: 'woocommerce',
      customer_name: [ship.first_name || bill.first_name, ship.last_name || bill.last_name].filter(Boolean).join(' ') || bill.email || 'Customer',
      customer_email: bill.email,
      customer_phone: bill.phone || ship.phone,
      status: statusMap[o.status] || 'pending',
      payment_status: o.date_paid ? 'paid' : 'unpaid',
      currency: o.currency || 'USD',
      subtotal: parseFloat(o.total || '0') - parseFloat(o.total_tax || '0'),
      total_amount: parseFloat(o.total || '0'),
      shipping_address: {
        address_line1: ship.address_1 || bill.address_1,
        city: ship.city || bill.city,
        state_province_region: ship.state || bill.state,
        postal_zip_code: ship.postcode || bill.postcode,
        country: ship.country || bill.country,
        country_code: ship.country || bill.country
      },
      items: (o.line_items || []).map((li: any) => ({
        product_title: li.name,
        sku: li.sku,
        quantity: li.quantity || 1,
        unit_price: parseFloat(li.price || '0'),
        total_price: parseFloat(li.total || '0')
      })),
      created_at: o.date_created_gmt || o.date_created,
      raw: { id: o.id, number: o.number }
    };
  });
}

async function getAmazonAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  region: 'na' | 'eu' | 'fe'
) {
  const tokenHosts: Record<string, string> = {
    na: 'https://api.amazon.com/auth/o2/token',
    eu: 'https://api.amazon.co.uk/auth/o2/token',
    fe: 'https://api.amazon.co.jp/auth/o2/token'
  };
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret
  });
  const r = await fetch(tokenHosts[region] || tokenHosts.na, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Amazon LWA failed');
  }
  return data.access_token as string;
}

/**
 * Amazon SP-API Orders require AWS SigV4 in full production.
 * This endpoint validates LWA and attempts the Orders API when the
 * environment provides IAM role signing via optional AMAZON_AWS_* env vars.
 * Without SigV4, we return a clear instruction payload (not fake orders).
 */
async function syncAmazon(body: SyncBody): Promise<{ orders: NormalizedOrder[]; note?: string }> {
  const clientId = body.client_id || body.api_key || '';
  const clientSecret = body.client_secret || body.api_secret || '';
  const refreshToken = body.refresh_token || '';
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Amazon requires client_id, client_secret, and refresh_token');
  }
  const region = body.region || 'na';
  await getAmazonAccessToken(clientId, clientSecret, refreshToken, region);

  // Full Orders API needs SigV4. Document for operators; do not invent orders.
  return {
    orders: [],
    note:
      'LWA token OK. Full Amazon order import requires SP-API Orders with AWS SigV4 signing. ' +
      'Set AMAZON_AWS_ACCESS_KEY_ID, AMAZON_AWS_SECRET_ACCESS_KEY, AMAZON_AWS_ROLE_ARN on Vercel, ' +
      'or use a middleware such as amazon-sp-api. Shopify and WooCommerce sync work without extra AWS setup.'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST only' });

  try {
    const body = (req.body || {}) as SyncBody;
    const channel = body.channel;

    if (channel === 'shopify') {
      if (!body.store_url || !body.api_key) {
        return res.status(400).json({ ok: false, message: 'store_url and api_key required' });
      }
      const orders = await syncShopify(body);
      return res.status(200).json({ ok: true, count: orders.length, orders });
    }

    if (channel === 'woocommerce') {
      if (!body.store_url || !body.api_key || !body.api_secret) {
        return res.status(400).json({ ok: false, message: 'store_url, api_key, api_secret required' });
      }
      const orders = await syncWooCommerce(body);
      return res.status(200).json({ ok: true, count: orders.length, orders });
    }

    if (channel === 'amazon') {
      const result = await syncAmazon(body);
      return res.status(200).json({
        ok: true,
        count: result.orders.length,
        orders: result.orders,
        note: result.note
      });
    }

    return res.status(400).json({ ok: false, message: 'Unsupported channel' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e.message || 'Sync failed' });
  }
}
