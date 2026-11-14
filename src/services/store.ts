/**
 * OrderFlow store — integrations, products seed, working orders.
 */
import { useState, useEffect } from 'react';
import type { UserProfile, BusinessWorkspace, WhiteLabelConfig, AppNotification, ECommerceIntegration } from '../types';

const STORAGE_KEY = 'orderflow_global_state_v3';

const defaultUser: UserProfile = {
  id: 'usr_owner',
  email: 'demo@local.dev',
  full_name: 'Demo Owner',
  role: 'owner',
  preferred_language: 'en',
  created_at: new Date().toISOString()
};

const defaultWorkspace: BusinessWorkspace = {
  id: 'biz_demo',
  name: 'Demo Store',
  slug: 'demo',
  category: 'Retail',
  country: 'United States',
  country_code: 'US',
  currency: 'USD',
  currency_code: 'USD',
  currency_symbol: '$',
  currency_decimals: 2,
  phone_country_code: '+1',
  phone: '',
  email: 'demo@local.dev',
  address_line1: '',
  city: '',
  state_province_region: '',
  postal_zip_code: '',
  timezone: 'UTC',
  language: 'en',
  date_format: 'YYYY-MM-DD',
  clock_format: '12h',
  measurement_system: 'metric',
  tax_config: {
    name: 'Sales Tax',
    rate_percentage: 0,
    calculation_type: 'exclusive',
    is_enabled: false
  },
  logo_url: '',
  created_at: new Date().toISOString(),
  subscription_plan: 'pro',
  subscription_status: 'active',
  monthly_order_limit: 10000
};

const defaultWhiteLabel: WhiteLabelConfig = {
  app_name: 'OrderFlow',
  logo_url: '',
  primary_color: '#4f46e5',
  secondary_color: '#0f172a',
  company_legal_name: 'OrderFlow Inc',
  support_email: 'support@orderflow.app',
  support_phone: '',
  default_currency: 'USD',
  default_currency_symbol: '$',
  default_language: 'en',
  invoice_footer_note: '',
  enable_courier_integrations: true,
  enable_multi_currency: true,
  enable_gdpr_tools: true
};

const DEFAULT_INTEGRATIONS: ECommerceIntegration[] = [
  { id: 'integ_shopify', business_id: 'biz_demo', channel: 'shopify', name: 'Shopify Storefront', is_connected: false, store_url: '', orders_synced_count: 0, auto_sync: false },
  { id: 'integ_woo', business_id: 'biz_demo', channel: 'woocommerce', name: 'WooCommerce Store', is_connected: false, store_url: '', orders_synced_count: 0, auto_sync: false },
  { id: 'integ_amazon', business_id: 'biz_demo', channel: 'amazon', name: 'Amazon Marketplace', is_connected: false, orders_synced_count: 0, auto_sync: false },
  { id: 'integ_ebay', business_id: 'biz_demo', channel: 'ebay', name: 'eBay Store', is_connected: false, orders_synced_count: 0, auto_sync: false },
  { id: 'integ_etsy', business_id: 'biz_demo', channel: 'etsy', name: 'Etsy Shop', is_connected: false, orders_synced_count: 0, auto_sync: false }
];

const DEFAULT_PRODUCTS = [
  {
    id: 'prod_demo_1',
    business_id: 'biz_demo',
    title: 'Classic Cotton T-Shirt',
    name: 'Classic Cotton T-Shirt',
    sku: 'TSHIRT-001',
    selling_price: 24.99,
    cost_price: 8.5,
    stock: 120,
    category: 'Apparel',
    variants: [{ name: 'M / Black' }, { name: 'L / Black' }, { name: 'M / White' }]
  },
  {
    id: 'prod_demo_2',
    business_id: 'biz_demo',
    title: 'Wireless Earbuds Pro',
    name: 'Wireless Earbuds Pro',
    sku: 'EARBUD-PRO',
    selling_price: 59.0,
    cost_price: 22.0,
    stock: 45,
    category: 'Electronics',
    variants: []
  },
  {
    id: 'prod_demo_3',
    business_id: 'biz_demo',
    title: 'Ceramic Coffee Mug',
    name: 'Ceramic Coffee Mug',
    sku: 'MUG-01',
    selling_price: 14.5,
    cost_price: 3.2,
    stock: 200,
    category: 'Home',
    variants: [{ name: 'White' }, { name: 'Black' }]
  }
];

