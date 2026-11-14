import React, { useState } from 'react';
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
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onSubmit: (orderData: any) => { success: boolean; error?: string };
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  workspace,
  onSubmit
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  const currencyCode = workspace.currency_code || 'USD';
  const defaultCountryCode = workspace.country_code || 'US';
  const defaultCountry = getCountryByCode(defaultCountryCode) || GLOBAL_COUNTRIES[0];

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(defaultCountry);
  const [phoneDialCode, setPhoneDialCode] = useState(defaultCountry.phoneCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState(workspace.city || '');
  const [stateProvince, setStateProvince] = useState((workspace as any).state_province || '');
  const [postalCode, setPostalCode] = useState((workspace as any).postal_code || '');

  const [items, setItems] = useState<Array<{ productId: string; variantName?: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 1 }
  ]);

  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(currencyCode === 'BDT' ? 60 : 10);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [courierProvider, setCourierProvider] = useState<GlobalCourierProvider>('dhl');
  const [packageWeightKg, setPackageWeightKg] = useState(0.5);
  const [salesChannel, setSalesChannel] = useState('direct_store');
  const [internalNotes, setInternalNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) return;
    const c = customers.find((cust) => cust.id === id);
    if (c) {
      setCustomerName(c.name);
      setCustomerEmail(c.email || '');
      const custCountry = c.country_code ? getCountryByCode(c.country_code) : defaultCountry;
      if (custCountry) {
        setSelectedCountry(custCountry);
        setPhoneDialCode(custCountry.phoneCode);
      }
      setPhoneNumber(c.phone);
      setAddressLine1((c as any).address || (c as any).address_line1 || '');
      setCity(c.city || '');
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
    const available = products.find((p) => (p as any).stock > 0) || products[0];
    if (available) setItems([...items, { productId: available.id, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    setItems(
      items.map((it, idx) =>
        idx === index
          ? {
              productId: prodId,
              variantName: (prod as any)?.variants?.[0]?.name,
              quantity: 1
            }
          : it
      )
    );
  };

  const subtotal = items.reduce((sum, it) => {
    const p = products.find((prod) => prod.id === it.productId);
    return sum + (p ? Number((p as any).selling_price) * it.quantity : 0);
  }, 0);

  const orderLineItems = items.map((it) => {
    const p = products.find((prod) => prod.id === it.productId);
    return { unit_price: p ? Number((p as any).selling_price) : 0, quantity: it.quantity };
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
    if (products.length === 0) {
      setFormError('Add products in Inventory first, then create an order.');
      return;
    }
    if (items.some((it) => !it.productId)) {
      setFormError('Select a product for every line item.');
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
    } as any;

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
      items: items.map((it) => {
        const p = products.find((prod) => prod.id === it.productId);
        return {
          productId: it.productId,
          productTitle: (p as any)?.title || (p as any)?.name || 'Item',
          variantName: it.variantName,
          quantity: it.quantity,
          unitPrice: p ? Number((p as any).selling_price) || 0 : 0,
          unitCost: p ? Number((p as any).cost_price ?? (p as any).purchase_price) || 0 : 0,
          sku: (p as any)?.sku || '',
          title: (p as any)?.title || (p as any)?.name || 'Item',
          price: p ? Number((p as any).selling_price) || 0 : 0
        };
      }),
      discount,
      deliveryCharge,
      paymentMethod,
      paymentStatus,
      courierProvider,
      packageWeightKg,
      salesChannel,
      internalNotes: internalNotes || undefined
    });

    if (!res.success) setFormError(res.error || 'Failed to place order.');
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-0 sm:my-6 max-h-[95dvh] flex flex-col">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('orders.new_order') || 'New Order'}</span>
              <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono rounded">
                {currencyCode}
              </span>
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">Create order with tax & courier options</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-500 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto mobile-scroll flex-1 min-h-0">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Existing customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="">— New customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Sales channel</label>
              <select
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <option value="direct_store">Direct / storefront</option>
                <option value="shopify">Shopify</option>
                <option value="woocommerce">WooCommerce</option>
                <option value="amazon">Amazon</option>
              </select>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="font-bold uppercase tracking-wider text-[11px]">Customer & shipping</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium block mb-1">Full name *</label>
                <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Customer name" />
              </div>
              <div>
                <label className="font-medium block mb-1">Email</label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="font-medium block mb-1">Country *</label>
                <select value={selectedCountry.code} onChange={(e) => handleCountryChange(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  {GLOBAL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.phoneCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium block mb-1">Phone *</label>
                <div className="flex gap-2">
                  <span className="px-2 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-xs flex items-center">{phoneDialCode}</span>
                  <input required type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono" placeholder="4155552671" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="font-medium block mb-1">Address line 1 *</label>
                <input required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="font-medium block mb-1">City *</label>
                <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="font-medium block mb-1">State / region</label>
                <input value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="font-medium block mb-1">Postal code</label>
                <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
              <div>
                <label className="font-medium block mb-1">Address line 2</label>
                <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[11px]">Line items</span>
              <button type="button" onClick={handleAddItem} className="text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add item
              </button>
            </div>
            {products.length === 0 && (
              <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                No products yet. Open Inventory and add products, or use Reset Demo Workspace.
              </p>
            )}
            {items.map((item, index) => {
              const prod = products.find((p) => p.id === item.productId);
              return (
                <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemProductChange(index, e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {(p as any).title || (p as any).name} — {formatCurrency(Number((p as any).selling_price) || 0, currencyCode)} (stock {(p as any).stock})
                      </option>
                    ))}
                  </select>
                  {(prod as any)?.variants?.length > 0 && (
                    <select
                      value={item.variantName || ''}
                      onChange={(e) =>
                        setItems(items.map((it, idx) => (idx === index ? { ...it, variantName: e.target.value } : it)))
                      }
                      className="sm:w-36 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      {(prod as any).variants.map((v: any) => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        setItems(
                          items.map((it, idx) =>
                            idx === index ? { ...it, quantity: Math.max(1, parseInt(e.target.value) || 1) } : it
                          )
                        )
                      }
                      className="w-20 px-2 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    />
                    <button type="button" disabled={items.length <= 1} onClick={() => handleRemoveItem(index)} className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold block mb-1">Discount</label>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Shipping</label>
              <input type="number" min={0} value={deliveryCharge} onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Payment</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <option value="credit_card">Card</option>
                <option value="cod">Cash on delivery</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Courier</label>
              <select value={courierProvider} onChange={(e) => setCourierProvider(e.target.value as GlobalCourierProvider)} className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                {GLOBAL_COURIERS.map((c: any) => (
                  <option key={c.id || c.code || c.name} value={c.id || c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-slate-600 dark:text-slate-400 space-x-3">
              <span>Subtotal: {formatCurrency(subtotal, currencyCode)}</span>
              <span className="font-bold text-slate-900 dark:text-white">Total: {formatCurrency(grandTotal, currencyCode)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 cursor-pointer">
              Place order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
