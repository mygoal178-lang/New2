/**
 * ORDERFLOW - Reactive Global SaaS State Store & Business Logic Engine
 * Supports multi-tenant global workspaces, international currency formatting,
 * tax/VAT calculations, stock safeguards, and eCommerce channel integrations.
 */

import { useState, useEffect } from 'react';
import {
  BusinessWorkspace,
  Product,
  Order,
  Customer,
  CourierConfig,
  CourierShipment,
  Expense,
  StockMovement,
  AppNotification,
  WhiteLabelConfig,
  BusinessMember,
  UserProfile,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderAddress,
  ECommerceIntegration,
  GlobalCourierProvider
} from '../types';
import {
  INITIAL_WORKSPACES,
  INITIAL_MEMBERS,
  INITIAL_COURIERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_SHIPMENTS,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_WHITE_LABEL,
  INITIAL_INTEGRATIONS
} from './mockData';
import { calculateOrderTax } from './tax';
import { getTrackingUrl } from './shipping';
import { getCurrencyConfig } from './currency';

const STORAGE_KEY = 'orderflow_global_state_v3';

export interface AppState {
  currentUser: UserProfile;
  activeBusinessId: string;
  workspaces: BusinessWorkspace[];
  members: BusinessMember[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  couriers: CourierConfig[];
  shipments: CourierShipment[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  notifications: AppNotification[];
  integrations: ECommerceIntegration[];
  whiteLabel: WhiteLabelConfig;
}

const DEFAULT_STATE: AppState = {
  currentUser: {
    id: 'usr_owner',
    email: 'alex@apexpeak.com',
    full_name: 'Alexander Wright',
    role: 'owner',
    preferred_language: 'en',
    created_at: '2025-01-10T10:00:00Z'
  },
  activeBusinessId: 'biz_us_apex',
  workspaces: INITIAL_WORKSPACES,
  members: INITIAL_MEMBERS,
  products: INITIAL_PRODUCTS,
  customers: INITIAL_CUSTOMERS,
  orders: INITIAL_ORDERS,
  couriers: INITIAL_COURIERS,
  shipments: INITIAL_SHIPMENTS,
  expenses: INITIAL_EXPENSES,
  stockMovements: [],
  notifications: INITIAL_NOTIFICATIONS,
  integrations: INITIAL_INTEGRATIONS,
  whiteLabel: INITIAL_WHITE_LABEL
};

// Singleton in-memory state with subscribers
let currentState: AppState = loadInitialState();
const listeners = new Set<() => void>();

function loadInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        workspaces: parsed.workspaces?.length ? parsed.workspaces : DEFAULT_STATE.workspaces,
        whiteLabel: { ...DEFAULT_STATE.whiteLabel, ...(parsed.whiteLabel || {}) },
        integrations: parsed.integrations?.length ? parsed.integrations : DEFAULT_STATE.integrations
      };
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }
  return DEFAULT_STATE;
}

function saveState(state: AppState) {
  currentState = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
  listeners.forEach(fn => fn());
}

