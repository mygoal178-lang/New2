# Bangladesh Courier & Delivery Integrations Architecture

OrderFlow provides a modular courier adapter framework specifically architected for the Bangladeshi e-commerce logistics ecosystem.

---

## 1. Supported Providers

### A. Pathao Courier (Developer Portal)
- **Official Portal:** [https://merchant.pathao.com](https://merchant.pathao.com)
- **Authentication Method:** OAuth 2.0 Bearer Token / API Client Credentials.
- **Required Configuration:**
  - `client_id` (from Pathao Merchant Dashboard)
  - `client_secret`
  - `store_id` (Default pickup warehouse ID)
  - `username` & `password`
- **Key API Endpoints:**
  - Order Creation: `POST /aladdin/api/v1/orders`
  - Cost Calculation: `POST /aladdin/api/v1/merchant/price-plan`
  - Parcel Tracking: `GET /aladdin/api/v1/orders/{consignment_id}/info`

### B. Steadfast Courier
- **Official Portal:** [https://steadfast.com.bd](https://steadfast.com.bd)
- **Authentication Method:** API Key & Secret Key header.
- **Required Configuration:**
  - `api_key`
  - `secret_key`
- **Key API Endpoints:**
  - Create Order: `POST /api/v1/create_order`
  - Delivery Status: `GET /api/v1/status_by_cid/{consignment_id}`
  - Check Balance: `GET /api/v1/get_balance`

### C. RedX Logistics
- **Official Portal:** [https://redx.com.bd](https://redx.com.bd)
- **Authentication Method:** Bearer Token.
- **Required Configuration:**
  - `access_token`
- **Key API Endpoints:**
  - Create Parcel: `POST /v1.0.0-beta/parcels`
  - Tracking: `GET /v1.0.0-beta/parcels/track/{tracking_id}`

### D. Paperfly Go
- **Official Portal:** [https://paperfly.com.bd](https://paperfly.com.bd)
- **Authentication Method:** Basic Auth / API Key credentials.
- **Required Configuration:**
  - `merchant_code`
  - `api_key`

---

## 2. Graceful Manual Mode Fallback

When merchant credentials are not yet entered or in verification phase:
- Merchants can still generate manual courier orders, enter tracking IDs, and manage COD collection and return reconciliation without API errors.
- Real-time indicator visibly displays status: **Connected**, **Not Configured**, or **Manual Mode**.
