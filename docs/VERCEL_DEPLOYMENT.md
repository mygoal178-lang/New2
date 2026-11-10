# Vercel Deployment & Production Setup Guide

This guide walks through deploying **OrderFlow** to Vercel and connecting a Supabase backend in under 10 minutes.

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Choose your preferred region (e.g. `Singapore (ap-southeast-1)` for South Asia & Bangladesh).
3. Set a strong database password.
4. Navigate to **SQL Editor** in the Supabase Dashboard.
5. Copy and execute the contents of `supabase/migrations/20250101000000_orderflow_schema.sql`.
6. *(Optional)* Run `supabase/migrations/20250101000001_seed_data.sql` to populate sample data.

---

## Step 2: Retrieve Supabase API Credentials

1. In Supabase Dashboard, go to **Project Settings** > **API**.
2. Note your **Project URL** (e.g. `https://xyzprojectid.supabase.co`).
3. Note your **anon / public** API key.

---

## Step 3: Deploy to Vercel

1. Push this repository to GitHub.
2. Sign in to [https://vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
8. Click **Deploy**.

---

## Step 4: Custom Domain & Verification

1. In Vercel Project Settings > **Domains**, add your custom domain (e.g. `orderflow.app` or `app.yourbrand.com`).
2. Configure DNS records (CNAME or A records) with your registrar.
3. Test authentication, order creation, courier configuration, and invoice printing in production.
