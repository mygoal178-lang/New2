import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Shield,
  Layers,
  Database,
  Cloud,
  CheckCircle2,
  Sparkles,
  Terminal,
  BookOpen,
  Truck
} from 'lucide-react';

export const HandoverView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const sqlSchemaSnippet = `-- PostgreSQL Multi-Tenant Schema with RLS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'BDT',
  currency_symbol TEXT NOT NULL DEFAULT '৳',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace Members Only"
  ON public.orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.business_members
    WHERE business_id = orders.business_id AND user_id = auth.uid()
  ));`;

  return (
    <div className="space-y-6">
      {/* Handover Hero Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Turnkey Commercial SaaS Asset · Asking Price: $3,000 USD
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              OrderFlow Commercial Handover & Transfer Hub
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Complete documentation, database migration scripts, environment configurations, and deployment playbooks for the new SaaS owner or acquiring company.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Asset Target Valuation</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">$3,000 USD</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">100% Transferable Codebase</span>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Commercial Transfer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Database & RLS</span>
          </div>
          <p className="text-slate-500 mt-1.5">
            19 PostgreSQL tables with complete foreign keys, UUIDs, indexes, and Row Level Security policies.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Cloud className="w-4 h-4 text-blue-600" />
            <span>Zero-Cost Serverless</span>
          </div>
          <p className="text-slate-500 mt-1.5">
            Scales to zero on Vercel and Supabase Free Tier ($0/mo operating cost until high scale).
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Bangladeshi Couriers</span>
          </div>
          <p className="text-slate-500 mt-1.5">
            Pre-wired adapter framework for Pathao, Steadfast, RedX, and Paperfly with graceful manual fallback.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>White-Label Ready</span>
          </div>
          <p className="text-slate-500 mt-1.5">
            Instant rebranding via White-Label Center: update logos, brand colors, app name, and currency in seconds.
          </p>
        </div>
      </div>

      {/* SQL Migration Script Viewer */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              Supabase SQL Migration File: 20250101000000_orderflow_schema.sql
            </h2>
            <p className="text-slate-500 mt-0.5">
              Execute this script in Supabase SQL Editor to provision all tables, indexes, and RLS policies.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(sqlSchemaSnippet, 'sql')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copiedSection === 'sql' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Migration</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
          <pre>{sqlSchemaSnippet}</pre>
        </div>
      </div>

      {/* Acquisition Checklist & Transfer Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Checklist */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            15-Point Buyer Transfer Checklist
          </h2>
          <div className="space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">✓ 1. Full React 19 + TypeScript production source code</div>
            <div className="flex items-center gap-2">✓ 2. GitHub repository ownership transfer</div>
            <div className="flex items-center gap-2">✓ 3. Complete Supabase SQL migrations (19 tables + RLS)</div>
            <div className="flex items-center gap-2">✓ 4. Vercel deployment configuration (`vercel.json`)</div>
            <div className="flex items-center gap-2">✓ 5. Environment variables documentation (`.env.example`)</div>
            <div className="flex items-center gap-2">✓ 6. Bangladeshi Courier documentation (Pathao, Steadfast, RedX, Paperfly)</div>
            <div className="flex items-center gap-2">✓ 7. Multi-tenant workspace data isolation verified</div>
            <div className="flex items-center gap-2">✓ 8. Automatic stock deduction & cancellation restoration</div>
            <div className="flex items-center gap-2">✓ 9. Strict double-entry P&L profit calculation</div>
            <div className="flex items-center gap-2">✓ 10. Printable tax invoice engine with zero mock dependencies</div>
            <div className="flex items-center gap-2">✓ 11. White-label rebranding control center</div>
            <div className="flex items-center gap-2">✓ 12. Full-featured demonstration workspace with 50 orders</div>
            <div className="flex items-center gap-2">✓ 13. Mobile touch-optimized responsive layout</div>
            <div className="flex items-center gap-2">✓ 14. Zero external hardcoded credentials or developer locks</div>
            <div className="flex items-center gap-2">✓ 15. Operational cost analysis ($0-$25/mo running cost)</div>
          </div>
        </div>

        {/* Deployment Steps */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            New Owner 10-Minute Deployment
          </h2>
          <ol className="space-y-2.5 text-slate-600 dark:text-slate-400 list-decimal pl-4">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Create Supabase Project:</strong> Go to supabase.com and launch a new PostgreSQL database in Singapore (ap-southeast-1).
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Run SQL Migration:</strong> Paste `supabase/migrations/20250101000000_orderflow_schema.sql` into SQL Editor and click Run.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Deploy to Vercel:</strong> Import GitHub repo to Vercel, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, click Deploy.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Attach Custom Domain:</strong> Add your domain (e.g., `orderflow.app`) in Vercel DNS settings.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">Connect Couriers:</strong> Input your merchant keys in Courier settings or operate in manual dispatch mode.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