export const OrderFlowStore = {
  getState(): AppState {
    return currentState;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Switch active workspace
  setActiveWorkspace(workspaceId: string) {
    saveState({
      ...currentState,
      activeBusinessId: workspaceId
    });
  },

  // Create new workspace (Global Onboarding)
  createWorkspace(workspace: Omit<BusinessWorkspace, 'id' | 'created_at'>): BusinessWorkspace {
    const newId = `biz_${Date.now()}`;
    const newWs: BusinessWorkspace = {
      ...workspace,
      id: newId,
      created_at: new Date().toISOString()
    };

    const newMember: BusinessMember = {
      id: `mem_${Date.now()}`,
      business_id: newId,
      user_id: currentState.currentUser.id,
      name: currentState.currentUser.full_name,
      email: currentState.currentUser.email,
      role: 'owner',
      joined_at: new Date().toISOString(),
      status: 'active'
    };

    // Default couriers for new workspace based on country
    const defaultCouriers: CourierConfig[] = [
      {
        id: `cour_fedex_${newId}`,
        business_id: newId,
        provider: 'fedex',
        name: 'FedEx Express & Ground',
        country_scope: 'global',
        is_connected: false,
        is_active: true,
        domestic_flat_rate: 10,
        international_flat_rate: 35,
        cash_collection_fee_pct: 0
      },
      {
        id: `cour_dhl_${newId}`,
        business_id: newId,
        provider: 'dhl',
        name: 'DHL Express Worldwide',
        country_scope: 'global',
        is_connected: false,
        is_active: true,
        domestic_flat_rate: 15,
        international_flat_rate: 30,
        cash_collection_fee_pct: 0
      }
    ];

    saveState({
      ...currentState,
      workspaces: [...currentState.workspaces, newWs],
      members: [...currentState.members, newMember],
      couriers: [...defaultCouriers, ...currentState.couriers],
      activeBusinessId: newId
    });

    return newWs;
  },

  updateWorkspace(id: string, updates: Partial<BusinessWorkspace>) {
    saveState({
      ...currentState,
      workspaces: currentState.workspaces.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  },

  // Switch current user role for testing permissions
  switchUserRole(role: 'owner' | 'admin' | 'manager' | 'staff') {
    saveState({
      ...currentState,
      currentUser: {
        ...currentState.currentUser,
        role,
        full_name: role === 'owner' ? 'Alexander Wright (Owner)' : role === 'admin' ? 'Sarah Jenkins (Admin)' : 'Marcus Chen (Staff)'
      }
    });
  },

  // --- PRODUCT & INVENTORY OPERATIONS ---
  addProduct(productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      business_id: currentState.activeBusinessId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveState({
      ...currentState,
      products: [newProduct, ...currentState.products]
    });

    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>) {
    saveState({
      ...currentState,
      products: currentState.products.map(p =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      )
    });
  },

  deleteProduct(id: string) {
    saveState({
      ...currentState,
      products: currentState.products.filter(p => p.id !== id)
    });
  },

  adjustStock(
    productId: string,
    variantId: string | undefined,
    quantityChange: number,
    movementType: StockMovement['type'],
    notes?: string
  ) {
    const product = currentState.products.find(p => p.id === productId);
    if (!product) return;

    let newStock = product.stock + quantityChange;
    if (newStock < 0) newStock = 0;

    let updatedVariants = product.variants;
    if (variantId && product.variants.length > 0) {
      updatedVariants = product.variants.map(v => {
        if (v.id === variantId) {
          return { ...v, stock: Math.max(0, v.stock + quantityChange) };
        }
        return v;
      });
    }

    const movement: StockMovement = {
      id: `mov_${Date.now()}`,
      business_id: currentState.activeBusinessId,
      product_id: productId,
      product_title: product.title,
      variant_name: variantId ? product.variants.find(v => v.id === variantId)?.name : undefined,
      quantity_change: quantityChange,
      resulting_stock: newStock,
      type: movementType,
      notes,
      created_at: new Date().toISOString()
    };

    saveState({
      ...currentState,
      products: currentState.products.map(p =>
        p.id === productId ? { ...p, stock: newStock, variants: updatedVariants, updated_at: new Date().toISOString() } : p
      ),
      stockMovements: [movement, ...currentState.stockMovements]
    });
  },

  // --- ORDER OPERATIONS (TRANSACTIONAL WITH TAX & INVENTORY DEDUCTION) ---
  createOrder(orderData: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: OrderAddress;
    items: Array<{
      productId: string;
      variantName?: string;
      quantity: number;
    }>;
    discount?: number;
    deliveryCharge?: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    courierProvider?: GlobalCourierProvider;
    internalNotes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    const { activeBusinessId, products, customers, workspaces } = currentState;
    const activeWs = workspaces.find(w => w.id === activeBusinessId) || workspaces[0];

    // Validate inventory stock
    for (const item of orderData.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ${item.productId}` };
      }
      if (prod.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.title}". Available: ${prod.stock}, Requested: ${item.quantity}`
        };
      }
    }

    // Build line items
    const orderItems = orderData.items.map((it, idx) => {
      const prod = products.find(p => p.id === it.productId)!;
      return {
        id: `oi_${Date.now()}_${idx}`,
        order_id: '',
        product_id: prod.id,
        product_title: prod.title,
        variant_name: it.variantName,
        sku: prod.sku,
        quantity: it.quantity,
        unit_price: prod.selling_price,
        unit_cost: prod.purchase_price,
        total_price: prod.selling_price * it.quantity
      };
    });

    const subtotal = orderItems.reduce((acc, it) => acc + it.total_price, 0);
    const totalCost = orderItems.reduce((acc, it) => acc + (it.unit_cost * it.quantity), 0);
    const discount = orderData.discount || 0;
    const deliveryCharge = orderData.deliveryCharge !== undefined ? orderData.deliveryCharge : 10;

    // Calculate tax based on workspace jurisdiction
    const taxCalc = calculateOrderTax(
      orderItems.map(it => ({ unit_price: it.unit_price, quantity: it.quantity })),
      deliveryCharge,
      discount,
      activeWs.tax_config
    );

    const taxAmount = taxCalc.taxAmount;
    const totalAmount = taxCalc.finalTotal;
    const estimatedProfit = Number((totalAmount - totalCost - (deliveryCharge * 0.7) - taxAmount).toFixed(2));

    const nextNum = 2000 + currentState.orders.length + 1;
    const orderNumber = `ORD-${activeWs.country_code || 'GL'}-${nextNum}`;
    const orderId = `ord_${Date.now()}`;

    // Link or create customer
    let customerId = orderData.customerId;
    let updatedCustomers = [...customers];
    if (!customerId) {
      const existing = customers.find(c => c.email && c.email === orderData.customerEmail);
      if (existing) {
        customerId = existing.id;
        updatedCustomers = updatedCustomers.map(c =>
          c.id === existing.id
            ? { ...c, total_orders: c.total_orders + 1, total_spent: c.total_spent + totalAmount, last_order_date: new Date().toISOString() }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust_${Date.now()}`,
          business_id: activeBusinessId,
          name: orderData.customerName,
          phone_country_code: orderData.shippingAddress.phone_country_code,
          phone: orderData.customerPhone,
          email: orderData.customerEmail,
          address_line1: orderData.shippingAddress.address_line1,
          address_line2: orderData.shippingAddress.address_line2,
          city: orderData.shippingAddress.city,
          state_province_region: orderData.shippingAddress.state_province_region,
          postal_zip_code: orderData.shippingAddress.postal_zip_code,
          country: orderData.shippingAddress.country,
          country_code: orderData.shippingAddress.country_code,
          category: 'new',
          total_orders: 1,
          total_spent: totalAmount,
          last_order_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        updatedCustomers.push(newCust);
        customerId = newCust.id;
      }
    }

    // Deduct stock
    const updatedProducts = products.map(p => {
      const orderedItem = orderData.items.find(it => it.productId === p.id);
      if (orderedItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - orderedItem.quantity),
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    const newMovements: StockMovement[] = orderItems.map(it => ({
      id: `mov_${Date.now()}_${it.id}`,
      business_id: activeBusinessId,
      product_id: it.product_id,
      product_title: it.product_title,
      variant_name: it.variant_name,
      quantity_change: -it.quantity,
      resulting_stock: (products.find(p => p.id === it.product_id)?.stock || 0) - it.quantity,
      type: 'sale',
      reference_order_number: orderNumber,
      notes: `Order created: ${orderNumber}`,
      created_at: new Date().toISOString()
    }));

    const now = new Date().toISOString();
    const currencyMeta = getCurrencyConfig(activeWs.currency);

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      business_id: activeBusinessId,
      customer_id: customerId,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      shipping_address: orderData.shippingAddress,
      status: 'pending',
      payment_status: orderData.paymentStatus || 'unpaid',
      payment_method: orderData.paymentMethod,
      currency: activeWs.currency,
      currency_symbol: activeWs.currency_symbol,
      exchange_rate_to_usd: currencyMeta.exchangeRateToUsd,
      subtotal,
      discount,
      delivery_charge: deliveryCharge,
      tax_amount: taxAmount,
      tax_name: taxCalc.taxLabel,
      total_amount: totalAmount,
      total_cost: totalCost,
      estimated_profit: estimatedProfit,
      items: orderItems.map(it => ({ ...it, order_id: orderId })),
      courier_id: orderData.courierProvider,
      courier_name: orderData.courierProvider ? orderData.courierProvider.toUpperCase() : undefined,
      internal_notes: orderData.internalNotes,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          timestamp: now,
          status: 'pending',
          note: 'Order recorded in system.',
          actor_name: currentState.currentUser.full_name
        }
      ],
      created_at: now,
      updated_at: now
    };

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      business_id: activeBusinessId,
      title: `New Order: ${orderNumber}`,
      message: `${orderData.customerName} placed order for ${activeWs.currency_symbol}${totalAmount.toLocaleString()}`,
      type: 'order',
      is_read: false,
      link_tab: 'orders',
      created_at: now
    };

    saveState({
      ...currentState,
      orders: [newOrder, ...currentState.orders],
      products: updatedProducts,
      customers: updatedCustomers,
      stockMovements: [...newMovements, ...currentState.stockMovements],
      notifications: [newNotif, ...currentState.notifications]
    });

    return { success: true, order: newOrder };
  },

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string) {
    const order = currentState.orders.find(o => o.id === orderId);
    if (!order || order.status === newStatus) return;

    const oldStatus = order.status;
    let paymentStatus = order.payment_status;

    if (newStatus === 'delivered' && order.payment_method === 'cod') {
      paymentStatus = 'paid';
    } else if (newStatus === 'cancelled' || newStatus === 'returned') {
      if (paymentStatus === 'paid') {
        paymentStatus = 'refunded';
      }
    }

    let updatedProducts = currentState.products;
    let newMovements: StockMovement[] = [];

    const isNowCancelledOrReturned = newStatus === 'cancelled' || newStatus === 'returned';
    const wasActive = oldStatus !== 'cancelled' && oldStatus !== 'returned';

    // Restore stock if cancelled or returned
    if (isNowCancelledOrReturned && wasActive) {
      updatedProducts = updatedProducts.map(prod => {
        const item = order.items.find(it => it.product_id === prod.id);
        if (item) {
          const restoredStock = prod.stock + item.quantity;
          newMovements.push({
            id: `mov_${Date.now()}_${item.id}`,
            business_id: currentState.activeBusinessId,
            product_id: prod.id,
            product_title: prod.title,
            quantity_change: item.quantity,
            resulting_stock: restoredStock,
            type: newStatus === 'cancelled' ? 'cancellation_restore' : 'return_restore',
            reference_order_number: order.order_number,
            notes: `Stock restored from ${newStatus} order #${order.order_number}`,
            created_at: new Date().toISOString()
          });
          return {
            ...prod,
            stock: restoredStock,
            updated_at: new Date().toISOString()
          };
        }
        return prod;
      });
    }

    const now = new Date().toISOString();
    const timelineEvent = {
      id: `tl_${Date.now()}`,
      timestamp: now,
      status: newStatus,
      note: note || `Status changed from ${oldStatus} to ${newStatus}`,
      actor_name: currentState.currentUser.full_name
    };

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      payment_status: paymentStatus,
      timeline: [timelineEvent, ...order.timeline],
      updated_at: now
    };

    saveState({
      ...currentState,
      orders: currentState.orders.map(o => o.id === orderId ? updatedOrder : o),
      products: updatedProducts,
      stockMovements: [...newMovements, ...currentState.stockMovements]
    });
  },

  deleteOrder(orderId: string) {
    saveState({
      ...currentState,
      orders: currentState.orders.filter(o => o.id !== orderId)
    });
  },

  // --- CUSTOMER CRM OPERATIONS ---
  addCustomer(customerData: Omit<Customer, 'id' | 'business_id' | 'total_orders' | 'total_spent' | 'created_at'>) {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      business_id: currentState.activeBusinessId,
      total_orders: 0,
      total_spent: 0,
      created_at: new Date().toISOString()
    };

    saveState({
      ...currentState,
      customers: [newCustomer, ...currentState.customers]
    });

    return newCustomer;
  },

  updateCustomer(id: string, updates: Partial<Customer>) {
    saveState({
      ...currentState,
      customers: currentState.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    });
  },

  deleteCustomer(id: string) {
    saveState({
      ...currentState,
      customers: currentState.customers.filter(c => c.id !== id)
    });
  },

  // --- COURIER & GLOBAL SHIPMENTS ---
  updateCourierConfig(courierId: string, updates: Partial<CourierConfig>) {
    saveState({
      ...currentState,
      couriers: currentState.couriers.map(c => c.id === courierId ? { ...c, ...updates } : c)
    });
  },

  createShipment(orderId: string, courierProvider: GlobalCourierProvider): CourierShipment | null {
    const order = currentState.orders.find(o => o.id === orderId);
    if (!order) return null;

    const courier = currentState.couriers.find(c => c.provider === courierProvider) || currentState.couriers[0];
    const isDomestic = order.shipping_address.country_code === currentState.workspaces.find(w => w.id === currentState.activeBusinessId)?.country_code;
    const fee = isDomestic ? courier.domestic_flat_rate : courier.international_flat_rate;

    const trackingId = `${courierProvider.toUpperCase()}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const trackingUrl = getTrackingUrl(courierProvider, trackingId);
    const consignmentId = `CN-${courierProvider.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const shipment: CourierShipment = {
      id: `shp_${Date.now()}`,
      business_id: currentState.activeBusinessId,
      order_id: order.id,
      order_number: order.order_number,
      courier_provider: courierProvider,
      courier_name: courier.name,
      tracking_id: trackingId,
      tracking_url: trackingUrl,
      consignment_id: consignmentId,
      cod_amount: order.payment_method === 'cod' ? order.total_amount : 0,
      delivery_fee: fee,
      status: 'in_transit',
      recipient_name: order.customer_name,
      recipient_phone: order.customer_phone,
      recipient_address_summary: `${order.shipping_address.city}, ${order.shipping_address.state_province_region} ${order.shipping_address.country_code}`,
      destination_country: order.shipping_address.country,
      weight: order.package_weight || 1.5,
      weight_unit: order.package_weight_unit || 'lb',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const now = new Date().toISOString();
    const updatedOrder: Order = {
      ...order,
      status: 'shipped',
      courier_id: courier.id,
      courier_name: courier.name,
      courier_tracking_id: trackingId,
      courier_tracking_url: trackingUrl,
      consignment_id: consignmentId,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          timestamp: now,
          status: 'shipped',
          note: `Shipment booked with ${courier.name}. Tracking: ${trackingId}`,
          actor_name: currentState.currentUser.full_name
        },
        ...order.timeline
      ],
      updated_at: now
    };

    saveState({
      ...currentState,
      shipments: [shipment, ...currentState.shipments],
      orders: currentState.orders.map(o => o.id === orderId ? updatedOrder : o)
    });

    return shipment;
  },

  updateShipmentStatus(shipmentId: string, status: CourierShipment['status']) {
    saveState({
      ...currentState,
      shipments: currentState.shipments.map(s =>
        s.id === shipmentId ? { ...s, status, updated_at: new Date().toISOString() } : s
      )
    });
  },

  // --- E-COMMERCE CHANNEL INTEGRATIONS ---
  toggleIntegrationConnection(integrationId: string, isConnected: boolean) {
    saveState({
      ...currentState,
      integrations: currentState.integrations.map(integ =>
        integ.id === integrationId ? { ...integ, is_connected: isConnected, last_sync_at: new Date().toISOString() } : integ
      )
    });
  },

  syncChannelOrders(integrationId: string): number {
    const integ = currentState.integrations.find(i => i.id === integrationId);
    if (!integ || !integ.is_connected) return 0;

    const importedCount = Math.floor(2 + Math.random() * 4);
    const now = new Date().toISOString();

    saveState({
      ...currentState,
      integrations: currentState.integrations.map(i =>
        i.id === integrationId
          ? { ...i, orders_synced_count: i.orders_synced_count + importedCount, last_sync_at: now }
          : i
      ),
      notifications: [
        {
          id: `notif_${Date.now()}`,
          business_id: currentState.activeBusinessId,
          title: `${integ.name} Synchronized`,
          message: `Successfully imported ${importedCount} new orders and verified inventory levels.`,
          type: 'integration',
          is_read: false,
          link_tab: 'orders',
          created_at: now
        },
        ...currentState.notifications
      ]
    });

    return importedCount;
  },

  // --- EXPENSE OPERATIONS ---
  addExpense(expenseData: Omit<Expense, 'id' | 'business_id' | 'created_at'>) {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      business_id: currentState.activeBusinessId,
      created_at: new Date().toISOString()
    };

    saveState({
      ...currentState,
      expenses: [newExpense, ...currentState.expenses]
    });

    return newExpense;
  },

  updateExpense(id: string, updates: Partial<Expense>) {
    saveState({
      ...currentState,
      expenses: currentState.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
    });
  },

  deleteExpense(id: string) {
    saveState({
      ...currentState,
      expenses: currentState.expenses.filter(e => e.id !== id)
    });
  },

  // --- NOTIFICATION OPERATIONS ---
  markNotificationAsRead(id: string) {
    saveState({
      ...currentState,
      notifications: currentState.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
    });
  },

  markAllNotificationsAsRead() {
    saveState({
      ...currentState,
      notifications: currentState.notifications.map(n => ({ ...n, is_read: true }))
    });
  },

  // --- WHITE LABEL OPERATIONS ---
  updateWhiteLabel(updates: Partial<WhiteLabelConfig>) {
    saveState({
      ...currentState,
      whiteLabel: { ...currentState.whiteLabel, ...updates }
    });
  },

  // --- DEMO RESET ---
  resetToDemoData() {
    saveState({
      ...DEFAULT_STATE,
      workspaces: INITIAL_WORKSPACES,
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      shipments: INITIAL_SHIPMENTS,
      expenses: INITIAL_EXPENSES,
      notifications: INITIAL_NOTIFICATIONS,
      integrations: INITIAL_INTEGRATIONS,
      whiteLabel: INITIAL_WHITE_LABEL
    });
  }
};

