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
  Check,
  Menu,
  X
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

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
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 safe-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0">
              {whiteLabel.app_name}
            </span>
            <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded font-mono shrink-0">
              Global SaaS
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">Features</a>
            <a href="#channels" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">Integrations</a>
            <a href="#markets" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">Global Markets</a>
            <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">Pricing Plans</a>
            <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">{currentLangObj.flag} {currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Select Language:</div>
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
              className="hidden xs:inline text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-2 sm:px-3 py-2 transition-colors cursor-pointer sm:inline"
            >
              Log In
            </button>
            <button
              onClick={onEnterApp}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="sm:hidden">Launch</span>
              <span className="hidden sm:inline">Launch Live App</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Open menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 safe-x">
            {(
              [
                ['#features', 'Features'],
                ['#channels', 'Integrations'],
                ['#markets', 'Global Markets'],
                ['#pricing', 'Pricing Plans'],
                ['#faq', 'FAQ']
              ] as const
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                {label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileNavOpen(false);
                onOpenAuth();
              }}
              className="w-full mt-2 px-3 py-2.5 text-sm font-semibold text-center text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg cursor-pointer"
            >
              Log In / Sign Up
            </button>
          </div>
        )}
      </header>

      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] sm:text-xs text-indigo-700 dark:text-indigo-300 font-semibold max-w-[min(100%,22rem)] sm:max-w-none">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-snug text-left sm:text-center">International E-Commerce Order Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15] max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
            Manage Your Entire Online Business in One Place.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-1">
            Centralize orders, warehouse inventory, multi-carrier parcel dispatch, customer CRM, and realized P&L profit across global sales channels.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md sm:max-w-none mx-auto">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Live Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3.5 sm:py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Sign In to Store
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> DHL, FedEx, UPS & Royal Mail</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> ISO 4217 Multi-Currency</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> VAT / GST Tax Invoices</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 11 Global Languages & RTL</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 sm:mt-12 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="px-3 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block shrink-0" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block shrink-0" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block shrink-0" />
              <span className="ml-1 sm:ml-2 font-mono text-slate-400 truncate">app.orderflow.io/dashboard</span>
            </div>
            <span className="hidden sm:flex text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Global Dispatch Engine Active
            </span>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-slate-50/50 dark:bg-slate-950/40 text-left">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Realized Global Revenue</div>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">$38,450.00</div>
              <div className="mt-1 text-[11px] text-slate-400">Settled orders across US, UK & EU</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">In-Transit Fulfillment</div>
              <div className="mt-1 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">142 Parcels</div>
              <div className="mt-1 text-[11px] text-slate-400">DHL, FedEx, UPS & Royal Mail live tracking</div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Actual Net Operational Margin</div>
              <div className="mt-1 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">31.4%</div>
              <div className="mt-1 text-[11px] text-slate-400">After COGS, VAT & operating expenses</div>
            </div>
          </div>
        </div>
      </section>

      <section id="channels" className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">Unified Multi-Channel eCommerce</h2>
            <p className="text-xs sm:text-sm text-slate-500">Sell across global storefronts, social platforms, and regional marketplaces with real-time inventory synchronization.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs font-semibold">
            {['Shopify', 'WooCommerce', 'Amazon', 'eBay', 'Instagram Shop', 'TikTok Shop'].map((channel) => (
              <div key={channel} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col items-center justify-center gap-2 min-h-[5.5rem]">
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-800 dark:text-slate-200 text-center">{channel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="markets" className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">Engineered For Merchants Across 50+ Countries</h2>
            <p className="text-xs sm:text-sm text-slate-500">Zero hardcoded borders. Fully configurable currencies, phone dialing codes, and regional logistics.</p>
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

      <section id="pricing" className="py-14 sm:py-20 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">Transparent Global Pricing</h2>
            <p className="text-xs sm:text-sm text-slate-500">No hidden fees. Scale as your international fulfillment volume expands.</p>
            <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1">Display currency:</span>
              {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'BDT'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setBillingCurrency(curr)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    billingCurrency === curr
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                name: 'Starter',
                price: 0,
                desc: 'Solo founders testing multi-channel ops',
                features: ['1 workspace', '100 orders / mo', 'Basic inventory', 'Email support']
              },
              {
                name: 'Growth',
                price: 49,
                desc: 'Growing brands with multi-carrier needs',
                features: ['3 workspaces', '2,000 orders / mo', 'Courier integrations', 'Priority chat'],
                popular: true
              },
              {
                name: 'Scale',
                price: 149,
                desc: 'High-volume international merchants',
                features: ['Unlimited workspaces', 'Unlimited orders', 'White-label', 'Dedicated support']
              }
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-5 sm:p-6 rounded-2xl border flex flex-col ${
                  plan.popular
                    ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500/30 bg-white dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                {plan.popular && (
                  <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white mb-2">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                <div className="mt-4 mb-4">
                  <span className="text-3xl font-extrabold font-mono text-slate-950 dark:text-white">{getPrice(plan.price)}</span>
                  {plan.price > 0 && <span className="text-xs text-slate-400 ml-1">/ mo</span>}
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onOpenAuth}
                  className={`mt-6 w-full py-2.5 text-sm font-semibold rounded-xl cursor-pointer ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-950 dark:text-white">Everything you need to operate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Package, title: 'Inventory & SKUs', body: 'Variants, stock alerts, and multi-warehouse ready tracking.' },
              { icon: Truck, title: 'Courier dispatch', body: 'Book DHL, FedEx, UPS and regional carriers with tracking links.' },
              { icon: TrendingUp, title: 'Realized P&L', body: 'Revenue minus COGS and expenses — not vanity dashboard metrics.' },
              { icon: FileText, title: 'Tax invoices', body: 'VAT/GST modes, tax IDs, and printable customer invoices.' },
              { icon: Users, title: 'Customer CRM', body: 'Order history, VIP segments, and contact details in one place.' },
              { icon: Smartphone, title: 'Mobile ready', body: 'Responsive app shell so your team can work from the warehouse floor.' }
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
                <f.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-3" />
                <h3 className="font-bold text-sm text-slate-950 dark:text-white">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-950 dark:text-white">FAQ</h2>
          <div className="space-y-2">
            {faqs.map((item, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 safe-bottom">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="font-semibold text-slate-800 dark:text-slate-200">{whiteLabel.app_name} · Global SaaS</div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={onEnterApp} className="hover:text-indigo-600 cursor-pointer">Open app</button>
            <button onClick={onOpenAuth} className="hover:text-indigo-600 cursor-pointer">Log in</button>
            <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
