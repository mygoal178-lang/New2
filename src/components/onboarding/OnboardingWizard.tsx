import React, { useState, useEffect } from 'react';
import {
  BusinessWorkspace,
  Product,
  SupportedLanguage,
  DateFormat,
  ClockFormat,
  MeasurementSystem,
  TaxConfig
} from '../../types';
import { SUPPORTED_LANGUAGES, detectBrowserLocale, useI18n } from '../../services/i18n';
import { GLOBAL_CURRENCIES } from '../../services/currency';
import { COMMON_TIMEZONES } from '../../services/dateTime';
import { GLOBAL_COUNTRIES, getCountryByCode } from '../../services/addressPhone';
import {
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  DollarSign,
  Package,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Globe,
  Percent,
  Calendar,
  Layers
} from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (
    workspaceData: Omit<BusinessWorkspace, 'id' | 'created_at'>,
    initialProduct?: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>
  ) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { setLanguage } = useI18n();

  if (!isOpen) return null;

  const [step, setStep] = useState(1);

  // Auto-detect browser settings on initial mount
  const detectedLocale = detectBrowserLocale();
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // 13 Required Global Onboarding Fields
  // 1. Business name
  const [bizName, setBizName] = useState('My Online Store');
  // 2. Business type
  const [bizCategory, setBizCategory] = useState('Fashion & Apparel');
  // 3. Country
  const [countryCode, setCountryCode] = useState('US');
  // 4. State / Province / Region
  const [stateProvince, setStateProvince] = useState('California');
  // 5. Business address
  const [address, setAddress] = useState('100 Market Street, Suite 300');
  // 6. Postal or ZIP code
  const [postalCode, setPostalCode] = useState('94105');
  // 7. Business phone number
  const [phone, setPhone] = useState('+1 (415) 555-0199');
  // 8. Business email
  const [email, setEmail] = useState('hello@myonlinestore.com');
  // 9. Preferred language
  const [language, setLanguageChoice] = useState<SupportedLanguage>(detectedLocale);
  // 10. Default currency
  const [currencyCode, setCurrencyCode] = useState('USD');
  // 11. Time zone
  const [timezone, setTimezone] = useState(detectedTimezone);
  // 12. Date format
  const [dateFormat, setDateFormat] = useState<DateFormat>('YYYY-MM-DD');
  // 13. Measurement system
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('metric');

  // Optional Starter Product
  const [createInitialProduct, setCreateInitialProduct] = useState(true);
  const [prodTitle, setProdTitle] = useState('Premium Organic Cotton Tee');
  const [prodSku, setProdSku] = useState('TEE-ORG-001');
  const [prodCost, setProdCost] = useState(12);
  const [prodPrice, setProdPrice] = useState(29);
  const [prodStock, setProdStock] = useState(50);

  // Update phone dial code when country changes
  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const c = getCountryByCode(code);
    if (c) {
      if (code === 'GB') {
        setCurrencyCode('GBP');
        setDateFormat('DD/MM/YYYY');
        setTimezone('Europe/London');
      } else if (code === 'DE' || code === 'FR' || code === 'ES') {
        setCurrencyCode('EUR');
        setDateFormat('DD/MM/YYYY');
        setTimezone('Europe/Berlin');
      } else if (code === 'JP') {
        setCurrencyCode('JPY');
        setDateFormat('YYYY/MM/DD');
        setTimezone('Asia/Tokyo');
        setProdCost(1500);
        setProdPrice(3500);
      } else if (code === 'AU') {
        setCurrencyCode('AUD');
        setDateFormat('DD/MM/YYYY');
        setTimezone('Australia/Sydney');
      } else if (code === 'BD') {
        setCurrencyCode('BDT');
        setDateFormat('DD/MM/YYYY');
        setTimezone('Asia/Dhaka');
        setProdCost(450);
        setProdPrice(1200);
      }
    }
  };

  const handleFinish = () => {
    const countryObj = getCountryByCode(countryCode);
    const currencyObj = GLOBAL_CURRENCIES.find(c => c.code === currencyCode);

    // Apply selected language immediately
    setLanguage(language);

    const taxRate = countryCode === 'US' ? 8.25 : countryCode === 'GB' ? 20 : countryCode === 'DE' ? 19 : 0;
    const taxName = countryCode === 'US' ? 'Sales Tax' : countryCode === 'AU' ? 'GST' : 'VAT';
    const isInclusive = countryCode !== 'US';

    const defaultTax: TaxConfig = {
      name: taxName,
      tax_name: taxName,
      rate_percentage: taxRate,
      default_rate: taxRate,
      calculation_type: isInclusive ? 'inclusive' : 'exclusive',
      is_inclusive: isInclusive,
      is_enabled: taxRate > 0,
      tax_id_number: ''
    };

    const workspaceData: Omit<BusinessWorkspace, 'id' | 'created_at'> = {
      name: bizName,
      slug: bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace',
      category: bizCategory,
      country: countryObj?.name || 'United States',
      country_code: countryCode,
      currency: currencyCode,
      currency_code: currencyCode,
      currency_symbol: currencyObj?.symbol || '$',
      currency_decimals: currencyObj?.decimals ?? 2,
      phone_country_code: countryObj?.phoneCode || '+1',
      phone,
      email,
      address_line1: address || '100 Commerce Way',
      address_line2: '',
      address,
      city: address.split(',')[0]?.trim() || 'San Francisco',
      state_province_region: stateProvince || '',
      state_province: stateProvince,
      postal_zip_code: postalCode || '',
      postal_code: postalCode,
      timezone,
      language,
      date_format: dateFormat,
      clock_format: '12h',
      measurement_system: measurementSystem,
      tax_config: defaultTax,
      logo_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=160&auto=format&fit=crop&q=60',
      inside_dhaka_delivery_charge: currencyCode === 'BDT' ? 60 : 10,
      outside_dhaka_delivery_charge: currencyCode === 'BDT' ? 120 : 25,
      subscription_plan: 'starter',
      subscription_status: 'active',
      monthly_order_limit: 500
    };

    let initialProd: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'> | undefined;
    if (createInitialProduct && prodTitle.trim()) {
      initialProd = {
        title: prodTitle,
        sku: prodSku,
        category: bizCategory,
        description: 'Quality tested product ready for fulfillment.',
        purchase_price: prodCost,
        selling_price: prodPrice,
        stock: prodStock,
        min_stock_alert: 5,
        status: 'active',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
        weight: 0.25,
        weight_unit: measurementSystem === 'imperial' ? 'lb' : 'kg',
        variants: [
          { id: 'v1', product_id: '', name: 'Size M / Black', sku: `${prodSku}-M-BLK`, stock: Math.floor(prodStock * 0.6), price_adjustment: 0 },
          { id: 'v2', product_id: '', name: 'Size L / Black', sku: `${prodSku}-L-BLK`, stock: Math.floor(prodStock * 0.4), price_adjustment: 0 }
        ]
      };
    }

    onComplete(workspaceData, initialProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-300" />
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-200 font-bold">
                Global Store Setup Wizard
              </span>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-bold mt-2">
            Launch Your International E-Commerce Workspace
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            Step {step} of 3: {step === 1 ? 'Business Identity & Address' : step === 2 ? 'International Regional & Currency Settings' : 'Initial Inventory Item'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Business Identity & Address */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    1. Business / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Acme Global Apparel"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    2. Business Type / Category *
                  </label>
                  <select
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Food & Specialty Goods">Food & Specialty Goods</option>
                    <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                    <option value="Direct-to-Consumer Brand">Direct-to-Consumer Brand</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    3. Country *
                  </label>
                  <select
                    value={countryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-medium"
                  >
                    {GLOBAL_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    5. Business Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Market Street, Suite 300"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    4. State / Province / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="e.g. California / Ontario / Bavaria"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    6. Postal or ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 94105"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    7. Business Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (415) 555-0199"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    8. Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: International Regional & Currency Settings */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    9. Preferred Language *
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguageChoice(e.target.value as SupportedLanguage)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    10. Default Currency (ISO 4217) *
                  </label>
                  <select
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-mono font-medium"
                  >
                    {GLOBAL_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    11. Business Time Zone (IANA) *
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
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
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    12. Date Format *
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-mono"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Europe & Global)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (North America)</option>
                    <option value="YYYY/MM/DD">YYYY/MM/DD (Asia & Japan)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    13. Measurement System *
                  </label>
                  <select
                    value={measurementSystem}
                    onChange={(e) => setMeasurementSystem(e.target.value as MeasurementSystem)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="metric">Metric (Kilograms / Centimeters)</option>
                    <option value="imperial">Imperial (Pounds / Inches)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/40 text-[11px] text-indigo-700 dark:text-indigo-300">
                Auto-detected from browser: Language ({detectedLocale.toUpperCase()}) · Timezone ({detectedTimezone}). Settings can always be modified later under Brand & Workspace Settings.
              </div>
            </div>
          )}

          {/* STEP 3: Initial Catalog Item */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Add Your First Product To Warehouse Inventory
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={createInitialProduct}
                    onChange={(e) => setCreateInitialProduct(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Create sample product</span>
                </label>
              </div>

              {createInitialProduct && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      placeholder="e.g. Wireless Noise-Cancelling Headphones"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Initial In-Stock Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prodStock}
                      onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Purchase Cost ({currencyCode})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={prodCost}
                      onChange={(e) => setProdCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Selling Price ({currencyCode})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Complete Setup & Launch Store
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
