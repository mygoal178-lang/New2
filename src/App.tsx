/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useOrderFlowStore } from './services/store';
import { LandingPage } from './components/landing/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { OrdersView } from './components/orders/OrdersView';
import { NewOrderModal } from './components/orders/NewOrderModal';
import { InvoiceModal } from './components/invoices/InvoiceModal';
import { InventoryView } from './components/inventory/InventoryView';
import { CustomersView } from './components/customers/CustomersView';
import { CouriersView } from './components/couriers/CouriersView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { SettingsView } from './components/settings/SettingsView';
import { HandoverView } from './components/handover/HandoverView';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Order } from './types';
import { can, canAccessTab, defaultTabForRole } from './services/rbac';

export default function App() {
  const {
    state,
    currentUser,
    activeWorkspace,
    workspaces,
    members,
    products,
    orders,
    customers,
    couriers,
    shipments,
    expenses,
    notifications,
    stockMovements,
    whiteLabel,
    integrations,
    actions
  } = useOrderFlowStore();

  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || false;
  });

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // RBAC: leave forbidden tabs when role changes
  useEffect(() => {
    if (viewMode !== 'app') return;
    if (!canAccessTab(currentUser.role, currentTab)) {
      setCurrentTab(defaultTabForRole(currentUser.role));
    }
  }, [currentUser.role, currentTab, viewMode]);

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          whiteLabel={whiteLabel}
          onEnterApp={() => setViewMode('app')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          whiteLabel={whiteLabel}
          onAuthenticate={(user) => {
            actions.setCurrentUser(user);
            setCurrentTab(defaultTabForRole(user.role));
            setViewMode('app');
          }}
        />
      </>
    );
  }

  const role = currentUser.role;

  return (
    <AppLayout
      currentTab={currentTab}
      onTabChange={(tab) => {
        if (canAccessTab(role, tab)) setCurrentTab(tab);
      }}
      workspace={activeWorkspace}
      workspaces={workspaces}
      currentUser={currentUser}
      whiteLabel={whiteLabel}
      notifications={notifications}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      onSwitchWorkspace={(id) => actions.setActiveWorkspace(id)}
      onSwitchRole={(r) => actions.switchUserRole(r)}
      onResetDemoData={() => {
        if (can(role, 'workspace:reset_demo')) actions.resetToDemoData();
      }}
      onOpenNewOrder={() => {
        if (can(role, 'orders:create')) setIsNewOrderModalOpen(true);
      }}
      onOpenOnboarding={() => {
        if (can(role, 'workspace:create')) setIsOnboardingOpen(true);
      }}
      onReturnToLanding={() => setViewMode('landing')}
      onMarkNotificationRead={(id) => actions.markNotificationAsRead(id)}
      onMarkAllNotificationsRead={() => actions.markAllNotificationsAsRead()}
    >
      {currentTab === 'dashboard' && canAccessTab(role, 'dashboard') && (
        <DashboardView
          orders={orders}
          products={products}
          expenses={expenses}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onNavigateTab={(tab) => {
            if (canAccessTab(role, tab)) setCurrentTab(tab);
          }}
          onOpenNewOrder={() => {
            if (can(role, 'orders:create')) setIsNewOrderModalOpen(true);
          }}
          onSelectOrder={(ord) => {
            setSelectedOrder(ord);
            setCurrentTab('orders');
          }}
        />
      )}

      {currentTab === 'orders' && canAccessTab(role, 'orders') && (
        <OrdersView
          orders={orders}
          products={products}
          customers={customers}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          selectedOrder={selectedOrder}
          onSelectOrder={setSelectedOrder}
          onOpenNewOrder={() => {
            if (can(role, 'orders:create')) setIsNewOrderModalOpen(true);
          }}
          onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
          onUpdateStatus={(orderId, st, note) => {
            if (can(role, 'orders:update_status')) actions.updateOrderStatus(orderId, st, note);
          }}
          onDeleteOrder={(orderId) => {
            if (can(role, 'orders:delete')) actions.deleteOrder(orderId);
          }}
          onBookCourier={(orderId, provider) => {
            if (can(role, 'couriers:book')) actions.createShipment(orderId, provider);
          }}
        />
      )}

      {currentTab === 'inventory' && canAccessTab(role, 'inventory') && (
        <InventoryView
          products={products}
          stockMovements={stockMovements}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onAddProduct={(prod) => {
            if (can(role, 'inventory:create')) actions.addProduct(prod);
          }}
          onUpdateProduct={(id, updates) => {
            if (can(role, 'inventory:edit')) actions.updateProduct(id, updates);
          }}
          onDeleteProduct={(id) => {
            if (can(role, 'inventory:delete')) actions.deleteProduct(id);
          }}
          onAdjustStock={(prodId, varId, change, type, notes) => {
            if (can(role, 'inventory:adjust_stock'))
              actions.adjustStock(prodId, varId, change, type, notes);
          }}
        />
      )}

      {currentTab === 'customers' && canAccessTab(role, 'customers') && (
        <CustomersView
          customers={customers}
          orders={orders}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onAddCustomer={(c) => {
            if (can(role, 'customers:create')) actions.addCustomer(c);
          }}
          onUpdateCustomer={(id, updates) => {
            if (can(role, 'customers:edit')) actions.updateCustomer(id, updates);
          }}
          onDeleteCustomer={(id) => {
            if (can(role, 'customers:delete')) actions.deleteCustomer(id);
          }}
          onSelectOrder={(ord) => {
            setSelectedOrder(ord);
            setCurrentTab('orders');
          }}
        />
      )}

      {currentTab === 'couriers' && canAccessTab(role, 'couriers') && (
        <CouriersView
          couriers={couriers}
          shipments={shipments}
          orders={orders}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onUpdateCourierConfig={(cid, updates) => {
            if (can(role, 'couriers:configure')) actions.updateCourierConfig(cid, updates);
          }}
          onCreateShipment={(orderId, provider) => {
            if (can(role, 'couriers:book')) actions.createShipment(orderId, provider);
          }}
          onUpdateShipmentStatus={(sid, st) => actions.updateShipmentStatus(sid, st)}
          onSelectOrder={(ord) => {
            setSelectedOrder(ord);
            setCurrentTab('orders');
          }}
        />
      )}

      {currentTab === 'integrations' && canAccessTab(role, 'integrations') && (
        <IntegrationsView
          integrations={integrations.length ? integrations : state.integrations || []}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onToggleConnection={(id, isConnected) => {
            if (can(role, 'integrations:manage')) actions.toggleIntegrationConnection(id, isConnected);
          }}
          onSyncOrders={(id) => {
            if (!can(role, 'integrations:sync')) return 0;
            return actions.syncChannelOrders(id) || 0;
          }}
        />
      )}

      {currentTab === 'analytics' && canAccessTab(role, 'analytics') && (
        <AnalyticsView
          orders={orders}
          expenses={expenses}
          products={products}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
        />
      )}

      {currentTab === 'expenses' && canAccessTab(role, 'expenses') && (
        <ExpensesView
          expenses={expenses}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onAddExpense={(e) => {
            if (can(role, 'expenses:manage')) actions.addExpense(e);
          }}
          onUpdateExpense={(id, updates) => {
            if (can(role, 'expenses:manage')) actions.updateExpense(id, updates);
          }}
          onDeleteExpense={(id) => {
            if (can(role, 'expenses:manage')) actions.deleteExpense(id);
          }}
        />
      )}

      {currentTab === 'settings' && canAccessTab(role, 'settings') && (
        <SettingsView
          workspace={activeWorkspace}
          workspaces={workspaces}
          members={members}
          currentUser={currentUser}
          whiteLabel={whiteLabel}
          orders={orders}
          customers={customers}
          products={products}
          onUpdateWorkspace={(id, updates) => {
            if (can(role, 'settings:workspace')) actions.updateWorkspace(id, updates);
          }}
          onUpdateWhiteLabel={(updates) => {
            if (can(role, 'settings:whitelabel')) actions.updateWhiteLabel(updates);
          }}
          onSwitchWorkspace={(id) => actions.setActiveWorkspace(id)}
          onResetDemoData={() => {
            if (can(role, 'workspace:reset_demo')) actions.resetToDemoData();
          }}
          onOpenOnboarding={() => {
            if (can(role, 'workspace:create')) setIsOnboardingOpen(true);
          }}
        />
      )}

      {currentTab === 'handover' && canAccessTab(role, 'handover') && <HandoverView />}

      <NewOrderModal
        isOpen={isNewOrderModalOpen && can(role, 'orders:create')}
        onClose={() => setIsNewOrderModalOpen(false)}
        products={products}
        customers={customers}
        workspace={activeWorkspace}
        whiteLabel={whiteLabel}
        onSubmit={(orderData) => actions.createOrder(orderData)}
      />

      <InvoiceModal
        order={selectedInvoiceOrder}
        workspace={activeWorkspace}
        whiteLabel={whiteLabel}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        whiteLabel={whiteLabel}
        onAuthenticate={(user) => {
          actions.setCurrentUser(user);
          setCurrentTab(defaultTabForRole(user.role));
        }}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen && can(role, 'workspace:create')}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(ws, initialProd) => {
          actions.createWorkspace(ws);
          if (initialProd && can(role, 'inventory:create')) actions.addProduct(initialProd);
        }}
      />
    </AppLayout>
  );
}
