import React, { useState } from 'react';
import {
  BusinessWorkspace,
  BusinessMember,
  WhiteLabelConfig,
  UserProfile,
  Role,
  Order,
  Customer,
  Product,
  SupportedLanguage,
  DateFormat,
  ClockFormat,
  MeasurementSystem,
  TaxConfig
} from '../../types';
import { SUPPORTED_LANGUAGES, useI18n } from '../../services/i18n';
import { GLOBAL_CURRENCIES, formatCurrency } from '../../services/currency';
import { COMMON_TIMEZONES } from '../../services/dateTime';
import { GLOBAL_COUNTRIES } from '../../services/addressPhone';
import {
  Building2,
  Users,
  CreditCard,
  Palette,
  CheckCircle2,
  Shield,
  Plus,
  Mail,
  UserCheck,
  Zap,
  Sparkles,
  RotateCcw,
  Globe,
  Percent,
  Download,
  Trash2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

interface SettingsViewProps {
  workspace: BusinessWorkspace;
  workspaces: BusinessWorkspace[];
  members: BusinessMember[];
  currentUser: UserProfile;
  whiteLabel: WhiteLabelConfig;
  orders?: Order[];
  customers?: Customer[];
  products?: Product[];
  onUpdateWorkspace: (id: string, updates: Partial<BusinessWorkspace>) => void;
  onUpdateWhiteLabel: (updates: Partial<WhiteLabelConfig>) => void;
  onSwitchWorkspace: (id: string) => void;
  onResetDemoData: () => void;
  onOpenOnboarding?: () => void;
}

type TabType = 'workspace' | 'localization' | 'tax' | 'gdpr' | 'members' | 'subscription' | 'whitelabel';

export const SettingsView: React.FC<SettingsViewProps> = ({
  workspace,
  workspaces,
  members,
  currentUser,
  whiteLabel,
  orders = [],
  customers = [],
  products = [],
  onUpdateWorkspace,
  onUpdateWhiteLabel,
  onSwitchWorkspace,
  onResetDemoData,
  onOpenOnboarding
}) => {
  const { t, setLanguage, language } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('workspace');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states for WhiteLabel
  const [appName, setAppName] = useState(whiteLabel.app_name);
  const [logoUrl, setLogoUrl] = useState(whiteLabel.logo_url);
  const [primaryColor, setPrimaryColor] = useState(whiteLabel.primary_color);
  const [companyName, setCompanyName] = useState(whiteLabel.company_legal_name);
  const [supportEmail, setSupportEmail] = useState(whiteLabel.support_email);
  const [supportPhone, setSupportPhone] = useState(whiteLabel.support_phone);
  const [defaultCurrency, setDefaultCurrency] = useState(whiteLabel.default_currency);
  const [invoiceNote, setInvoiceNote] = useState(whiteLabel.invoice_footer_note);

  // Workspace form states
  const [wsName, setWsName] = useState(workspace.name);
  const [wsCategory, setWsCategory] = useState(workspace.category);
  const [wsCountry, setWsCountry] = useState(workspace.country_code || 'US');
  const [wsPhone, setWsPhone] = useState(workspace.phone);
  const [wsEmail, setWsEmail] = useState(workspace.email);
  const [wsAddress, setWsAddress] = useState(workspace.address_line1 || workspace.address || '');
  const [wsCity, setWsCity] = useState(workspace.city);
  const [wsState, setWsState] = useState(workspace.state_province_region || workspace.state_province || '');
  const [wsPostal, setWsPostal] = useState(workspace.postal_zip_code || workspace.postal_code || '');

  // Localization states
  const [wsLanguage, setWsLanguage] = useState<SupportedLanguage>(workspace.language || language || 'en');
  const [wsCurrencyCode, setWsCurrencyCode] = useState(workspace.currency_code || 'USD');
  const [wsTimezone, setWsTimezone] = useState(workspace.timezone || 'UTC');
  const [wsDateFormat, setWsDateFormat] = useState<DateFormat>(workspace.date_format || 'YYYY-MM-DD');
  const [wsClockFormat, setWsClockFormat] = useState<ClockFormat>(workspace.clock_format || '12h');
  const [wsMeasurement, setWsMeasurement] = useState<MeasurementSystem>(workspace.measurement_system || 'metric');

  // Tax states
  const [taxName, setTaxName] = useState(workspace.tax_config?.tax_name || 'VAT');
  const [taxRate, setTaxRate] = useState(workspace.tax_config?.default_rate ?? 0);
  const [taxInclusive, setTaxInclusive] = useState(workspace.tax_config?.is_inclusive ?? false);
  const [taxIdNumber, setTaxIdNumber] = useState(workspace.tax_number || workspace.tax_config?.tax_id_number || '');

  // GDPR status feedback
  const [gdprMessage, setGdprMessage] = useState<string | null>(null);

  const triggerSaveNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    const cObj = GLOBAL_COUNTRIES.find(c => c.code === wsCountry);
    onUpdateWorkspace(workspace.id, {
      name: wsName,
      category: wsCategory,
      country: cObj?.name || workspace.country,
      country_code: wsCountry,
      phone: wsPhone,
      email: wsEmail,
      address: wsAddress,
      city: wsCity,
      state_province: wsState,
      postal_code: wsPostal
    });
    triggerSaveNotification();
  };

  const handleSaveLocalization = (e: React.FormEvent) => {
    e.preventDefault();
    const curObj = GLOBAL_CURRENCIES.find(c => c.code === wsCurrencyCode);
    setLanguage(wsLanguage);
    onUpdateWorkspace(workspace.id, {
      language: wsLanguage,
      currency: wsCurrencyCode,
      currency_code: wsCurrencyCode,
      currency_symbol: curObj?.symbol || '$',
      timezone: wsTimezone,
      date_format: wsDateFormat,
      clock_format: wsClockFormat,
      measurement_system: wsMeasurement
    });
    triggerSaveNotification();
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    const newTaxConfig: TaxConfig = {
      name: taxName,
      tax_name: taxName,
      rate_percentage: taxRate,
      default_rate: taxRate,
      calculation_type: taxInclusive ? 'inclusive' : 'exclusive',
      is_inclusive: taxInclusive,
      is_enabled: taxRate > 0,
      tax_id_number: taxIdNumber
    };
    onUpdateWorkspace(workspace.id, {
      tax_number: taxIdNumber,
      tax_config: newTaxConfig
    });
    triggerSaveNotification();
  };

  const handleSaveWhiteLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const curObj = GLOBAL_CURRENCIES.find(c => c.code === defaultCurrency);
    onUpdateWhiteLabel({
      app_name: appName,
      logo_url: logoUrl,
      primary_color: primaryColor,
      company_legal_name: companyName,
      support_email: supportEmail,
      support_phone: supportPhone,
      default_currency: defaultCurrency,
      default_currency_symbol: curObj?.symbol || '$',
      invoice_footer_note: invoiceNote
    });
    triggerSaveNotification();
  };

  const handleUpgradePlan = (plan: 'free' | 'starter' | 'pro') => {
    onUpdateWorkspace(workspace.id, {
      subscription_plan: plan,
      monthly_order_limit: plan === 'pro' ? 10000 : plan === 'starter' ? 500 : 50
    });
    triggerSaveNotification();
  };

  const handleExportFullData = () => {
    const exportBundle = {
      exported_at: new Date().toISOString(),
      workspace,
      orders_count: orders.length,
      orders,
      customers_count: customers.length,
      customers,
      products_count: products.length,
      products
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `OrderFlow_GDPR_Export_${workspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setGdprMessage('Complete GDPR store data bundle downloaded successfully.');
    setTimeout(() => setGdprMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav.settings')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure global localization, tax rates, GDPR compliance, subscription tiers, and branding
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Changes saved successfully
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'workspace'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Store Profile
        </button>

        <button
          onClick={() => setActiveTab('localization')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'localization'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          Localization & Currency
        </button>

        <button
          onClick={() => setActiveTab('tax')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tax'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Percent className="w-4 h-4" />
          Tax & VAT Rules
        </button>

        <button
          onClick={() => setActiveTab('gdpr')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gdpr'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          GDPR & Data Export
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'subscription'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Billing & Subscription
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'members'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          Team Members (RBAC)
        </button>

        <button
          onClick={() => setActiveTab('whitelabel')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'whitelabel'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          White-Label Center
        </button>
      </div>

      {/* Tab 1: Store Profile */}
      {activeTab === 'workspace' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Store Identity & Address</h2>
              <p className="text-xs text-slate-500">Business registration information printed on official invoices</p>
            </div>
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg cursor-pointer"
              >
                + New Global Store Setup
              </button>
            )}
          </div>

          <form onSubmit={handleSaveWorkspace} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Store / Business Name *</label>
                <input
                  type="text"
                  required
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Industry Category</label>
                <input
                  type="text"
                  value={wsCategory}
                  onChange={(e) => setWsCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Country</label>
                <select
                  value={wsCountry}
                  onChange={(e) => setWsCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  {GLOBAL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Business Phone</label>
                <input
                  type="text"
                  value={wsPhone}
                  onChange={(e) => setWsPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={wsAddress}
                  onChange={(e) => setWsAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                <input
                  type="text"
                  value={wsCity}
                  onChange={(e) => setWsCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">State / Province</label>
                <input
                  type="text"
                  value={wsState}
                  onChange={(e) => setWsState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={wsPostal}
                  onChange={(e) => setWsPostal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={wsEmail}
                  onChange={(e) => setWsEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Localization & Currency */}
      {activeTab === 'localization' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Localization, Currency & Regional Formats</h2>
            <p className="text-xs text-slate-500">Configure language, ISO currencies, timezones, and number patterns</p>
          </div>

          <form onSubmit={handleSaveLocalization} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default Platform Language</label>
                <select
                  value={wsLanguage}
                  onChange={(e) => setWsLanguage(e.target.value as SupportedLanguage)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name} ({l.nativeName}) {l.direction === 'rtl' ? '[RTL]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Store Default Currency (ISO 4217)</label>
                <select
                  value={wsCurrencyCode}
                  onChange={(e) => setWsCurrencyCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-mono"
                >
                  {GLOBAL_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Business Time Zone (IANA)</label>
                <select
                  value={wsTimezone}
                  onChange={(e) => setWsTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-mono"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.zone} value={tz.zone}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date Format</label>
                <select
                  value={wsDateFormat}
                  onChange={(e) => setWsDateFormat(e.target.value as DateFormat)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-mono"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard: 2025-02-23)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Europe/UK/Global: 23/02/2025)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (United States: 02/23/2025)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (23-02-2025)</option>
                  <option value="YYYY/MM/DD">YYYY/MM/DD (Japan/Asia: 2025/02/23)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time Clock Format</label>
                <select
                  value={wsClockFormat}
                  onChange={(e) => setWsClockFormat(e.target.value as ClockFormat)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="12h">12-Hour Clock (e.g. 02:45 PM)</option>
                  <option value="24h">24-Hour Military Clock (e.g. 14:45)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Measurement System</label>
                <select
                  value={wsMeasurement}
                  onChange={(e) => setWsMeasurement(e.target.value as MeasurementSystem)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="metric">Metric (Kilograms / Centimeters)</option>
                  <option value="imperial">Imperial (Pounds / Inches)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Apply Localization Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Tax & VAT Rules */}
      {activeTab === 'tax' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tax, VAT & GST System Configuration</h2>
            <p className="text-xs text-slate-500">Configure jurisdiction tax rules, registration numbers, and price calculation modes</p>
          </div>

          <form onSubmit={handleSaveTax} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tax Label / Acronym</label>
                <input
                  type="text"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder="e.g. VAT, GST, Sales Tax, MwSt, IVA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tax Registration / BIN / VAT ID</label>
                <input
                  type="text"
                  value={taxIdNumber}
                  onChange={(e) => setTaxIdNumber(e.target.value)}
                  placeholder="e.g. GB123456789 or DE987654321"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Price Calculation Mode</label>
                <select
                  value={taxInclusive ? 'inclusive' : 'exclusive'}
                  onChange={(e) => setTaxInclusive(e.target.value === 'inclusive')}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="exclusive">Exclusive (Tax added on top of product price)</option>
                  <option value="inclusive">Inclusive (Prices already include tax/VAT)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-500 text-[11px] space-y-1">
              <div>• <strong>Exclusive Mode:</strong> If a product is {formatCurrency(100, workspace.currency_code)} with 10% tax, customer pays {formatCurrency(110, workspace.currency_code)}.</div>
              <div>• <strong>Inclusive Mode:</strong> If a product is {formatCurrency(100, workspace.currency_code)} with 20% VAT, product gross total remains {formatCurrency(100, workspace.currency_code)} with {formatCurrency(16.67, workspace.currency_code)} tax recognized for accounting.</div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Save Tax Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: GDPR & Data Export */}
      {activeTab === 'gdpr' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">GDPR & Global Data Privacy Compliance</h2>
            <p className="text-xs text-slate-500">Data portability, customer right to be forgotten, and cryptographic export tools</p>
          </div>

          {gdprMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{gdprMessage}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-xs">Article 20: Right to Data Portability</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Download a machine-readable JSON backup of all {orders.length} orders, {customers.length} customer profiles, and catalog inventory.
              </p>
            </div>
            <button
              onClick={handleExportFullData}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Full Store JSON
            </button>
          </div>

          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs">
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Article 17: Right to Erasure (Anonymization)</span>
            </div>
            <p className="text-amber-700 dark:text-amber-400 text-[11px]">
              When an international customer requests data deletion, OrderFlow automatically redacts names, phone numbers, and addresses from historic sales records while preserving double-entry accounting ledger totals for tax authorities.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Subscription Billing */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Active Subscription Tier
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                  {workspace.subscription_plan} Plan
                </h2>
                <p className="text-xs text-slate-500">
                  Current volume limit: {workspace.monthly_order_limit.toLocaleString()} orders/month
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Standing
                </span>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {/* Free Tier */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                workspace.subscription_plan === 'free'
                  ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Free Starter</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">$0</div>
                  <div className="text-[11px] text-slate-500 mb-4">Forever free for testing</div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 50 orders/mo</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 1 Team Member</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Standard Invoicing</li>
                  </ul>
                </div>
                <button
                  disabled={workspace.subscription_plan === 'free'}
                  onClick={() => handleUpgradePlan('free')}
                  className="w-full py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  {workspace.subscription_plan === 'free' ? 'Current Plan' : 'Select Free'}
                </button>
              </div>

              {/* Starter Tier */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                workspace.subscription_plan === 'starter'
                  ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Growing Merchant</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">$9<span className="text-xs text-slate-400">/mo</span></div>
                  <div className="text-[11px] text-slate-500 mb-4">For active direct-to-consumer shops</div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 500 orders/mo</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 5 Team Staff with RBAC</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Multi-Carrier Shipping</li>
                  </ul>
                </div>
                <button
                  disabled={workspace.subscription_plan === 'starter'}
                  onClick={() => handleUpgradePlan('starter')}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {workspace.subscription_plan === 'starter' ? 'Current Plan' : 'Upgrade to Starter ($9)'}
                </button>
              </div>

              {/* Pro Tier */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                workspace.subscription_plan === 'pro'
                  ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Pro Enterprise</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-slate-950 dark:text-white">$19<span className="text-xs text-slate-400">/mo</span></div>
                  <div className="text-[11px] text-slate-500 mb-4">Unlimited scaling with multi-channel sync</div>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 10,000+ orders/mo</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited Team Members</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Shopify / Amazon Channels</li>
                  </ul>
                </div>
                <button
                  disabled={workspace.subscription_plan === 'pro'}
                  onClick={() => handleUpgradePlan('pro')}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {workspace.subscription_plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro ($19)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Members & RBAC */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Team Access</h2>
              <p className="text-xs text-slate-500">Role-Based Access Control (RBAC) protecting profit and financial ledger</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {members.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                    {m.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {m.name}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {m.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono">
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: White-Label Center */}
      {activeTab === 'whitelabel' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Commercial SaaS White-Label Rebranding</h2>
            <p className="text-xs text-slate-500">Customize product brand name, company legal details, and invoice footer notes</p>
          </div>

          <form onSubmit={handleSaveWhiteLabel} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Product Brand Name</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Operating Company Legal Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-mono"
                >
                  {GLOBAL_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default Invoice Terms & Return Policy Note</label>
                <textarea
                  rows={3}
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Save White-Label Branding
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