interface AppState {
  currentUser: UserProfile;
  activeBusinessId: string;
  workspaces: BusinessWorkspace[];
  members: any[];
  products: any[];
  customers: any[];
  orders: any[];
  couriers: any[];
  shipments: any[];
  expenses: any[];
  stockMovements: any[];
  notifications: AppNotification[];
  integrations: ECommerceIntegration[];
  whiteLabel: WhiteLabelConfig;
}

const DEFAULT_STATE: AppState = {
  currentUser: defaultUser,
  activeBusinessId: 'biz_demo',
  workspaces: [defaultWorkspace],
  members: [],
  products: [...DEFAULT_PRODUCTS],
  customers: [],
  orders: [],
  couriers: [],
  shipments: [],
  expenses: [],
  stockMovements: [],
  notifications: [],
  integrations: DEFAULT_INTEGRATIONS,
  whiteLabel: defaultWhiteLabel
};

function ensureProducts(state: AppState): AppState {
  const bid = state.activeBusinessId || 'biz_demo';
  let products = state.products || [];
  if (!products.length) {
    products = DEFAULT_PRODUCTS.map((p) => ({ ...p, business_id: bid }));
  }
  return { ...state, products };
}

function ensureIntegrations(state: AppState): AppState {
  const bid = state.activeBusinessId || 'biz_demo';
  let integrations = state.integrations || [];
  if (!integrations.length) {
    integrations = DEFAULT_INTEGRATIONS.map((i) => ({ ...i, business_id: bid }));
  } else {
    const channels = new Set(integrations.map((i) => i.channel));
    for (const def of DEFAULT_INTEGRATIONS) {
      if (!channels.has(def.channel)) {
        integrations = [...integrations, { ...def, id: `${def.id}_${bid}`, business_id: bid }];
      }
    }
  }
  integrations = integrations.map((i) => ({ ...i, business_id: i.business_id || bid }));
  return { ...state, integrations };
}

function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged: AppState = {
        ...DEFAULT_STATE,
        ...parsed,
        workspaces: parsed.workspaces?.length ? parsed.workspaces : DEFAULT_STATE.workspaces,
        whiteLabel: { ...DEFAULT_STATE.whiteLabel, ...(parsed.whiteLabel || {}) },
        integrations: parsed.integrations?.length ? parsed.integrations : DEFAULT_STATE.integrations
      };
      return ensureProducts(ensureIntegrations(merged));
    }
  } catch {}
  return ensureProducts(ensureIntegrations(DEFAULT_STATE));
}

let currentState: AppState = loadInitialState();
const listeners = new Set<() => void>();

function saveState(state: AppState) {
  currentState = ensureProducts(ensureIntegrations(state));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch {}
  listeners.forEach((fn) => fn());
}

