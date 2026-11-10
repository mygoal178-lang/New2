# ORDERFLOW — Premium E-commerce Order Management SaaS

> **Commercial Resale Edition · Target Valuation: $3,000 USD**  
> Turnkey Multi-Tenant SaaS Asset designed for Social Sellers, Online Retailers, and E-commerce Agencies.

---

## 🚀 Product Overview

**OrderFlow** is a production-grade, commercially transferable B2B SaaS platform architected to solve the operational chaos of social commerce and emerging market retail operations (specifically tailored for Bangladesh with Cash-on-Delivery, BDT currency, and local couriers, with full international multi-currency configurability).

### Key Modules:
1. **Order Pipeline & Dispatch Management:** 8 distinct status stages (`Pending`, `Confirmed`, `Processing`, `Ready to Ship`, `Shipped`, `Delivered`, `Cancelled`, `Returned`) with visual timeline tracking.
2. **Transactional Inventory Safeguards:** Prevents overselling. Automatically deducts warehouse stock on order creation, and **atomically restores stock** when parcels are cancelled or returned.
3. **Bangladeshi & Global Couriers:** Modular adapter framework supporting **Pathao Courier**, **Steadfast Courier**, **RedX**, and **Paperfly Go** with graceful manual mode fallback.
4. **Customer Relationship Management (CRM):** Customer lifetime value, order frequency, VIP classification, and delivery address book.
5. **Strict Double-Entry Profit & Loss (P&L):** Distinguishes between gross booked sales, uncollected in-transit COD, and true realized cash, deducting COGS and recorded expenses.
6. **One-Click Tax & VAT Invoices:** Professional printable PDF invoices with shop logo, BIN/VAT number, line items, and merchant terms.
7. **Expense Ledger:** Categorizes marketing ad spend, packaging costs, warehouse rent, and salaries to accurately compute net profit.
8. **Multi-Tenant Workspaces & RBAC:** Complete data isolation across separate stores, with configurable roles (`Owner`, `Admin`, `Manager`, `Staff`).
9. **White-Label Control Center:** Rebrand the entire platform (app name, colors, logos, currency, invoice notes) in seconds.
10. **SaaS Subscription Tiering:** Built-in plan limits (`Free`, `Starter` at $9/mo, `Pro` at $19/mo) and monthly order quota meters.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript (Strict), Vite 8, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend / Database:** PostgreSQL via Supabase with Row Level Security (RLS)
- **Persistence Engine:** Dual-mode architecture (Direct Supabase client queries when credentials provided + Reactive in-memory / LocalStorage state store for instant preview and demo mode)
- **Hosting / Serverless:** Vercel (Edge-ready) / Node.js Express

---

## 📦 Getting Started & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Supabase credentials (optional for demo mode):
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view OrderFlow.

---

## 🗄️ Database Setup & SQL Migrations

OrderFlow includes complete PostgreSQL migrations located in `/supabase/migrations/`:
- `20250101000000_orderflow_schema.sql`: Complete DDL for 19 tables, indexes, custom ENUM types, and Row Level Security (RLS) policies.
- `20250101000001_seed_data.sql`: Ready-to-use seed data for instant testing.

To apply:
1. Open your Supabase Dashboard.
2. Navigate to **SQL Editor**.
3. Paste and run `20250101000000_orderflow_schema.sql`.

---

## 🌐 Vercel Production Deployment

1. Push this repository to GitHub.
2. Connect your repo in [Vercel](https://vercel.com).
3. Framework: **Vite**, Build Command: `npm run build`, Output Directory: `dist`.
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy! OrderFlow will be live with automatic global CDN and SSL.

---

## 📄 License & Commercial Acquisition

This repository is prepared for commercial resale and asset transfer. Upon acquisition, the buyer receives 100% full, unencumbered rights to the source code, branding assets, database schemas, and documentation.
