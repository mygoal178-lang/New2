# ORDERFLOW — Commercial SaaS Handover Package & Asset Dossier

**Target Valuation / Asking Price:** $3,000 USD  
**Asset Category:** B2B Multi-Tenant E-Commerce Order Management SaaS  
**Primary Target Market:** Bangladesh (Social Commerce, Facebook/Instagram Merchants, Independent Online Retailers)  
**Secondary Market:** Global Emerging Markets (COD & Multi-Currency Support)

---

## 1. Executive Summary & Asset Overview

OrderFlow is a production-ready, fully turnkey multi-tenant SaaS platform built to solve the chaotic operations of social sellers and online merchants. Online commerce in high-growth markets relies heavily on Cash-on-Delivery (COD), multiple messaging channels (Facebook Messenger, WhatsApp, Instagram DM), phone call verifications, and fragmented courier dispatching (Pathao, Steadfast, RedX, Paperfly).

OrderFlow consolidates:
1. **Multi-Channel Order Intake & Status Lifecycle Tracking**
2. **Real-time Inventory Management & Variant Tracking with Stock Safeguards**
3. **Automated Stock Restoration on Cancelled/Returned Parcels**
4. **Bangladeshi & Global Courier Shipping Dispatchers (Pathao, Steadfast, RedX, Paperfly)**
5. **Customer Relationship Management (CRM) with Purchase History & VIP Categorization**
6. **Automated Tax/VAT Compliant Invoicing with One-Click PDF/Print Generation**
7. **Expense & Cost of Goods Sold (COGS) Ledger for Real Net Profit Calculation**
8. **Multi-Tenant Workspaces with Role-Based Access Control (Owner, Admin, Manager, Staff)**
9. **White-Label & Custom Branding Engine for Immediate Rebranding by the Acquirer**

---

## 2. Technology Stack & Architectural Integrity

| Layer | Technology | Rationale & Enterprise Standards |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript (Strict) | Maximum performance, zero runtime type errors, maintainable codebase |
| **Build Tooling** | Vite 8 + ESNext | Lightning-fast development and optimized production asset bundles |
| **Styling & Design System** | Tailwind CSS v4 + Plus Jakarta Sans + JetBrains Mono | Modern Stripe/Linear aesthetic, dark/light theme support, zero-pill discipline |
| **State & Business Logic** | Centralized Reactive Store + Dual-Mode Persistence | Immediate interactive offline/demo mode with persistent local storage, plus direct Supabase client bindings |
| **Database & Auth** | PostgreSQL via Supabase + Row Level Security (RLS) | Bank-grade multi-tenant data isolation, zero data cross-leakage |
| **Analytics & Visuals** | Recharts Data Visualization | Responsive P&L breakdowns, revenue vs expenses, order status distribution |
| **Deployment Target** | Vercel (Edge-ready) / Cloud Run / Node.js Express | Single-click zero-downtime deployment |

---

## 3. Commercial Transfer Checklist for the Buyer

1. **Source Code & Repository Access:** Full unrestricted ownership of all React source code, database migration scripts, configuration files, and documentation.
2. **Supabase Database Migration:** Apply `supabase/migrations/20250101000000_orderflow_schema.sql` to your Supabase project in one click.
3. **Vercel One-Click Deployment:** Connect GitHub repository, populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and trigger production deployment.
4. **Rebranding:** Customize `app_name`, logos, support contacts, primary color hex, and currency defaults via the in-app White-Label Center or `INITIAL_WHITE_LABEL` config.
5. **Payment Gateway Integration:** Ready for Stripe Checkout or Bangladeshi payment gateways (SSLCommerz, bKash Merchant API, Shurjopay).
6. **Courier Merchant Accounts:** Input merchant API keys for Pathao, Steadfast, RedX, and Paperfly in the Courier Management tab.

---

## 4. Operational Cost Breakdown (Scale-to-Zero Friendly)

- **Database & Auth (Supabase):** Free Tier ($0/month up to 500MB database, 50,000 monthly active users). Pro tier ($25/mo) when scaling.
- **Frontend Hosting (Vercel):** Free Hobby Tier ($0/month) or Pro ($20/mo) for custom domains and edge acceleration.
- **Domain & SSL:** ~$12/year (Free automatic SSL via Vercel).
- **Estimated Monthly Burn to Run:** $0 - $25/month.
- **Gross Profit Margin at $9 - $19/mo per subscriber:** >90%.

---

*Prepared by OrderFlow Engineering & SaaS Architecture Team.*