// React Hook
export function useOrderFlowStore() {
  const [state, setState] = useState<AppState>(OrderFlowStore.getState());

  useEffect(() => {
    return OrderFlowStore.subscribe(() => {
      setState(OrderFlowStore.getState());
    });
  }, []);

  const activeWorkspace = state.workspaces.find(w => w.id === state.activeBusinessId) || state.workspaces[0];

  const workspaceProducts = state.products.filter(p => p.business_id === state.activeBusinessId);
  const workspaceOrders = state.orders.filter(o => o.business_id === state.activeBusinessId);
  const workspaceCustomers = state.customers.filter(c => c.business_id === state.activeBusinessId);
  const workspaceCouriers = state.couriers.filter(c => c.business_id === state.activeBusinessId);
  const workspaceShipments = state.shipments.filter(s => s.business_id === state.activeBusinessId);
  const workspaceExpenses = state.expenses.filter(e => e.business_id === state.activeBusinessId);
  const workspaceNotifications = state.notifications.filter(n => n.business_id === state.activeBusinessId);
  const workspaceIntegrations = state.integrations.filter(i => i.business_id === state.activeBusinessId);

  return {
    state,
    currentUser: state.currentUser,
    activeWorkspace,
    workspaces: state.workspaces,
    members: state.members.filter(m => m.business_id === state.activeBusinessId),
    products: workspaceProducts,
    orders: workspaceOrders,
    customers: workspaceCustomers,
    couriers: workspaceCouriers,
    shipments: workspaceShipments,
    expenses: workspaceExpenses,
    notifications: workspaceNotifications,
    integrations: workspaceIntegrations,
    stockMovements: state.stockMovements.filter(m => m.business_id === state.activeBusinessId),
    whiteLabel: state.whiteLabel,
    actions: OrderFlowStore
  };
}
