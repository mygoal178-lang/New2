import React, { useState, useMemo } from 'react';
import {
  Order,
  Expense,
  Product,
  BusinessWorkspace,
  WhiteLabelConfig
} from '../../types';
import { formatCurrency, convertCurrency } from '../../services/currency';
import { useI18n } from '../../services/i18n';
import {
  TrendingUp,
  Download,
  Printer,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsViewProps {
  orders: Order[];
  expenses: Expense[];
  products: Product[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  expenses,
  products,
  workspace,
  whiteLabel
}) => {
  const { t } = useI18n();
  // View mode: 'local' (Workspace native currency) or 'usd' (Consolidated global currency)
  const [viewCurrencyMode, setViewCurrencyMode] = useState<'local' | 'usd'>('local');

  const storeCurrency = workspace.currency_code || 'USD';
  const targetCurrency = viewCurrencyMode === 'local' ? storeCurrency : 'USD';

  // Strict Accounting P&L Calculations
  const pnl = useMemo(() => {
    // 1. Gross Sales (All non-cancelled orders placed)
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const grossSales = validOrders.reduce((sum, o) => {
      const amtInTarget = viewCurrencyMode === 'usd'
        ? convertCurrency(o.total_amount, o.currency_code || storeCurrency, 'USD')
        : (o.currency_code === storeCurrency ? o.total_amount : convertCurrency(o.total_amount, o.currency_code || 'USD', storeCurrency));
      return sum + amtInTarget;
    }, 0);

    // 2. Collected Revenue (Delivered OR Paid orders only - strict rule: no unpaid/cancelled)
    const paidOrDelivered = orders.filter(o => o.status === 'delivered' || o.payment_status === 'paid');
    const collectedRevenue = paidOrDelivered.reduce((sum, o) => {
      const amtInTarget = viewCurrencyMode === 'usd'
        ? convertCurrency(o.total_amount, o.currency_code || storeCurrency, 'USD')
        : (o.currency_code === storeCurrency ? o.total_amount : convertCurrency(o.total_amount, o.currency_code || 'USD', storeCurrency));
      return sum + amtInTarget;
    }, 0);

    // 3. Outstanding COD (In transit / processing COD orders)
    const outstandingCod = orders
      .filter(o => (o.status === 'shipped' || o.status === 'ready_to_ship' || o.status === 'processing') && o.payment_method === 'cod')
      .reduce((sum, o) => {
        const amtInTarget = viewCurrencyMode === 'usd'
          ? convertCurrency(o.total_amount, o.currency_code || storeCurrency, 'USD')
          : o.total_amount;
        return sum + amtInTarget;
      }, 0);

    // 4. Cost of Goods Sold (COGS) for fulfilled units
    const fulfilledCogs = paidOrDelivered.reduce((sum, o) => {
      const amtInTarget = viewCurrencyMode === 'usd'
        ? convertCurrency(o.total_cost, o.currency_code || storeCurrency, 'USD')
        : o.total_cost;
      return sum + amtInTarget;
    }, 0);

    // 5. Total Tax / VAT Collected
    const totalTaxCollected = validOrders.reduce((sum, o) => {
      const taxAmt = o.tax_amount || 0;
      const amtInTarget = viewCurrencyMode === 'usd'
        ? convertCurrency(taxAmt, o.currency_code || storeCurrency, 'USD')
        : taxAmt;
      return sum + amtInTarget;
    }, 0);

    // 6. Operating & Recorded Expenses
    const totalOperatingExpenses = expenses.reduce((sum, e) => {
      const amtInTarget = viewCurrencyMode === 'usd'
        ? convertCurrency(e.amount, storeCurrency, 'USD')
        : e.amount;
      return sum + amtInTarget;
    }, 0);

    // 7. Net Profit = Collected Revenue - COGS - Total Operating Expenses
    const netProfit = collectedRevenue - fulfilledCogs - totalOperatingExpenses;
    const netProfitMargin = collectedRevenue > 0 ? ((netProfit / collectedRevenue) * 100).toFixed(1) : '0.0';

    return {
      grossSales,
      collectedRevenue,
      outstandingCod,
      fulfilledCogs,
      totalTaxCollected,
      totalOperatingExpenses,
      netProfit,
      netProfitMargin,
      totalFulfilledCount: paidOrDelivered.length
    };
  }, [orders, expenses, viewCurrencyMode, storeCurrency]);

  // Expenses categorized for breakdown chart
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const converted = viewCurrencyMode === 'usd' ? convertCurrency(e.amount, storeCurrency, 'USD') : e.amount;
      map[e.category] = (map[e.category] || 0) + converted;
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value
    }));
  }, [expenses, viewCurrencyMode, storeCurrency]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const handleExportCSV = () => {
    const headers = ['Metric', 'Amount', 'Currency'];
    const rows = [
      ['Gross Sales', pnl.grossSales.toFixed(2), targetCurrency],
      ['Collected Revenue', pnl.collectedRevenue.toFixed(2), targetCurrency],
      ['Outstanding COD', pnl.outstandingCod.toFixed(2), targetCurrency],
      ['Fulfilled COGS', pnl.fulfilledCogs.toFixed(2), targetCurrency],
      ['Tax / VAT Collected', pnl.totalTaxCollected.toFixed(2), targetCurrency],
      ['Operating Expenses', pnl.totalOperatingExpenses.toFixed(2), targetCurrency],
      ['Net Profit', pnl.netProfit.toFixed(2), targetCurrency],
      ['Net Profit Margin %', pnl.netProfitMargin, '%']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OrderFlow_P&L_Report_${workspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav.analytics')} (P&L)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strict double-entry international financial reporting with multi-currency consolidation
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Multi-Currency Reporting Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setViewCurrencyMode('local')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewCurrencyMode === 'local'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Store: {storeCurrency}
            </button>
            <button
              onClick={() => setViewCurrencyMode('usd')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewCurrencyMode === 'usd'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Consolidated: USD ($)
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print P&L
          </button>
        </div>
      </div>

      {/* Primary Statement Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Collected Revenue</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatCurrency(pnl.collectedRevenue, targetCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            From {pnl.totalFulfilledCount} successfully settled orders
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Outstanding COD Balance</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {formatCurrency(pnl.outstandingCod, targetCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            In-transit cash with couriers
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Operating Expenses</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {formatCurrency(pnl.totalOperatingExpenses, targetCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Recorded business expenditures
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Estimated Net Profit</div>
          <div className={`mt-1.5 text-2xl font-bold font-mono tabular-nums ${
            pnl.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'
          }`}>
            {formatCurrency(pnl.netProfit, targetCurrency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Net Margin: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{pnl.netProfitMargin}%</span>
          </div>
        </div>
      </div>

      {/* Printable Statement of Profit & Loss Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {workspace.name} — Income & Expense Statement
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Financial reconciliation for operational period to date
            </div>
          </div>
          <span className="font-mono text-xs text-slate-400">All figures reported in {targetCurrency}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {/* Revenue Section */}
          <div className="py-3 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              1. Operating Revenue & Cash Intake
            </div>
            <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
              <span>Gross Booked Order Value</span>
              <span className="font-mono tabular-nums">{formatCurrency(pnl.grossSales, targetCurrency)}</span>
            </div>
            <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
              <span>Uncollected Cash on Delivery (In-Transit / Unpaid)</span>
              <span className="font-mono tabular-nums text-slate-400">({formatCurrency(pnl.outstandingCod, targetCurrency)})</span>
            </div>
            <div className="flex justify-between pl-4 font-semibold text-slate-900 dark:text-white pt-1">
              <span>Collected Revenue (Actual Realized Cash)</span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(pnl.collectedRevenue, targetCurrency)}</span>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div className="py-3 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              2. Cost of Goods Sold (COGS)
            </div>
            <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
              <span>Supplier Purchase Cost for Fulfilled Goods</span>
              <span className="font-mono tabular-nums">-{formatCurrency(pnl.fulfilledCogs, targetCurrency)}</span>
            </div>
            <div className="flex justify-between pl-4 font-semibold text-slate-900 dark:text-white pt-1">
              <span>Gross Profit (Collected Revenue - COGS)</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(pnl.collectedRevenue - pnl.fulfilledCogs, targetCurrency)}
              </span>
            </div>
          </div>

          {/* Tax / VAT Row */}
          {pnl.totalTaxCollected > 0 && (
            <div className="py-3 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                3. Tax & VAT Collected (Fiduciary Liability)
              </div>
              <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                <span>{workspace.tax_config?.tax_name || 'Sales Tax / VAT'} Collected from Customers</span>
                <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(pnl.totalTaxCollected, targetCurrency)}
                </span>
              </div>
            </div>
          )}

          {/* Operating Expenses */}
          <div className="py-3 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              4. Operating & Administrative Expenses
            </div>
            {expenses.map((e) => (
              <div key={e.id} className="flex justify-between pl-4 text-slate-600 dark:text-slate-400 text-[11px]">
                <span className="truncate max-w-[280px]">{e.title}</span>
                <span className="font-mono tabular-nums">
                  -{formatCurrency(viewCurrencyMode === 'usd' ? convertCurrency(e.amount, storeCurrency, 'USD') : e.amount, targetCurrency)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pl-4 font-semibold text-slate-900 dark:text-white pt-1">
              <span>Total Recorded Expenses</span>
              <span className="font-mono tabular-nums text-rose-600">-{formatCurrency(pnl.totalOperatingExpenses, targetCurrency)}</span>
            </div>
          </div>

          {/* Final Net Profit */}
          <div className="py-4 flex justify-between items-center text-sm font-bold text-slate-950 dark:text-white bg-slate-50 dark:bg-slate-800/40 px-4 rounded-lg mt-2">
            <div>
              <span>Estimated Net Operational Profit:</span>
              <span className="ml-2 text-xs font-normal text-slate-500 font-mono">
                (Margin: {pnl.netProfitMargin}%)
              </span>
            </div>
            <span className={`font-mono text-base tabular-nums ${
              pnl.netProfit >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'
            }`}>
              {formatCurrency(pnl.netProfit, targetCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Expense Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Operating Expense Distribution
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Allocation of marketing, packaging, salaries, and fulfillment fees
          </p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {expenseByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value) || 0, targetCurrency), 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Global Financial Integrity & Compliance
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Realized Cash-Flow Accounting vs Vanity Accrual
            </p>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Realization:</strong> Cancelled orders and pending uncollected parcels are never credited to revenue.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Multi-Currency Precision:</strong> Historical order exchange rate snapshots prevent exchange volatility from altering past tax filings.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Audit-Ready Ledger:</strong> Exportable CSV ledger ready for bookkeepers, accountants, and commercial audit.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
            <span>Workspace: {workspace.name}</span>
            <span className="font-mono font-semibold">{workspace.currency_code} ({workspace.currency_symbol})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
