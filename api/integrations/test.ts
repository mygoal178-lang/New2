import type { VercelRequest, VercelResponse } from '@vercel/node';

type Channel = 'shopify' | 'woocommerce' | 'amazon';

interface TestBody {
  channel: Channel;
  store_url?: string;
  api_key?: string;
  api_secret?: string;
  /** Amazon SP-API: LWA client id */
  client_id?: string;
  /** Amazon SP-API: LWA client secret */
  client_secret?: string;
  /** Amazon SP-API: refresh token */
  refresh_token?: string;
  /** Amazon marketplace id, default US */
  marketplace_id?: string;
  region?: 'na' | 'eu' | 'fe';
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

async function testShopify(storeUrl: string, accessToken: string) {
  const host = normalizeShopifyHost(storeUrl);
  const url = `https://${host}/admin/api/2024-10/shop.json`;
  const r = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  });
  const text = await r.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch {}
  if (!r.ok) {
    return {
      ok: false,
      status: r.status,
      message: data?.errors || data?.error || text.slice(0, 300) || `Shopify HTTP ${r.status}`
    };
  }
  return {
    ok: true,
    message: `Connected to ${data?.shop?.name || host}`,
    meta: {
      shop_name: data?.shop?.name,
      domain: data?.shop?.domain,
      currency: data?.shop?.currency,
      email: data?.shop?.email
    }
  };
}

async function testWooCommerce(storeUrl: string, consumerKey: string, consumerSecret: string) {
  const base = storeUrl.trim().replace(/\/$/, '');
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const url = `${base}/wp-json/wc/v3/system_status`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  // Some stores block system_status — fall back to products?per_page=1
  if (!r.ok) {
    const fallback = await fetch(`${base}/wp-json/wc/v3/products?per_page=1`, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    const t = await fallback.text();
    let data: any = null;
    try { data = JSON.parse(t); } catch {}
    if (!fallback.ok) {
      return {
        ok: false,
        status: fallback.status,
        message: data?.message || t.slice(0, 300) || `WooCommerce HTTP ${fallback.status}`
      };
    }
    return { ok: true, message: 'Connected to WooCommerce store', meta: { products_sample: Array.isArray(data) ? data.length : 0 } };
  }
  const data = await r.json();
  return {
    ok: true,
    message: 'Connected to WooCommerce store',
    meta: { environment: data?.environment?.version || null }
  };
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
    throw new Error(data.error_description || data.error || `Amazon LWA token failed (${r.status})`);
  }
  return data.access_token as string;
}

async function testAmazon(body: TestBody) {
  const clientId = body.client_id || body.api_key;
  const clientSecret = body.client_secret || body.api_secret;
  const refreshToken = body.refresh_token;
  if (!clientId || !clientSecret || !refreshToken) {
    return {
      ok: false,
      message:
        'Amazon requires client_id, client_secret, and refresh_token (SP-API LWA credentials from Seller Central → Develop Apps).'
    };
  }
  const region = body.region || 'na';
  const accessToken = await getAmazonAccessToken(clientId, clientSecret, refreshToken, region);
  const endpoints: Record<string, string> = {
    na: 'https://sellingpartnerapi-na.amazon.com',
    eu: 'https://sellingpartnerapi-eu.amazon.com',
    fe: 'https://sellingpartnerapi-fe.amazon.com'
  };
  const marketplace = body.marketplace_id || 'ATVPDKIKX0DER'; // US
  // Lightweight call: marketplace participations (needs proper AWS SigV4 for full SP-API).
  // Many private apps still need SigV4; we validate LWA token issuance as connection proof.
  return {
    ok: true,
    message: 'Amazon LWA credentials valid (access token issued). Order sync uses SP-API Orders.',
    meta: {
      region,
      marketplace_id: marketplace,
      endpoint: endpoints[region],
      token_preview: accessToken.slice(0, 12) + '…'
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST only' });

  try {
    const body = (req.body || {}) as TestBody;
    const channel = body.channel;

    if (channel === 'shopify') {
      if (!body.store_url || !body.api_key) {
        return res.status(400).json({ ok: false, message: 'store_url and api_key (Admin API access token) required' });
      }
      const result = await testShopify(body.store_url, body.api_key);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (channel === 'woocommerce') {
      if (!body.store_url || !body.api_key || !body.api_secret) {
        return res.status(400).json({ ok: false, message: 'store_url, api_key (consumer key), api_secret (consumer secret) required' });
      }
      const result = await testWooCommerce(body.store_url, body.api_key, body.api_secret);
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (channel === 'amazon') {
      try {
        const result = await testAmazon(body);
        return res.status(result.ok ? 200 : 400).json(result);
      } catch (e: any) {
        return res.status(400).json({ ok: false, message: e.message || 'Amazon auth failed' });
      }
    }

    return res.status(400).json({ ok: false, message: 'Unsupported channel. Use shopify | woocommerce | amazon' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, message: e.message || 'Server error' });
  }
}