export const OrderFlowStore = {
  getState: () => currentState,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  setActiveWorkspace(id: string) {
    saveState({ ...currentState, activeBusinessId: id });
  },

  setCurrentUser(user: UserProfile) {
    saveState({ ...currentState, currentUser: user });
  },

  switchUserRole(role: any) {
    saveState({
      ...currentState,
      currentUser: { ...currentState.currentUser, role }
    });
  },

  createWorkspace(ws: any) {
    const id = `biz_${Date.now()}`;
    const newWs = { ...ws, id, created_at: new Date().toISOString() };
    const channelCopies: ECommerceIntegration[] = DEFAULT_INTEGRATIONS.map((i) => ({
      ...i,
      id: `${i.id}_${id}`,
      business_id: id,
      is_connected: false,
      orders_synced_count: 0
    }));
    saveState({
      ...currentState,
      workspaces: [...currentState.workspaces, newWs],
      integrations: [...currentState.integrations, ...channelCopies],
      activeBusinessId: id
    });
    return newWs;
  },

  updateWorkspace(id: string, updates: any) {
    saveState({
      ...currentState,
      workspaces: currentState.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w))
    });
  },

  addProduct(p: any) {
    const np = { ...p, id: `prod_${Date.now()}`, business_id: currentState.activeBusinessId };
    saveState({ ...currentState, products: [np, ...currentState.products] });
    return np;
  },

  updateProduct(id: string, u: any) {
    saveState({
      ...currentState,
      products: currentState.products.map((p) => (p.id === id ? { ...p, ...u } : p))
    });
  },

  deleteProduct(id: string) {
    saveState({
      ...currentState,
      products: currentState.products.filter((p) => p.id !== id)
    });
  },

  adjustStock() {},

  createOrder(orderData: any) {
    try {
      if (!orderData || !orderData.customerName) {
        return { success: false, error: 'Customer name is required.' };
      }
      const itemsIn = Array.isArray(orderData.items) ? orderData.items : [];
      if (!itemsIn.length) {
        return { success: false, error: 'At least one product item is required.' };
      }

      const bid = currentState.activeBusinessId;
      const id = `ord_${Date.now()}`;
      const orderNumber = `OF-${String(1000 + currentState.orders.length + 1)}`;
      const ws = currentState.workspaces.find((w) => w.id === bid);
      const currency = orderData.currencyCode || ws?.currency || 'USD';
      const currencySymbol = orderData.currencySymbol || ws?.currency_symbol || '$';

      let subtotal = 0;
      const items = itemsIn.map((it: any, idx: number) => {
        const qty = Number(it.quantity) || 1;
        const catalog = currentState.products.find(
          (p: any) => p.id === (it.productId || it.product_id)
        );
        const unit =
          Number(it.unitPrice ?? it.unit_price ?? it.price) ||
          Number(catalog?.selling_price) ||
          0;
        const unitCost =
          Number(it.unitCost ?? it.unit_cost) ||
          Number(catalog?.cost_price ?? catalog?.purchase_price) ||
          0;
        const line = qty * unit;
        subtotal += line;
        return {
          id: `oi_${Date.now()}_${idx}`,
          order_id: id,
          product_id: it.productId || it.product_id || catalog?.id || '',
          product_title:
            it.productTitle ||
            it.product_title ||
            it.title ||
            catalog?.title ||
            catalog?.name ||
            'Item',
          variant_name: it.variantName || it.variant_name,
          sku: it.sku || catalog?.sku || '',
          quantity: qty,
          unit_price: unit,
          unit_cost: unitCost,
          total_price: line
        };
      });

      const discount = Number(orderData.discount) || 0;
      const delivery = Number(orderData.deliveryCharge ?? orderData.delivery_charge) || 0;
      const tax = Number(orderData.taxAmount ?? orderData.tax_amount) || 0;
      const total = Math.max(0, subtotal - discount + delivery + tax);
      const totalCost = items.reduce((s: number, it: any) => s + it.unit_cost * it.quantity, 0);
      const now = new Date().toISOString();

      const order: any = {
        id,
        order_number: orderNumber,
        business_id: bid,
        customer_id: orderData.customerId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone || '',
        customer_email: orderData.customerEmail,
        shipping_address: orderData.shippingAddress || orderData.address || { city: orderData.shippingCity || '' },
        shipping_city: orderData.shippingCity,
        shipping_country_code: orderData.shippingCountryCode,
        address: orderData.address || orderData.shippingAddress,
        status: 'pending',
        payment_status: orderData.paymentStatus || 'unpaid',
        payment_method: orderData.paymentMethod || 'cod',
        currency,
        currency_code: currency,
        currency_symbol: currencySymbol,
        subtotal,
        discount,
        delivery_charge: delivery,
        tax_amount: tax,
        total_amount: total,
        total_cost: totalCost,
        estimated_profit: total - totalCost,
        items,
        courier_name: orderData.courierProvider,
        package_weight_kg: orderData.packageWeightKg,
        internal_notes: orderData.internalNotes,
        timeline: [
          {
            id: `tl_${Date.now()}`,
            timestamp: now,
            status: 'pending',
            note: 'Order created',
            actor_name: currentState.currentUser?.full_name || 'System'
          }
        ],
        created_at: now,
        updated_at: now
      };

      let customers = currentState.customers;
      if (!orderData.customerId && orderData.customerName) {
        const custId = `cust_${Date.now()}`;
        customers = [
          {
            id: custId,
            business_id: bid,
            name: orderData.customerName,
            phone: orderData.customerPhone || '',
            email: orderData.customerEmail,
            city: orderData.shippingCity || '',
            category: 'new',
            total_orders: 1,
            total_spent: total,
            created_at: now
          },
          ...customers
        ];
        order.customer_id = custId;
      }

      saveState({
        ...currentState,
        orders: [order, ...currentState.orders],
        customers
      });

      return { success: true, order };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to create order' };
    }
  },

  updateOrderStatus(orderId: string, status: string, note?: string) {
    const now = new Date().toISOString();
    saveState({
      ...currentState,
      orders: currentState.orders.map((o: any) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updated_at: now,
              timeline: [
                ...(o.timeline || []),
                {
                  id: `tl_${Date.now()}`,
                  timestamp: now,
                  status,
                  note: note || `Status → ${status}`,
                  actor_name: currentState.currentUser?.full_name || 'System'
                }
              ]
            }
          : o
      )
    });
  },

  deleteOrder(orderId: string) {
    saveState({
      ...currentState,
      orders: currentState.orders.filter((o: any) => o.id !== orderId)
    });
  },

  addCustomer(c: any) {
    const nc = { ...c, id: `cust_${Date.now()}`, business_id: currentState.activeBusinessId };
    saveState({ ...currentState, customers: [nc, ...currentState.customers] });
    return nc;
  },

  updateCustomer() {},
  deleteCustomer() {},
  updateCourierConfig() {},
  createShipment() {},
  updateShipmentStatus() {},
  addExpense() {},
  updateExpense() {},
  deleteExpense() {},

  toggleIntegrationConnection(id: string, isConnected: boolean) {
    saveState({
      ...currentState,
      integrations: currentState.integrations.map((i) =>
        i.id === id
          ? { ...i, is_connected: isConnected, last_sync_at: isConnected ? new Date().toISOString() : i.last_sync_at }
          : i
      )
    });
  },

  syncChannelOrders(id: string, importedCount = 1) {
    const n = typeof importedCount === 'number' ? importedCount : 1;
    saveState({
      ...currentState,
      integrations: currentState.integrations.map((i) =>
        i.id === id
          ? {
              ...i,
              last_sync_at: new Date().toISOString(),
              orders_synced_count: (i.orders_synced_count || 0) + n
            }
          : i
      )
    });
    return n;
  },

  updateWhiteLabel(u: any) {
    saveState({
      ...currentState,
      whiteLabel: { ...currentState.whiteLabel, ...u }
    });
  },

  markNotificationAsRead() {},
  markAllNotificationsAsRead() {},

  resetToDemoData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    saveState({
      ...DEFAULT_STATE,
      products: [...DEFAULT_PRODUCTS],
      integrations: [...DEFAULT_INTEGRATIONS]
    });
  }
};

