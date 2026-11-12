# Channel Integrations (Production)

OrderFlow can pull orders from **Shopify**, **WooCommerce**, and **Amazon** via serverless APIs:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/integrations/test` | Validate credentials |
| `POST /api/integrations/sync` | Import recent orders (normalized) |

The **Integrations** page in the app calls these routes. Credentials are sent only to your Vercel backend for that request.

---

## Shopify

1. Shopify Admin → **Settings → Apps and sales channels → Develop apps**
2. **Create an app** → Configure Admin API scopes:
   - `read_orders`
   - `read_products` (optional)
   - `read_inventory` (optional)
3. **Install app** → copy **Admin API access token** (`shpat_...`)
4. In OrderFlow Integrations → **Connect Store API**:
   - Store domain: `your-store.myshopify.com`
   - API key: the access token
5. **Authorize & Connect** → then **Sync Orders**

---

## WooCommerce

1. WordPress → **WooCommerce → Settings → Advanced → REST API**
2. **Add key** → description e.g. `OrderFlow` → permissions **Read**
3. Copy **Consumer key** + **Consumer secret**
4. In OrderFlow:
   - Store URL: `https://yoursite.com` (no trailing slash issues OK)
   - API key: consumer key
   - API secret: consumer secret
5. Connect → Sync Orders

Ensure permalinks are not "Plain" so `/wp-json/wc/v3/` works.

---

## Amazon (SP-API)

Amazon is stricter:

1. [Seller Central](https://sellercentral.amazon.com) → **Apps & Services → Develop Apps to Access Selling Partner APIs**
2. Register an app → get **LWA client id**, **client secret**, and complete OAuth to obtain a **refresh token**
3. Request roles: **Orders** (and Inventory if needed)
4. In OrderFlow connect form use:
   - Client ID
   - Client secret
   - Refresh token
   - Region: `na` | `eu` | `fe`
   - Marketplace ID (US default `ATVPDKIKX0DER`)

**Note:** Full order download also needs **AWS IAM SigV4** signing for SP-API.  
`/api/integrations/test` validates LWA token issuance.  
`/api/integrations/sync` for Amazon returns a setup note until AWS signing keys are configured on Vercel:

```
AMAZON_AWS_ACCESS_KEY_ID=
AMAZON_AWS_SECRET_ACCESS_KEY=
AMAZON_AWS_ROLE_ARN=
```

Shopify and WooCommerce do **not** need those variables.

---

## Security notes

- Prefer storing channel secrets in **Supabase Vault** or encrypted columns, not browser `localStorage`, for multi-user production.
- Restrict Vercel deploy previews from using production tokens.
- Never commit `shpat_`, Woo consumer secrets, or Amazon refresh tokens to git.

---

## Deploy

1. Merge this branch and redeploy on Vercel.
2. No extra env vars required for Shopify / WooCommerce.
3. Open **Channel Integrations** in the live app and connect a real store.
