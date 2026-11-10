import React, { useState, useMemo } from 'react';
import {
  Order,
  Product,
  Customer,
  BusinessWorkspace,
  WhiteLabelConfig,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  GlobalCourierProvider
} from '../../types';
import { formatCurrency } from '../../services/currency';
import { getTrackingUrl, GLOBAL_COURIERS } from '../../services/shipping';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Send,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  ExternalLink,
  Globe
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onOpenNewOrder: () => void;
  onOpenInvoice: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onBookCourier: (orderId: string, provider: GlobalCourierProvider) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  products,
  customers,
  workspace,
  whiteLabel,
  selectedOrder,
  onSelectOrder,
  onOpenNewOrder,
  onOpenInvoice,
  onUpdateStatus,
  onDeleteOrder,
  onBookCourier
}) => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const currency = workspace.currency_symbol || whiteLabel.default_currency_symbol;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Tab filter
      if (activeTab !== 'all' && order.status !== activeTab) {
        return false;
      }
      // Payment status filter
      if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) {
        return false;
      }
      // Payment method filter
      if (paymentMethodFilter !== 'all' && order.payment_method !== paymentMethodFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = order.order_number.toLowerCase().includes(q);
        const matchesCust = order.customer_name.toLowerCase().includes(q);
        const matchesPhone = order.customer_phone.toLowerCase().includes(q);
        const city = order.shipping_city || (typeof order.shipping_address === 'object' && order.shipping_address ? order.shipping_address.city : '') || '';
        const matchesCity = city.toLowerCase().includes(q);
        if (!matchesNum && !matchesCust && !matchesPhone && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeTab, paymentFilter, paymentMethodFilter, searchQuery]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  // Count per status tab
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">Confirmed</span>;
      case 'processing':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">Processing</span>;
      case 'ready_to_ship':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">Ready To Ship</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">Cancelled</span>;
      case 'returned':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">Returned</span>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Paid</span>;
      case 'unpaid':
        return <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Unpaid</span>;
      case 'partially_paid':
        return <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Partial</span>;
      case 'refunded':
        return <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Refunded</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Process, dispatch, and track customer shipments across fulfillment stages
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Order
        </button>
      </div>

      {/* Filter Tabs for Order Statuses */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-medium scrollbar-thin">
        {(['all', 'pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'returned'] as const).map(tab => {
          const count = statusCounts[tab] || 0;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="capitalize">{tab.replace('_', ' ')}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
                isActive ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, phone, city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
          {/* Payment Status Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Method Dropdown */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="mfs_bkash">bKash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Direct Cash</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer & Destination</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Courier</th>
                <th className="py-3 px-4 text-right font-semibold">Total Amount</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const dateStr = new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  });

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {order.order_number}
                        </button>
                        <div className="text-[11px] text-slate-400">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {order.shipping_city || (typeof order.shipping_address === 'object' && order.shipping_address ? order.shipping_address.city : '') || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3 px-4">
                        <div>{getPaymentBadge(order.payment_status)}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                          {order.payment_method.replace('_', ' ')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {order.courier_name ? (
                          <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                              {order.courier_name}
                            </div>
                            {order.courier_tracking_id && (
                              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[110px]">
                                {order.courier_tracking_id}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(order.total_amount, order.currency_code || workspace.currency_code)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Print / View Invoice"
                            onClick={() => onOpenInvoice(order)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="View Full Details"
                            onClick={() => onSelectOrder(order)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
              </span> of <span className="font-semibold text-slate-900 dark:text-white">{filteredOrders.length}</span> orders
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                    {selectedOrder.order_number}
                  </span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenInvoice(selectedOrder)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Invoice
                </button>
                <button
                  onClick={() => onSelectOrder(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Quick Status Update Selector */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="font-semibold text-slate-900 dark:text-white mb-2">Update Order Pipeline Status:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'returned'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(selectedOrder.id, st)}
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                        selectedOrder.status === st
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'returned') && (
                  <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Inventory stock automatically restored to warehouse ledger.</span>
                  </div>
                )}
              </div>

              {/* Customer Information Card */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Customer & Shipping Destination
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {selectedOrder.customer_name}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedOrder.customer_phone}
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      {typeof selectedOrder.shipping_address === 'object' && selectedOrder.shipping_address !== null
                        ? [
                            selectedOrder.shipping_address.address_line1 || selectedOrder.shipping_address.line1,
                            selectedOrder.shipping_address.city,
                            selectedOrder.shipping_address.state_province_region || selectedOrder.shipping_address.state_province,
                            selectedOrder.shipping_address.country
                          ].filter(Boolean).join(', ')
                        : `${selectedOrder.shipping_address || ''}, ${selectedOrder.shipping_city || ''}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Shipment Dispatch Card */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Courier & Delivery Tracking
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  {selectedOrder.courier_tracking_id ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                        <span>Courier: {selectedOrder.courier_name}</span>
                        <span className="text-blue-600 dark:text-blue-400 uppercase text-[10px]">Active Shipment</span>
                      </div>
                      <div className="font-mono text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>
                          Tracking ID: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.courier_tracking_id}</span>
                        </span>
                        {selectedOrder.courier_tracking_url && (
                          <a
                            href={selectedOrder.courier_tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>Live Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {selectedOrder.consignment_id && (
                        <div className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                          Consignment: {selectedOrder.consignment_id}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-slate-500 text-xs">Not dispatched to carrier yet.</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => onBookCourier(selectedOrder.id, 'dhl')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors cursor-pointer"
                        >
                          Book DHL
                        </button>
                        <button
                          onClick={() => onBookCourier(selectedOrder.id, 'fedex')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors cursor-pointer"
                        >
                          Book FedEx
                        </button>
                        <button
                          onClick={() => onBookCourier(selectedOrder.id, 'ups')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded transition-colors cursor-pointer"
                        >
                          Book UPS
                        </button>
                        <button
                          onClick={() => onBookCourier(selectedOrder.id, 'royal_mail')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
                        >
                          Royal Mail
                        </button>
                        <button
                          onClick={() => onBookCourier(selectedOrder.id, 'pathao')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
                        >
                          Pathao
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Ordered Products ({selectedOrder.items.length})
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.product_title}
                        </div>
                        {item.variant_name && (
                          <div className="text-[11px] text-slate-500">{item.variant_name}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku} · Qty: {item.quantity} × {formatCurrency(item.unit_price, selectedOrder.currency_code || workspace.currency_code)}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(item.total_price, selectedOrder.currency_code || workspace.currency_code)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency_code || workspace.currency_code)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Discount:</span>
                    <span className="font-mono tabular-nums">-{formatCurrency(selectedOrder.discount, selectedOrder.currency_code || workspace.currency_code)}</span>
                  </div>
                )}
                {selectedOrder.tax_amount !== undefined && selectedOrder.tax_amount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{selectedOrder.tax_name || 'Tax'} ({selectedOrder.tax_rate || 0}%):</span>
                    <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.tax_amount, selectedOrder.currency_code || workspace.currency_code)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping Fee:</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.delivery_charge, selectedOrder.currency_code || workspace.currency_code)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-950 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.total_amount, selectedOrder.currency_code || workspace.currency_code)}</span>
                </div>
                <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex justify-between font-mono">
                  <span>Estimated Net Profit:</span>
                  <span>{formatCurrency(selectedOrder.estimated_profit, selectedOrder.currency_code || workspace.currency_code)}</span>
                </div>
              </div>

              {/* Visual Order Timeline History */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Order Event Timeline
                </div>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                  {selectedOrder.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                      <div className="text-[11px] font-semibold text-slate-900 dark:text-white capitalize">
                        {event.status.replace('_', ' ')}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        {event.note}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(event.timestamp).toLocaleString()} · {event.actor_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Delete Order */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete order ${selectedOrder.order_number}?`)) {
                      onDeleteOrder(selectedOrder.id);
                      onSelectOrder(null);
                    }
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Order Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
