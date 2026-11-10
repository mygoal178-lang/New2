import React, { useState, useMemo } from 'react';
import {
  Order,
  Product,
  Expense,
  BusinessWorkspace,
  WhiteLabelConfig,
  OrderStatus
} from '../../types';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  expenses: Expense[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onNavigateTab: (tab: string) => void;
  onOpenNewOrder: () => void;
  onSelectOrder: (order: Order) => void;
}

type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'all';

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  expenses,
  workspace,
  whiteLabel,
  onNavigateTab,
  onOpenNewOrder,
  onSelectOrder
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const currency = workspace.currency_symbol || whiteLabel.default_currency_symbol;

  // Filter orders and expenses by chosen date range
  const { filteredOrders, filteredExpenses } = useMemo(() => {
    const now = new Date('2025-02-23T23:59:59Z'); // Reference sandbox time
    let startLimit: Date | null = null;

    if (dateFilter === 'today') {
      startLimit = new Date('2025-02-23T00:00:00Z');
    } else if (dateFilter === 'yesterday') {
      startLimit = new Date('2025-02-22T00:00:00Z');
    } else if (dateFilter === '7days') {
      startLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === '30days') {
      startLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === 'this_month') {
      startLimit = new Date('2025-02-01T00:00:00Z');
    }

    if (!startLimit) {
      return { filteredOrders: orders, filteredExpenses: expenses };
    }

    const o = orders.filter(ord => new Date(ord.created_at) >= startLimit!);
    const e = expenses.filter(exp => new Date(exp.date) >= startLimit!);
    return { filteredOrders: o, filteredExpenses: e };
  }, [orders, expenses, dateFilter]);

  // Compute key metric cards
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
    const confirmedOrders = filteredOrders.filter(o => o.status === 'confirmed').length;
    const processingOrders = filteredOrders.filter(o => o.status === 'processing' || o.status === 'ready_to_ship').length;
    const shippedOrders = filteredOrders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled').length;
    const returnedOrders = filteredOrders.filter(o => o.status === 'returned').length;

    // Gross Sales: Sum of all valid orders (excluding cancelled)
    const activeOrders = filteredOrders.filter(o => o.status !== 'cancelled');
    const grossSales = activeOrders.reduce((acc, o) => acc + o.total_amount, 0);

    // Collected Revenue: Exclusively paid or successfully delivered orders (CRITICAL: Do NOT count unpaid/cancelled)
    const deliveredOrdersList = filteredOrders.filter(o => o.status === 'delivered' || o.payment_status === 'paid');
    const collectedRevenue = deliveredOrdersList.reduce((acc, o) => acc + o.total_amount, 0);

    // Outstanding COD: In-transit or pending orders that are COD
    const outstandingCod = filteredOrders
      .filter(o => (o.status === 'shipped' || o.status === 'ready_to_ship' || o.status === 'processing') && o.payment_method === 'cod')
      .reduce((acc, o) => acc + o.total_amount, 0);

    // Total Expenses
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

    // COGS for delivered items
    const cogsDelivered = deliveredOrdersList.reduce((acc, o) => acc + o.total_cost, 0);

    // Estimated Net Profit: Collected Revenue - COGS - Expenses
    const estimatedNetProfit = collectedRevenue - cogsDelivered - totalExpenses;

    // Low stock count
    const lowStockProducts = products.filter(p => p.stock <= p.min_stock_alert);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
      grossSales,
      collectedRevenue,
      outstandingCod,
      totalExpenses,
      estimatedNetProfit,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    };
  }, [filteredOrders, filteredExpenses, products]);

  // Daily Trend Chart Data
  const trendData = useMemo(() => {
    const map: Record<string, { date: string; sales: number; collected: number; orders: number }> = {};
    // Last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date('2025-02-23T00:00:00Z');
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      map[key] = { date: label, sales: 0, collected: 0, orders: 0 };
    }

    filteredOrders.forEach(o => {
      const day = o.created_at.split('T')[0];
      if (map[day]) {
        map[day].orders += 1;
        if (o.status !== 'cancelled') {
          map[day].sales += o.total_amount;
        }
        if (o.status === 'delivered' || o.payment_status === 'paid') {
          map[day].collected += o.total_amount;
        }
      }
    });

    return Object.values(map);
  }, [filteredOrders]);

  // Order Status Distribution Chart Data
  const statusPieData = useMemo(() => {
    return [
      { name: 'Delivered', value: metrics.deliveredOrders, color: '#10b981' },
      { name: 'Shipped', value: metrics.shippedOrders, color: '#3b82f6' },
      { name: 'Processing', value: metrics.processingOrders, color: '#8b5cf6' },
      { name: 'Confirmed', value: metrics.confirmedOrders, color: '#06b6d4' },
      { name: 'Pending', value: metrics.pendingOrders, color: '#f59e0b' },
      { name: 'Cancelled', value: metrics.cancelledOrders, color: '#ef4444' },
      { name: 'Returned', value: metrics.returnedOrders, color: '#f97316' }
    ].filter(item => item.value > 0);
  }, [metrics]);

  // Top Selling Products Leaderboard
  const topProducts = useMemo(() => {
    const productSales: Record<string, { product: Product; qty: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      if (o.status !== 'cancelled') {
        o.items.forEach(it => {
          if (!productSales[it.product_id]) {
            const p = products.find(prod => prod.id === it.product_id);
            if (p) {
              productSales[it.product_id] = { product: p, qty: 0, revenue: 0 };
            }
          }
          if (productSales[it.product_id]) {
            productSales[it.product_id].qty += it.quantity;
            productSales[it.product_id].revenue += it.total_price;
          }
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders, products]);

  // Revenue vs Expense Comparison Bar
  const revenueExpenseComparison = useMemo(() => {
    return [
      {
        name: 'Financial Ledger',
        'Collected Revenue': metrics.collectedRevenue,
        'Operating Expenses': metrics.totalExpenses,
        'Net Profit': metrics.estimatedNetProfit > 0 ? metrics.estimatedNetProfit : 0
      }
    ];
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operations & Financial Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics for <span className="font-medium text-slate-700 dark:text-slate-300">{workspace.name}</span>
          </p>
        </div>

        {/* Date Filter & New Order Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            {(['all', 'today', 'yesterday', '7days', '30days', 'this_month'] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  dateFilter === f
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Time'
                  : f === 'today' ? 'Today'
                  : f === 'yesterday' ? 'Yesterday'
                  : f === '7days' ? 'Last 7D'
                  : f === '30days' ? 'Last 30D'
                  : 'This Month'}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Order
          </button>
        </div>
      </div>

      {/* Low Stock Urgent Notification Banner */}
      {metrics.lowStockCount > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">{metrics.lowStockCount} product{metrics.lowStockCount > 1 ? 's' : ''} low on stock or sold out!</span>{' '}
              Immediate restocking required to prevent fulfillment delays.
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3 py-1 font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            View Inventory
          </button>
        </div>
      )}

      {/* Primary Financial Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Gross Order Value</span>
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {currency}{metrics.grossSales.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>{metrics.totalOrders} total orders processed</span>
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Collected Revenue</span>
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-md">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {currency}{metrics.collectedRevenue.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>From {metrics.deliveredOrders} delivered & paid orders</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Recorded Expenses</span>
            <span className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-md">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {currency}{metrics.totalExpenses.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Ads, rent, packing & salaries</span>
          </div>
        </div>

        {/* Estimated Net Profit */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Estimated Net Profit</span>
            <span className="p-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
            metrics.estimatedNetProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'
          }`}>
            {currency}{metrics.estimatedNetProfit.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <span>Net after COGS & all operating costs</span>
          </div>
        </div>
      </div>

      {/* Operational Order Pipeline Counts (Clean Segmented Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>Pending</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.pendingOrders}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-medium">
            <span>Confirmed</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.confirmedOrders}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium">
            <span>Processing</span>
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.processingOrders}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span>Shipped</span>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.shippedOrders}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Delivered</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.deliveredOrders}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>Cancelled</span>
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.cancelledOrders}
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 font-medium">
            <span>Returned</span>
            <RotateCcw className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {metrics.returnedOrders}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales & Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Sales & Collected Revenue Velocity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                14-day daily progression of orders booked vs cash collected
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span className="text-slate-600 dark:text-slate-400">Gross Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Collected</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" name="Gross Sales" />
                <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colGrad)" name="Collected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution (1 col) */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Order Status Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Current parcel fulfillment split
          </p>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} orders`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {statusPieData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Best Selling Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Selling Products Leaderboard (1 col) */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Best-Selling Products
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by gross revenue generated
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              All Products
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((item, idx) => (
              <div key={item.product.id} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.product.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.qty} units sold · Stock: <span className="font-mono tabular-nums">{item.product.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {currency}{item.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Orders Feed
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest customer submissions with direct detail actions
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All Orders ({filteredOrders.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="pb-2 font-semibold">Order</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">City</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">Total</th>
                  <th className="pb-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredOrders.slice(0, 6).map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {order.order_number}
                      </td>
                      <td className="py-2.5">
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[130px]">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">
                        {order.shipping_city}
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : order.status === 'shipped' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : order.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {currency}{order.total_amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
