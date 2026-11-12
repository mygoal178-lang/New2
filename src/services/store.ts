/**
 * OrderFlow store (restored enough for UI + channel integrations).
 * Seeds default Shopify, WooCommerce, Amazon integration cards so the
 * Channel Integrations page is never empty.
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

/** Always-available channel cards (shown on Integrations page) */
const DEFAULT_INTEGRATIONS: ECommerceIntegration[] = [
  {
    id: 'integ_shopify',
    business_id: 'biz_demo',
    channel: 'shopify',
    name: 'Shopify Storefront',
    is_connected: false,
    store_url: '',
    orders_synced_count: 0,
    auto_sync: false
  },
  {
    id: 'integ_woo',
    business_id: 'biz_demo',
    channel: 'woocommerce',
    name: 'WooCommerce Store',
    is_connected: false,
    store_url: '',
    orders_synced_count: 0,
    auto_sync: false
  },
  {
    id: 'integ_amazon',
    business_id: 'biz_demo',
    channel: 'amazon',
    name: 'Amazon Marketplace',
    is_connected: false,
    orders_synced_count: 0,
    auto_sync: false
  },
  {
    id: 'integ_ebay',
    business_id: 'biz_demo',
    channel: 'ebay',
    name: 'eBay Store',
    is_connected: false,
    orders_synced_count: 0,
    auto_sync: false
  },
  {
    id: 'integ_etsy',
    business_id: 'biz_demo',
    channel: 'etsy',
    name: 'Etsy Shop',
    is_connected: false,
    orders_synced_count: 0,
    auto_sync: false
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
  products: [],
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

function ensureIntegrations(state: AppState): AppState {
  const bid = state.activeBusinessId || 'biz_demo';
  let integrations = state.integrations || [];

  // If empty or missing core channels, seed defaults for active workspace
  if (!integrations.length) {
    integrations = DEFAULT_INTEGRATIONS.map((i) => ({ ...i, business_id: bid }));
  } else {
    const channels = new Set(integrations.map((i) => i.channel));
    for (const def of DEFAULT_INTEGRATIONS) {
      if (!channels.has(def.channel)) {
        integrations = [
          ...integrations,
          { ...def, id: `${def.id}_${bid}`, business_id: bid }
        ];
      }
    }
  }

  // Ensure every integration has a business_id matching a workspace when possible
  integrations = integrations.map((i) => ({
    ...i,
    business_id: i.business_id || bid
  }));

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
      return ensureIntegrations(merged);
    }
  } catch {}
  return ensureIntegrations(DEFAULT_STATE);
}

let currentState: AppState = loadInitialState();
const listeners = new Set<() => void>();

function saveState(state: AppState) {
  currentState = ensureIntegrations(state);
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
      workspaces: currentState.workspaces.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      )
    });
  },

  addProduct(p: any) {
    const np = {
      ...p,
      id: `prod_${Date.now()}`,
      business_id: currentState.activeBusinessId
    };
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

  createOrder() {
    return { success: false, error: 'Use full store for order creation, or add products first.' };
  },

  updateOrderStatus() {},
  deleteOrder() {},

  addCustomer(c: any) {
    const nc = {
      ...c,
      id: `cust_${Date.now()}`,
      business_id: currentState.activeBusinessId
    };
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
          ? {
              ...i,
              is_connected: isConnected,
              last_sync_at: isConnected ? new Date().toISOString() : i.last_sync_at
            }
          : i
      )
    });
  },

  /** Bump sync counter; returns count added (for UI). */
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
    saveState({ ...DEFAULT_STATE, integrations: [...DEFAULT_INTEGRATIONS] });
  }
};

export function useOrderFlowStore() {
  const [state, setState] = useState(currentState);

  useEffect(() => {
    // Re-ensure integrations on mount (fixes empty list from old localStorage)
    if (!currentState.integrations?.length) {
      saveState(ensureIntegrations(currentState));
    }
    return OrderFlowStore.subscribe(() => setState(OrderFlowStore.getState()));
  }, []);

  const activeWorkspace =
    state.workspaces.find((w) => w.id === state.activeBusinessId) || state.workspaces[0];
  const bid = state.activeBusinessId;

  // Integrations: show for active workspace; if none match, show all seeded (avoid blank page)
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
    products: state.products.filter((p: any) => p.business_id === bid),
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
