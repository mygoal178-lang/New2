/**
 * Client helpers for production channel integrations.
 * Calls Vercel serverless routes under /api/integrations/*
 * Credentials are sent only to your own backend — never log them.
 */

export type IntegrationChannel = 'shopify' | 'woocommerce' | 'amazon' | 'ebay' | 'etsy';

export interface ChannelCredentials {
  channel: IntegrationChannel;
  store_url?: string;
  api_key?: string;
  api_secret?: string;
  /** Amazon LWA */
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  marketplace_id?: string;
  region?: 'na' | 'eu' | 'fe';
}

export interface NormalizedChannelOrder {
  external_id: string;
  order_number: string;
  channel: string;
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
}

export interface TestConnectionResult {
  ok: boolean;
  message: string;
  meta?: Record<string, unknown>;
  status?: number;
}

export interface SyncOrdersResult {
  ok: boolean;
  count: number;
  orders: NormalizedChannelOrder[];
  message?: string;
  note?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && data?.ok === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function testChannelConnection(
  creds: ChannelCredentials
): Promise<TestConnectionResult> {
  if (creds.channel === 'ebay' || creds.channel === 'etsy') {
    return {
      ok: false,
      message: `${creds.channel} production connector is not enabled yet. Use Shopify, WooCommerce, or Amazon.`
    };
  }
  return postJson<TestConnectionResult>('/api/integrations/test', creds);
}

export async function syncChannelOrders(
  creds: ChannelCredentials &
    { created_after?: string; limit?: number }
): Promise<SyncOrdersResult> {
  if (creds.channel === 'ebay' || creds.channel === 'etsy') {
    return {
      ok: false,
      count: 0,
      orders: [],
      message: `${creds.channel} production sync is not enabled yet.`
    };
  }
  return postJson<SyncOrdersResult>('/api/integrations/sync', creds);
}

/** localStorage key for per-integration credentials (demo/tenant local only) */
const CREDS_KEY = 'orderflow_channel_creds_v1';

export function saveChannelCredentials(
  integrationId: string,
  creds: ChannelCredentials
): void {
  try {
    const all = loadAllChannelCredentials();
    // Never persist secrets in production long-term without encryption.
    // This enables reconnect/sync in the SPA demo + early production.
    all[integrationId] = {
      channel: creds.channel,
      store_url: creds.store_url,
      api_key: creds.api_key,
      api_secret: creds.api_secret,
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      marketplace_id: creds.marketplace_id,
      region: creds.region
    };
    localStorage.setItem(CREDS_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
}

export function loadChannelCredentials(
  integrationId: string
): ChannelCredentials | null {
  const all = loadAllChannelCredentials();
  return all[integrationId] || null;
}

function loadAllChannelCredentials(): Record<string, ChannelCredentials> {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function clearChannelCredentials(integrationId: string): void {
  try {
    const all = loadAllChannelCredentials();
    delete all[integrationId];
    localStorage.setItem(CREDS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
