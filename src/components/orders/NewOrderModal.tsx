import React, { useState, useEffect } from 'react';
import {
  Product,
  Customer,
  BusinessWorkspace,
  WhiteLabelConfig,
  PaymentMethod,
  PaymentStatus,
  GlobalCourierProvider,
  OrderAddress
} from '../../types';
import { GLOBAL_COUNTRIES, CountryInfo, getCountryByCode } from '../../services/addressPhone';
import { GLOBAL_COURIERS } from '../../services/shipping';
import { formatCurrency } from '../../services/currency';
import { calculateOrderTax } from '../../services/tax';
import { useI18n } from '../../services/i18n';
import { X, Plus, Trash2, AlertCircle, Check, Globe } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onSubmit: (orderData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: OrderAddress;
    shippingCity?: string;
    address?: OrderAddress;
    shippingCountryCode?: string;
    shippingState?: string;
    shippingPostalCode?: string;
    currencyCode?: string;
    currencySymbol?: string;
    items: Array<{ productId: string; variantName?: string; quantity: number }>;
    discount?: number;
    deliveryCharge?: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    courierProvider?: GlobalCourierProvider;
    internalNotes?: string;
    packageWeightKg?: number;
    salesChannel?: string;
  }) => { success: boolean; error?: string };
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  workspace,
  whiteLabel,
  onSubmit
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  const currencyCode = workspace.currency_code || 'USD';

  // Find initial country from workspace
  const defaultCountryCode = workspace.country_code || 'US';
  const defaultCountry = getCountryByCode(defaultCountryCode) || GLOBAL_COUNTRIES[0];

  // Customer & Address State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(defaultCountry);
  const [phoneDialCode, setPhoneDialCode] = useState(defaultCountry.phoneCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState(workspace.city || '');
  const [stateProvince, setStateProvince] = useState(workspace.state_province || '');
  const [postalCode, setPostalCode] = useState(workspace.postal_code || '');

  // Line items
  const [items, setItems] = useState<Array<{ productId: string; variantName?: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 1 }
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(() => {
    return currencyCode === 'BDT' ? 60 : currencyCode === 'JPY' ? 600 : 10;
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [courierProvider, setCourierProvider] = useState<GlobalCourierProvider>(() => {
    if (workspace.country_code === 'BD') return 'pathao';
    if (workspace.country_code === 'GB') return 'royal_mail';
    return 'dhl';
  });
  const [packageWeightKg, setPackageWeightKg] = useState<number>(0.5);
  const [salesChannel, setSalesChannel] = useState<string>('direct_store');
  const [internalNotes, setInternalNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-fill when customer is selected
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) return;
    const c = customers.find(cust => cust.id === id);
    if (c) {
      setCustomerName(c.name);
      setCustomerEmail(c.email || '');

      // Parse country if available
      const custCountry = c.country_code ? getCountryByCode(c.country_code) : defaultCountry;
      if (custCountry) {
        setSelectedCountry(custCountry);
        setPhoneDialCode(custCountry.phoneCode);
      }

      setPhoneNumber(c.phone);
      setAddressLine1(c.address || c.address_line1 || '');
      setCity(c.city || '');
      if (c.state_province || c.state_province_region) setStateProvince(c.state_province || c.state_province_region || '');
      if (c.postal_code || c.postal_zip_code) setPostalCode(c.postal_code || c.postal_zip_code || '');
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const found = getCountryByCode(countryCode);
    if (found) {
      setSelectedCountry(found);
      setPhoneDialCode(found.phoneCode);
    }
  };

  const handleAddItem = () => {
    const available = products.find(p => p.stock > 0);
    if (available) {
      setItems([...items, { productId: available.id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemProductChange = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    setItems(items.map((it, idx) => {
      if (idx === index) {
        return {
          productId: prodId,
          variantName: prod?.variants[0]?.name,
          quantity: 1
        };
      }
      return it;
    }));
  };

  // Calculations
  const subtotal = items.reduce((sum, it) => {
    const p = products.find(prod => prod.id === it.productId);
    return sum + (p ? p.selling_price * it.quantity : 0);
  }, 0);

  const orderLineItems = items.map(it => {
    const p = products.find(prod => prod.id === it.productId);
    return { unit_price: p ? p.selling_price : 0, quantity: it.quantity };
  });

  const taxCalculation = calculateOrderTax(
    orderLineItems,
    deliveryCharge,
    discount,
    workspace.tax_config
  );

  const grandTotal = taxCalculation.finalTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${phoneDialCode}${phoneNumber}`;
    if (!phoneNumber.trim() || fullPhone.length < 7) {
      setFormError('A valid customer phone number is required.');
      return;
    }
    if (!addressLine1.trim()) {
      setFormError('Delivery street address is required.');
      return;
    }
    if (!city.trim()) {
      setFormError('Destination city is required.');
      return;
    }
    if (items.length === 0) {
      setFormError('At least one product item is required.');
      return;
    }

    const orderAddress: OrderAddress = {
      recipient_name: customerName,
      phone_country_code: phoneDialCode,
      phone: fullPhone,
      email: customerEmail || undefined,
      address_line1: addressLine1,
      address_line2: addressLine2 || undefined,
      line1: addressLine1,
      line2: addressLine2 || undefined,
      city,
      state_province_region: stateProvince || undefined,
      state_province: stateProvince || undefined,
      postal_zip_code: postalCode || undefined,
      postal_code: postalCode || undefined,
      country: selectedCountry.name,
      country_code: selectedCountry.code
    };

    const res = onSubmit({
      customerId: selectedCustomerId || undefined,
      customerName,
      customerPhone: fullPhone,
      customerEmail: customerEmail || undefined,
      shippingAddress: orderAddress,
      shippingCity: city,
      address: orderAddress,
      shippingCountryCode: selectedCountry.code,
      shippingState: stateProvince,
      shippingPostalCode: postalCode,
      currencyCode: workspace.currency_code,
      currencySymbol: workspace.currency_symbol,
      items,
      discount,
      deliveryCharge,
      paymentMethod,
      paymentStatus,
      courierProvider,
      packageWeightKg,
      salesChannel,
      internalNotes: internalNotes || undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to place order.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('orders.new_order')}</span>
              <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono rounded">
                {currencyCode}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              International order creation with real-time tax & multi-carrier dispatch
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Selection & Sales Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Select Existing Customer (Optional):
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="">-- Or enter new customer details below --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.city}, {c.country_code || 'US'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Sales Channel:
              </label>
              <select
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="direct_store">Online Storefront / Direct</option>
                <option value="shopify">Shopify Integration</option>
                <option value="woocommerce">WooCommerce Store</option>
                <option value="amazon">Amazon Marketplace</option>
                <option value="ebay">eBay Store</option>
                <option value="instagram_facebook">Instagram / Facebook DM</option>
                <option value="whatsapp">WhatsApp Commerce</option>
              </select>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-3">
            <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
              Customer & Shipping Destination
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="eleanor@example.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Destination Country */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Country *
                </label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {GLOBAL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code}) - {c.phoneCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* International Phone with dial code */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-mono text-xs flex items-center">
                    {phoneDialCode}
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="4155552671"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Street Address Line 1 */}
              <div className="sm:col-span-2">
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Address Line 1 (Street & House/Apt) *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Street Address Line 2 */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Address Line 2 (Suite / Building / Unit)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Suite 400"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* State / Province */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  State / Province / Region
                </label>
                <input
                  type="text"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="e.g. California"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Postal / ZIP Code */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 94107"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Product Line Items:
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Product
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row items-center gap-3"
                  >
                    <div className="flex-1 w-full">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemProductChange(index, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                            {p.title} — {formatCurrency(p.selling_price, currencyCode)} ({p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {prod && prod.variants && prod.variants.length > 0 && (
                      <div className="w-full sm:w-44">
                        <select
                          value={item.variantName || ''}
                          onChange={(e) => {
                            setItems(items.map((it, idx) => idx === index ? { ...it, variantName: e.target.value } : it));
                          }}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                        >
                          {prod.variants.map((v) => (
                            <option key={v.id} value={v.name}>
                              {v.name} ({v.stock} in stock)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-500 text-[11px]">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        max={prod ? prod.stock : 99}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setItems(items.map((it, idx) => idx === index ? { ...it, quantity: val } : it));
                        }}
                        className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-center font-mono font-semibold"
                      />
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing, Fees & Tax Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Discount ({currencyCode})
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Shipping Fee ({currencyCode})
              </label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Courier / Carrier
              </label>
              <select
                value={courierProvider}
                onChange={(e) => setCourierProvider(e.target.value as GlobalCourierProvider)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {GLOBAL_COURIERS.map((c) => (
                  <option key={c.provider} value={c.provider}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Package Weight (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={packageWeightKg}
                onChange={(e) => setPackageWeightKg(Math.max(0.05, parseFloat(e.target.value) || 0.5))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  const m = e.target.value as PaymentMethod;
                  setPaymentMethod(m);
                  if (m === 'credit_card' || m === 'paypal' || m === 'stripe') {
                    setPaymentStatus('paid');
                  } else {
                    setPaymentStatus('unpaid');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                <option value="credit_card">Credit / Debit Card (Stripe)</option>
                <option value="paypal">PayPal</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="bank_transfer">Wire / Direct Bank Transfer</option>
                <option value="cash">Direct Cash / POS</option>
                <option value="mfs_bkash">bKash (Regional MFS)</option>
                <option value="mfs_nagad">Nagad (Regional MFS)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                <option value="unpaid">Unpaid / Collect On Delivery</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Internal Order Notes (Optional)
            </label>
            <input
              type="text"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g. Leave package by door, expedite customs clearance"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Grand Total Bar & Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left w-full sm:w-auto space-y-0.5">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Subtotal: {formatCurrency(subtotal, currencyCode)}</span>
                {taxCalculation.taxAmount > 0 && (
                  <span>· {taxCalculation.taxLabel}: {formatCurrency(taxCalculation.taxAmount, currencyCode)}</span>
                )}
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-950 dark:text-white">
                Total Due: {formatCurrency(grandTotal, currencyCode)}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Confirm & Create Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