export function useOrderFlowStore() {
  const [state, setState] = useState(currentState);

  useEffect(() => {
    if (!currentState.integrations?.length || !currentState.products?.length) {
      saveState(ensureProducts(ensureIntegrations(currentState)));
    }
    return OrderFlowStore.subscribe(() => setState(OrderFlowStore.getState()));
  }, []);

  const activeWorkspace =
    state.workspaces.find((w) => w.id === state.activeBusinessId) || state.workspaces[0];
  const bid = state.activeBusinessId;

  let integrations = state.integrations.filter((i: any) => i.business_id === bid);
  if (!integrations.length) {
    integrations = state.integrations.length
      ? state.integrations
      : DEFAULT_INTEGRATIONS.map((i) => ({ ...i, business_id: bid }));
  }

  return {
    state,
    currentUser: state.currentUser,
    activeWorkspace,
    workspaces: state.workspaces,
    members: state.members.filter((m: any) => m.business_id === bid),
    products: (() => {
      const filtered = state.products.filter((p: any) => p.business_id === bid);
      return filtered.length ? filtered : state.products;
    })(),
    orders: state.orders.filter((o: any) => o.business_id === bid),
    customers: state.customers.filter((c: any) => c.business_id === bid),
    couriers: state.couriers.filter((c: any) => c.business_id === bid),
    shipments: state.shipments.filter((s: any) => s.business_id === bid),
    expenses: state.expenses.filter((e: any) => e.business_id === bid),
    notifications: state.notifications.filter((n: any) => n.business_id === bid),
    integrations,
    stockMovements: state.stockMovements.filter((m: any) => m.business_id === bid),
    whiteLabel: state.whiteLabel,
    actions: OrderFlowStore
  };
}
