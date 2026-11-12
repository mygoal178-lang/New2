/**
 * EMERGENCY minimal store — page was white because store threw on load.
 * Replace this file with the full version from commit 0ce64fb8d196f7584f97d63e96dd4fe69e563cfb
 * (src/services/store.ts) as soon as possible.
 */
import { useState, useEffect } from 'react';
import type { UserProfile, BusinessWorkspace, WhiteLabelConfig, AppNotification } from '../types';

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
  phone: '',
  email: 'demo@local.dev',
  address: '',
  city: '',
  timezone: 'UTC',
  tax_config: { enabled: false, rate: 0, name: 'Tax', inclusive: false } as any,
  created_at: new Date().toISOString()
} as any;

const defaultWhiteLabel: WhiteLabelConfig = {
  app_name: 'OrderFlow',
  primary_color: '#4f46e5',
  logo_url: '',
  invoice_footer: '',
  support_email: ''
} as any;

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
  integrations: any[];
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
  integrations: [],
  whiteLabel: defaultWhiteLabel
};

let currentState: AppState = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed, workspaces: parsed.workspaces?.length ? parsed.workspaces : DEFAULT_STATE.workspaces };
    }
  } catch {}
  return DEFAULT_STATE;
})();

const listeners = new Set<() => void>();

function saveState(state: AppState) {
  currentState = state;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  listeners.forEach(fn => fn());
}

export const OrderFlowStore = {
  getState: () => currentState,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  setActiveWorkspace(id: string) { saveState({ ...currentState, activeBusinessId: id }); },
  setCurrentUser(user: UserProfile) { saveState({ ...currentState, currentUser: user }); },
  switchUserRole(role: any) {
    saveState({ ...currentState, currentUser: { ...currentState.currentUser, role } });
  },
  createWorkspace(ws: any) {
    const id = `biz_${Date.now()}`;
    const newWs = { ...ws, id, created_at: new Date().toISOString() };
    saveState({
      ...currentState,
      workspaces: [...currentState.workspaces, newWs],
      activeBusinessId: id
    });
    return newWs;
  },
  updateWorkspace(id: string, updates: any) {
    saveState({
      ...currentState,
      workspaces: currentState.workspaces.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  },
  addProduct: (p: any) => { const np = { ...p, id: `prod_${Date.now()}`, business_id: currentState.activeBusinessId }; saveState({ ...currentState, products: [np, ...currentState.products] }); return np; },
  updateProduct: (id: string, u: any) => saveState({ ...currentState, products: currentState.products.map(p => p.id === id ? { ...p, ...u } : p) }),
  deleteProduct: (id: string) => saveState({ ...currentState, products: currentState.products.filter(p => p.id !== id) }),
  adjustStock: () => {},
  createOrder: () => ({ success: false, error: 'Full store not restored yet' }),
  updateOrderStatus: () => {},
  deleteOrder: () => {},
  addCustomer: (c: any) => { const nc = { ...c, id: `cust_${Date.now()}`, business_id: currentState.activeBusinessId }; saveState({ ...currentState, customers: [nc, ...currentState.customers] }); return nc; },
  updateCustomer: () => {},
  deleteCustomer: () => {},
  updateCourierConfig: () => {},
  createShipment: () => {},
  updateShipmentStatus: () => {},
  addExpense: () => {},
  updateExpense: () => {},
  deleteExpense: () => {},
  toggleIntegrationConnection: () => {},
  syncChannelOrders: () => {},
  updateWhiteLabel: (u: any) => saveState({ ...currentState, whiteLabel: { ...currentState.whiteLabel, ...u } }),
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
  resetToDemoData: () => saveState(DEFAULT_STATE)
};

export function useOrderFlowStore() {
  const [state, setState] = useState(currentState);
  useEffect(() => OrderFlowStore.subscribe(() => setState(OrderFlowStore.getState())), []);
  const activeWorkspace = state.workspaces.find(w => w.id === state.activeBusinessId) || state.workspaces[0];
  const bid = state.activeBusinessId;
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
    integrations: state.integrations.filter((i: any) => i.business_id === bid),
    stockMovements: state.stockMovements.filter((m: any) => m.business_id === bid),
    whiteLabel: state.whiteLabel,
    actions: OrderFlowStore
  };
}
