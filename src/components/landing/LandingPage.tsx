import React, { useState } from 'react';
import { WhiteLabelConfig } from '../../types';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../services/i18n';
import { formatCurrency, convertCurrency } from '../../services/currency';
import {
  Package,
  Truck,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronDown,
  Clock,
  DollarSign,
  Users,
  Smartphone,
  Globe,
  Share2,
  Percent,
  Check
} from 'lucide-react';

interface LandingPageProps {
  whiteLabel: WhiteLabelConfig;
  onEnterApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  whiteLabel,
  onEnterApp,
  onOpenAuth
}) => {
  const { currentLanguage, setLanguage, t, isRtl } = useI18n();
  const [billingCurrency, setBillingCurrency] = useState<string>('USD');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Pricing calculations
  const getPrice = (usdAmount: number) => {
    if (usdAmount === 0) return formatCurrency(0, billingCurrency);
    const converted = convertCurrency(usdAmount, 'USD', billingCurrency);
    return formatCurrency(converted, billingCurrency);
  };

  const faqs = [
    {
      q: 'Can OrderFlow be used by online stores outside of Bangladesh?',
      a: 'Yes. OrderFlow is an international SaaS platform. Every workspace configures its own default country, ISO 4217 currency (USD, EUR, GBP, CAD, AUD, JPY, BDT, INR, etc.), timezone, address formatting, tax/VAT calculation, and measurement system (metric or imperial).'
    },
    {
      q: 'Which eCommerce sales channels and couriers are integrated?',
      a: 'OrderFlow connects to Shopify, WooCommerce, Amazon Marketplace, eBay, and social commerce DMs (Instagram/Facebook/WhatsApp). For fulfillment, it integrates with global carriers like DHL Express, FedEx, UPS, USPS, Royal Mail, Australia Post, Aramex, as well as regional couriers like Pathao and Steadfast with automated parcel tracking URLs.'
    },
    {
      q: 'How does OrderFlow calculate actual net profit across multiple currencies?',
      a: 'OrderFlow enforces strict double-entry realization: Realized Gross Revenue (settled and delivered orders) minus Cost of Goods Sold (supplier purchase cost) minus recorded Operating Expenses (advertising, packaging, logistics, payroll). Historical orders retain exchange rate snapshots so past tax filings remain accurate.'
    },
    {
      q: 'Does OrderFlow support local tax compliance (VAT, GST, Sales Tax)?',
      a: 'Yes. Merchants can configure tax names (VAT, GST, Sales Tax, MwSt, IVA), specific tax percentages, tax identification numbers (BIN, VAT ID), and toggle between price-inclusive and price-exclusive calculation modes.'
    },
    {
      q: 'Can I acquire, rebrand, and resell this entire software application?',
      a: 'Yes! OrderFlow is built as a commercial resale software asset. The entire application includes a centralized White-Label Center, independent PostgreSQL migrations, zero hardcoded vendor dependencies, and is ready for Vercel/Cloud deployment.'
    },
    {
      q: 'Is customer data protected under international privacy regulations like GDPR?',
      a: 'Yes. OrderFlow includes built-in GDPR Article 20 data portability (full JSON store exports) and Article 17 right-to-erasure workflows that anonymize private customer data while preserving accounting integrity for audits.'
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0">
              {whiteLabel.app_name}
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded font-mono">
              Global SaaS
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="#channels" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">
              Integrations
            </a>
            <a href="#markets" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">
              Global Markets
            </a>
            <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">
              Pricing Plans
            </a>
            <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Actions & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">{currentLangObj.flag} {currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Language:
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {currentLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={onEnterApp}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Launch Live App
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>International E-Commerce Order Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15] max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
            Manage Your Entire Online Business in One Place.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Centralize orders, warehouse inventory, multi-carrier parcel dispatch, customer CRM, and realized P&L profit across global sales channels.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Live Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Sign In to Store
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DHL, FedEx, UPS & Royal Mail
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ISO 4217 Multi-Currency
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VAT / GST Tax Invoices
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 11 Global Languages & RTL
            </span>
          </div>
        </div>

        {/* 3. PRODUCT DASHBOARD PREVIEW SIMULATOR */}
        <div className="max-w-6xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
              <span className="ml-2 font-mono text-slate-400">app.orderflow.io/dashboard</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Global Dispatch Engine Active
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-950/40 text-left">
            {/* Metric Preview 1 */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Realized Global Revenue</div>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$38,450.00</div>
              <div className="mt-1 text-[11px] text-slate-400">Settled orders across US, UK & EU</div>
            </div>

            {/* Metric Preview 2 */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">In-Transit Fulfillment</div>
              <div className="mt-1 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">142 Parcels</div>
              <div className="mt-1 text-[11px] text-slate-400">DHL, FedEx, UPS & Royal Mail live tracking</div>
            </div>

            {/* Metric Preview 3 */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Actual Net Operational Margin</div>
              <div className="mt-1 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">31.4%</div>
              <div className="mt-1 text-[11px] text-slate-400">After COGS, VAT & operating expenses</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CHANNELS & INTEGRATIONS */}
      <section id="channels" className="py-16 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
              Unified Multi-Channel eCommerce
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sell across global storefronts, social platforms, and regional marketplaces with real-time inventory synchronization.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs font-semibold">
            {['Shopify', 'WooCommerce', 'Amazon', 'eBay', 'Instagram Shop', 'TikTok Shop'].map((channel) => (
              <div key={channel} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col items-center justify-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-800 dark:text-slate-200">{channel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TARGET MARKETS & GLOBAL COVERAGE */}
      <section id="markets" className="py-16 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
              Engineered For Merchants Across 50+ Countries
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Zero hardcoded borders. Fully configurable currencies, phone dialing codes, and regional logistics.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-4xl mx-auto text-xs">
            {[
              { flag: '🇺🇸', name: 'United States' },
              { flag: '🇬🇧', name: 'United Kingdom' },
              { flag: '🇨🇦', name: 'Canada' },
              { flag: '🇦🇺', name: 'Australia' },
              { flag: '🇩🇪', name: 'Germany' },
              { flag: '🇫🇷', name: 'France' },
              { flag: '🇳🇱', name: 'Netherlands' },
              { flag: '🇯🇵', name: 'Japan' },
              { flag: '🇰🇷', name: 'South Korea' },
              { flag: '🇸🇬', name: 'Singapore' },
              { flag: '🇦🇪', name: 'United Arab Emirates' },
              { flag: '🇸🇦', name: 'Saudi Arabia' },
              { flag: '🇮🇳', name: 'India' },
              { flag: '🇧🇩', name: 'Bangladesh' },
              { flag: '🇧🇷', name: 'Brazil' },
              { flag: '🇲🇽', name: 'Mexico' }
            ].map((country) => (
              <span
                key={country.name}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 shadow-xs"
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING PLANS */}
      <section id="pricing" className="py-20 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
              Transparent Global Pricing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              No hidden fees. Scale as your international fulfillment volume expands.
            </p>

            {/* Currency Switcher */}
            <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1">Display currency:</span>
              {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'BDT'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setBillingCurrency(curr)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    billingCurrency === curr
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Free Starter</span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-3">
                  {getPrice(0)}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For new merchants validating first product launches.</p>
                <div className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 50 orders / month</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 20 catalog products</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Standard Customer CRM</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tax & VAT Invoicing</div>
                </div>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-8 w-full py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Start Free
              </button>
            </div>

            {/* Starter */}
            <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-lg relative">
              <span className="absolute -top-3 right-6 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full">
                Most Popular
              </span>
              <div>
                <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Growing Merchant</span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-3">
                  {getPrice(9)}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For active direct-to-consumer and social stores.</p>
                <div className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 500 orders / month</div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited products & variants</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Multi-Carrier Shipping Tracking</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 5 Staff Seats with RBAC</div>
                </div>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Launch Growing Plan
              </button>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">Pro Enterprise</span>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-3">
                  {getPrice(19)}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">For high-throughput multichannel brands.</p>
                <div className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 10,000+ orders / month</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Team Accounts</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Full Multichannel Sync</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Full White-Label Rebranding</div>
                </div>
              </div>
              <button
                onClick={onEnterApp}
                className="mt-8 w-full py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Launch Pro Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers regarding internationalization, currencies, carriers, and acquisition.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-semibold text-xs text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{whiteLabel.app_name}</span>
            <span>·</span>
            <span>{whiteLabel.company_legal_name}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#channels" className="hover:text-white transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <span>Support: {whiteLabel.support_email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
