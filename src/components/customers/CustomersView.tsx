import React, { useState, useMemo } from 'react';
import { Customer, Order, BusinessWorkspace, WhiteLabelConfig } from '../../types';
import { formatCurrency } from '../../services/currency';
import { GLOBAL_COUNTRIES, getCountryByCode } from '../../services/addressPhone';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Clock,
  Trash2,
  Edit2,
  X,
  UserCheck,
  ChevronRight,
  Calendar,
  Globe
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onAddCustomer: (c: Omit<Customer, 'id' | 'business_id' | 'total_orders' | 'total_spent' | 'created_at'>) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  workspace,
  whiteLabel,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const currency = workspace.currency_symbol || whiteLabel.default_currency_symbol;

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = c.name.toLowerCase().includes(q);
        const mPhone = c.phone.toLowerCase().includes(q);
        const mCity = c.city.toLowerCase().includes(q);
        const mEmail = c.email?.toLowerCase().includes(q);
        if (!mName && !mPhone && !mCity && !mEmail) return false;
      }
      return true;
    });
  }, [customers, categoryFilter, searchQuery]);

  // Orders for currently selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customer_id === selectedCustomer.id || o.customer_phone === selectedCustomer.phone);
  }, [orders, selectedCustomer]);

  const getCategoryBadge = (cat: Customer['category']) => {
    switch (cat) {
      case 'vip':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">VIP</span>;
      case 'regular':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">Regular</span>;
      case 'new':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">New</span>;
      case 'inactive':
        return <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Relationship Management (CRM)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles, lifetime spend, purchase history, and delivery addresses
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Customer
        </button>
      </div>

      {/* CRM Metric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Customer Profiles</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {customers.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Verified phone contacts</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">VIP High-Value Buyers</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-purple-600 dark:text-purple-400">
            {customers.filter(c => c.category === 'vip').length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">5+ orders / ৳15k+ spend</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Lifetime Customer Spend</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {currency}{customers.reduce((acc, c) => acc + c.total_spent, 0).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Accumulated gross revenue</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Average Order Frequency</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {(customers.reduce((acc, c) => acc + c.total_orders, 0) / (customers.length || 1)).toFixed(1)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Orders per customer</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Customer Tiers</option>
            <option value="vip">VIP Buyers</option>
            <option value="regular">Regular Shoppers</option>
            <option value="new">New Buyers</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Phone & City</th>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 text-center font-semibold">Orders</th>
                <th className="py-3 px-4 text-right font-semibold">Total Spent</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.name}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                          {c.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700 dark:text-slate-300">
                        {c.phone}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.city}{c.country_code ? `, ${c.country_code}` : ''}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getCategoryBadge(c.category)}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                      {c.total_orders}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(c.total_spent, c.currency_code || workspace.currency_code)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                        >
                          Profile & History
                        </button>
                        <button
                          onClick={() => setEditingCustomer(c)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete customer ${c.name}?`)) {
                              onDeleteCustomer(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Purchase History Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedCustomer.name}
                    </span>
                    {getCategoryBadge(selectedCustomer.category)}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedCustomer.phone}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div>
                  <div className="text-slate-500 text-[11px]">Total Spent</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(selectedCustomer.total_spent, selectedCustomer.currency_code || workspace.currency_code)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Total Orders</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {selectedCustomer.total_orders}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Average Order Value</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(
                      selectedCustomer.total_orders > 0
                        ? Math.round(selectedCustomer.total_spent / selectedCustomer.total_orders)
                        : 0,
                      selectedCustomer.currency_code || workspace.currency_code
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address & Contact Card */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Default Shipping Coordinates
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-700 dark:text-slate-300">
                    {selectedCustomer.address}
                  </div>
                  <div className="text-slate-500">
                    City: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCustomer.city}</span>, {selectedCustomer.country_name || selectedCustomer.country_code || workspace.country}
                  </div>
                  {selectedCustomer.email && (
                    <div className="text-slate-500 font-mono">
                      Email: {selectedCustomer.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              {selectedCustomer.notes && (
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Internal Merchant Notes
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-900 dark:text-amber-200">
                    {selectedCustomer.notes}
                  </div>
                </div>
              )}

              {/* Customer Past Orders */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Past Orders ({customerOrders.length})
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  {customerOrders.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      No order records found for this customer.
                    </div>
                  ) : (
                    customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => {
                          onSelectOrder(ord);
                          setSelectedCustomer(null);
                        }}
                      >
                        <div>
                          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {ord.order_number}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(ord.created_at).toLocaleDateString()} · {ord.items.length} items
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                            {currency}{ord.total_amount.toLocaleString()}
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer Profile'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('custName') as HTMLInputElement).value;
                const phone = (form.elements.namedItem('custPhone') as HTMLInputElement).value;
                const email = (form.elements.namedItem('custEmail') as HTMLInputElement).value;
                const countryCode = (form.elements.namedItem('custCountry') as HTMLSelectElement).value;
                const address = (form.elements.namedItem('custAddress') as HTMLInputElement).value;
                const city = (form.elements.namedItem('custCity') as HTMLInputElement).value;
                const stateProvince = (form.elements.namedItem('custState') as HTMLInputElement)?.value;
                const postalCode = (form.elements.namedItem('custPostal') as HTMLInputElement)?.value;
                const category = (form.elements.namedItem('custCategory') as HTMLSelectElement).value as Customer['category'];
                const notes = (form.elements.namedItem('custNotes') as HTMLInputElement).value;

                const cObj = getCountryByCode(countryCode);

                if (editingCustomer) {
                  onUpdateCustomer(editingCustomer.id, {
                    name,
                    phone,
                    email: email || undefined,
                    address,
                    city,
                    country_code: countryCode,
                    country_name: cObj?.name,
                    state_province: stateProvince || undefined,
                    postal_code: postalCode || undefined,
                    category,
                    notes: notes || undefined
                  });
                } else {
                  onAddCustomer({
                    name,
                    phone,
                    email: email || undefined,
                    address,
                    city,
                    country_code: countryCode,
                    country_name: cObj?.name,
                    state_province: stateProvince || undefined,
                    postal_code: postalCode || undefined,
                    category,
                    notes: notes || undefined
                  });
                }

                setIsAddModalOpen(false);
                setEditingCustomer(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="custName"
                  defaultValue={editingCustomer?.name || ''}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Country *
                  </label>
                  <select
                    name="custCountry"
                    defaultValue={editingCustomer?.country_code || workspace.country_code || 'US'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                  >
                    {GLOBAL_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.phoneCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    name="custPhone"
                    defaultValue={editingCustomer?.phone || '+1'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="custEmail"
                  defaultValue={editingCustomer?.email || ''}
                  placeholder="eleanor@example.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  name="custAddress"
                  defaultValue={editingCustomer?.address || ''}
                  placeholder="e.g. 742 Evergreen Terrace"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    name="custCity"
                    defaultValue={editingCustomer?.city || workspace.city || ''}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    name="custState"
                    defaultValue={editingCustomer?.state_province || ''}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="custPostal"
                    defaultValue={editingCustomer?.postal_code || ''}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Tier
                </label>
                <select
                  name="custCategory"
                  defaultValue={editingCustomer?.category || 'new'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                >
                  <option value="new">New Customer</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP Buyer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Notes
                </label>
                <input
                  type="text"
                  name="custNotes"
                  defaultValue={editingCustomer?.notes || ''}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {editingCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
