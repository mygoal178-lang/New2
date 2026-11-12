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
import { Order, OrderStatus } from './types';

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
            setViewMode('app');
          }}
        />
      </>
    );
  }

  return (
    <AppLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      workspace={activeWorkspace}
      workspaces={workspaces}
      currentUser={currentUser}
      whiteLabel={whiteLabel}
      notifications={notifications}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      onSwitchWorkspace={(id) => actions.setActiveWorkspace(id)}
      onSwitchRole={(r) => actions.switchUserRole(r)}
      onResetDemoData={() => actions.resetToDemoData()}
      onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
      onOpenOnboarding={() => setIsOnboardingOpen(true)}
      onReturnToLanding={() => setViewMode('landing')}
      onMarkNotificationRead={(id) => actions.markNotificationAsRead(id)}
      onMarkAllNotificationsRead={() => actions.markAllNotificationsAsRead()}
    >
      {currentTab === 'dashboard' && (
        <DashboardView
          orders={orders}
          products={products}
          expenses={expenses}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onNavigateTab={setCurrentTab}
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          onSelectOrder={(ord) => {
            setSelectedOrder(ord);
            setCurrentTab('orders');
          }}
        />
      )}

      {currentTab === 'orders' && (
        <OrdersView
          orders={orders}
          products={products}
          customers={customers}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          selectedOrder={selectedOrder}
          onSelectOrder={setSelectedOrder}
          onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          onOpenInvoice={(ord) => setSelectedInvoiceOrder(ord)}
          onUpdateStatus={(orderId, st, note) => actions.updateOrderStatus(orderId, st, note)}
          onDeleteOrder={(orderId) => actions.deleteOrder(orderId)}
          onBookCourier={(orderId, provider) => {
            actions.createShipment(orderId, provider);
          }}
        />
      )}

      {currentTab === 'inventory' && (
        <InventoryView
          products={products}
          stockMovements={stockMovements}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onAddProduct={(prod) => actions.addProduct(prod)}
          onUpdateProduct={(id, updates) => actions.updateProduct(id, updates)}
          onDeleteProduct={(id) => actions.deleteProduct(id)}
          onAdjustStock={(prodId, varId, change, type, notes) =>
            actions.adjustStock(prodId, varId, change, type, notes)
          }
        />
      )}

      {currentTab === 'customers' && (
        <CustomersView
          customers={customers}
          orders={orders}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onAddCustomer={(c) => actions.addCustomer(c)}
          onUpdateCustomer={(id, updates) => actions.updateCustomer(id, updates)}
          onDeleteCustomer={(id) => actions.deleteCustomer(id)}
          onSelectOrder={(ord) => {
            setSelectedOrder(ord);
            setCurrentTab('orders');
          }}
        />
      )}

      {currentTab === 'couriers' && (
        <CouriersView
          couriers={couriers}
          shipments={shipments}
          orders={orders}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onUpdateCourierConfig={(cid, updates) => actions.updateCourierConfig(cid, updates)}
          onCreateShipment={(orderId, provider) => actions.createShipment(orderId, provider)}
          onUpdateShipmentStatus={(sid, st) => actions.updateShipmentStatus(sid, st)}
          onSelectOrder={(ord) => {
            setSelectedOrder(ord);
            setCurrentTab('orders');
          }}
        />
      )}

      {currentTab === 'integrations' && (
        <IntegrationsView
          integrations={integrations.length ? integrations : state.integrations || []}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onToggleConnection={(id, isConnected) => actions.toggleIntegrationConnection(id, isConnected)}
          onSyncOrders={(id) => actions.syncChannelOrders(id) || 0}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsView
          orders={orders}
          expenses={expenses}
          products={products}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
        />
      )}

      {currentTab === 'expenses' && (
        <ExpensesView
          expenses={expenses}
          workspace={activeWorkspace}
          whiteLabel={whiteLabel}
          onAddExpense={(e) => actions.addExpense(e)}
          onUpdateExpense={(id, updates) => actions.updateExpense(id, updates)}
          onDeleteExpense={(id) => actions.deleteExpense(id)}
        />
      )}

      {currentTab === 'settings' && (
        <SettingsView
          workspace={activeWorkspace}
          workspaces={workspaces}
          members={members}
          currentUser={currentUser}
          whiteLabel={whiteLabel}
          orders={orders}
          customers={customers}
          products={products}
          onUpdateWorkspace={(id, updates) => actions.updateWorkspace(id, updates)}
          onUpdateWhiteLabel={(updates) => actions.updateWhiteLabel(updates)}
          onSwitchWorkspace={(id) => actions.setActiveWorkspace(id)}
          onResetDemoData={() => actions.resetToDemoData()}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />
      )}

      {currentTab === 'handover' && <HandoverView />}

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
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
        }}
      />

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(ws, initialProd) => {
          actions.createWorkspace(ws);
          if (initialProd) actions.addProduct(initialProd);
        }}
      />
    </AppLayout>
  );
}
