import React, { useState } from 'react';
import {
  CourierConfig,
  CourierShipment,
  Order,
  BusinessWorkspace,
  WhiteLabelConfig,
  GlobalCourierProvider,
  CourierProvider
} from '../../types';
import { formatCurrency } from '../../services/currency';
import { getTrackingUrl } from '../../services/shipping';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Settings2,
  ExternalLink,
  Plus,
  Search,
  RotateCcw,
  Clock,
  XCircle,
  FileText,
  X,
  ShieldCheck,
  Send
} from 'lucide-react';

interface CouriersViewProps {
  couriers: CourierConfig[];
  shipments: CourierShipment[];
  orders: Order[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onUpdateCourierConfig: (courierId: string, updates: Partial<CourierConfig>) => void;
  onCreateShipment: (orderId: string, provider: GlobalCourierProvider) => void;
  onUpdateShipmentStatus: (shipmentId: string, status: CourierShipment['status']) => void;
  onSelectOrder: (order: Order) => void;
}

export const CouriersView: React.FC<CouriersViewProps> = ({
  couriers,
  shipments,
  orders,
  workspace,
  whiteLabel,
  onUpdateCourierConfig,
  onCreateShipment,
  onUpdateShipmentStatus,
  onSelectOrder
}) => {
  const [selectedCourier, setSelectedCourier] = useState<CourierConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const currency = workspace.currency_symbol || whiteLabel.default_currency_symbol;

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mTrack = s.tracking_id.toLowerCase().includes(q);
      const mConsign = s.consignment_id.toLowerCase().includes(q);
      const mOrder = s.order_number.toLowerCase().includes(q);
      const mRecip = s.recipient_name.toLowerCase().includes(q);
      const mPhone = s.recipient_phone.toLowerCase().includes(q);
      if (!mTrack && !mConsign && !mOrder && !mRecip && !mPhone) return false;
    }
    return true;
  });

  // Eligible orders ready to dispatch
  const readyOrders = orders.filter(
    o => (o.status === 'confirmed' || o.status === 'processing' || o.status === 'ready_to_ship') && !o.courier_tracking_id
  );

  // Performance calculations
  const totalShipments = shipments.length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;
  const returnedCount = shipments.filter(s => s.status === 'returned').length;
  const inTransitCount = shipments.filter(s => s.status === 'in_transit' || s.status === 'booked').length;
  const successRate = totalShipments > 0 ? Math.round((deliveredCount / totalShipments) * 100) : 0;
  const returnRate = totalShipments > 0 ? Math.round((returnedCount / totalShipments) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Global Logistics & Shipping Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-carrier parcel dispatchers, live tracking, and international fulfillment performance
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Dispatch New Parcel
        </button>
      </div>

      {/* Courier Provider Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {couriers.map((c) => {
          const providerShipments = shipments.filter(s => s.courier_provider === c.provider);
          const providerDelivered = providerShipments.filter(s => s.status === 'delivered').length;

          return (
            <div
              key={c.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {c.name}
                  </span>
                  {c.is_connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded">
                      Manual Mode
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Domestic Rate:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(c.domestic_flat_rate ?? c.inside_city_rate ?? 0, workspace.currency_code)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regional / Express:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(c.international_flat_rate ?? c.outside_city_rate ?? 0, workspace.currency_code)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling / COD:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {c.cash_collection_fee_pct}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  {providerShipments.length} total parcels · {providerDelivered} delivered
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedCourier(c)}
                  className="w-full py-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  API Settings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logistics Health & Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div>
          <div className="text-slate-500">Fulfillment Success Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {successRate}%
          </div>
          <div className="text-[11px] text-slate-400">Delivered without return</div>
        </div>

        <div>
          <div className="text-slate-500">Parcels Currently In Transit</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {inTransitCount}
          </div>
          <div className="text-[11px] text-slate-400">Out for delivery today</div>
        </div>

        <div>
          <div className="text-slate-500">Return & Cancellation Rate</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {returnRate}%
          </div>
          <div className="text-[11px] text-slate-400">Customer refused or returned</div>
        </div>

        <div>
          <div className="text-slate-500">Outstanding COD In Transit</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {currency}
            {shipments
              .filter(s => s.status === 'in_transit')
              .reduce((sum, s) => sum + s.cod_amount, 0)
              .toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Cash awaiting courier settlement</div>
        </div>
      </div>

      {/* Shipments Table Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracking ID, consignment, order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Shipment Statuses</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="failed">Failed Delivery</option>
          </select>
        </div>
      </div>

      {/* Shipments Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Tracking & Consignment</th>
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Courier Partner</th>
                <th className="py-3 px-4 font-semibold">Recipient</th>
                <th className="py-3 px-4 text-right font-semibold">COD Amount</th>
                <th className="py-3 px-4 text-right font-semibold">Delivery Fee</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No shipments found. Dispatch orders using the button above.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{s.tracking_id}</span>
                        <a
                          href={s.tracking_url || getTrackingUrl(s.courier_provider as any, s.tracking_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                          title="Track Parcel Online"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.consignment_id}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          const o = orders.find(ord => ord.id === s.order_id || ord.order_number === s.order_number);
                          if (o) onSelectOrder(o);
                        }}
                        className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {s.order_number}
                      </button>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {s.courier_name}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                        {s.recipient_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {s.recipient_phone}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(s.cod_amount, workspace.currency_code)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      {formatCurrency(s.delivery_fee, workspace.currency_code)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {s.status === 'delivered' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded uppercase tracking-wider">
                          Delivered
                        </span>
                      ) : s.status === 'in_transit' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 rounded uppercase tracking-wider">
                          In Transit
                        </span>
                      ) : s.status === 'returned' ? (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300 rounded uppercase tracking-wider">
                          Returned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded uppercase tracking-wider">
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {s.status === 'in_transit' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onUpdateShipmentStatus(s.id, 'delivered')}
                            className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded transition-colors cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                          <button
                            onClick={() => onUpdateShipmentStatus(s.id, 'returned')}
                            className="px-2 py-1 text-[10px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 rounded transition-colors cursor-pointer"
                          >
                            Mark Returned
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courier Settings Modal */}
      {selectedCourier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedCourier.name} Configuration
                </h2>
                <p className="text-[11px] text-slate-500">
                  Manage official API credentials and shipping rate rules
                </p>
              </div>
              <button onClick={() => setSelectedCourier(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const apiKey = (form.elements.namedItem('apiKey') as HTMLInputElement)?.value;
                const clientSecret = (form.elements.namedItem('apiSecret') as HTMLInputElement)?.value;
                const storeId = (form.elements.namedItem('storeId') as HTMLInputElement)?.value;
                const insideRate = parseFloat((form.elements.namedItem('insideRate') as HTMLInputElement).value) || 60;
                const outsideRate = parseFloat((form.elements.namedItem('outsideRate') as HTMLInputElement).value) || 120;
                const codFee = parseFloat((form.elements.namedItem('codFee') as HTMLInputElement).value) || 1.0;
                const isConnected = Boolean(apiKey);

                onUpdateCourierConfig(selectedCourier.id, {
                  api_key: apiKey,
                  api_secret: clientSecret,
                  store_id: storeId,
                  inside_city_rate: insideRate,
                  outside_city_rate: outsideRate,
                  cash_collection_fee_pct: codFee,
                  is_connected: isConnected
                });

                setSelectedCourier(null);
              }}
              className="space-y-3"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-indigo-900 dark:text-indigo-200 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  Enter your credentials from the official {selectedCourier.name} Merchant Portal. If credentials are empty, OrderFlow automatically operates in manual courier dispatch mode without throwing errors.
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  API Key / Access Token
                </label>
                <input
                  type="text"
                  name="apiKey"
                  defaultValue={selectedCourier.api_key || ''}
                  placeholder="e.g. pth_live_xxxx or stf_key_xxxx"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>

              {selectedCourier.provider === 'steadfast' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    API Secret Key
                  </label>
                  <input
                    type="password"
                    name="apiSecret"
                    defaultValue={selectedCourier.api_secret || ''}
                    placeholder="Steadfast Secret Key"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  />
                </div>
              )}

              {selectedCourier.provider === 'pathao' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Pathao Store / Warehouse ID
                  </label>
                  <input
                    type="text"
                    name="storeId"
                    defaultValue={selectedCourier.store_id || ''}
                    placeholder="e.g. STORE_DHAKA_01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Inside City ({currency})
                  </label>
                  <input
                    type="number"
                    name="insideRate"
                    defaultValue={selectedCourier.inside_city_rate}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Outside City ({currency})
                  </label>
                  <input
                    type="number"
                    name="outsideRate"
                    defaultValue={selectedCourier.outside_city_rate}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    COD Fee (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="codFee"
                    defaultValue={selectedCourier.cash_collection_fee_pct}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCourier(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Save Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Parcel Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Dispatch Order to Courier
              </h2>
              <button onClick={() => setIsBookModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {readyOrders.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                No orders currently waiting for courier dispatch. All confirmed orders have tracking IDs assigned.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const orderId = (form.elements.namedItem('selectedOrderId') as HTMLSelectElement).value;
                  const provider = (form.elements.namedItem('courierProv') as HTMLSelectElement).value as CourierProvider;
                  onCreateShipment(orderId, provider);
                  setIsBookModalOpen(false);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Order to Dispatch *
                  </label>
                  <select
                    name="selectedOrderId"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                  >
                    {readyOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.order_number} - {o.customer_name} ({currency}{o.total_amount.toLocaleString()}) - {o.shipping_city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Courier Partner *
                  </label>
                  <select
                    name="courierProv"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                  >
                    <option value="pathao">Pathao Courier</option>
                    <option value="steadfast">Steadfast Courier</option>
                    <option value="redx">RedX Logistics</option>
                    <option value="paperfly">Paperfly</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Generate Tracking & Dispatch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
