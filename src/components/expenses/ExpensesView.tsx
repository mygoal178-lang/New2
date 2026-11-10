import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, BusinessWorkspace, WhiteLabelConfig } from '../../types';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  Tag,
  DollarSign
} from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onAddExpense: (e: Omit<Expense, 'id' | 'business_id' | 'created_at'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  workspace,
  whiteLabel,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const currency = workspace.currency_symbol || whiteLabel.default_currency_symbol;

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = e.title.toLowerCase().includes(q);
        const mNotes = e.notes?.toLowerCase().includes(q);
        if (!mTitle && !mNotes) return false;
      }
      return true;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expense & Overhead Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log marketing, packaging, salaries, and office costs to calculate true net profit
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Record Expense
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Total Filtered Operational Expenses</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {currency}{totalExpenseAmount.toLocaleString()}
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {filteredExpenses.length} expense entries recorded in ledger
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description, notes..."
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
            <option value="all">All Expense Categories</option>
            <option value="facebook_ads">Facebook / Meta Ads</option>
            <option value="packaging">Packaging Materials</option>
            <option value="office_rent">Office & Warehouse Rent</option>
            <option value="employee_salaries">Staff Salaries</option>
            <option value="courier_charges">Courier Fees & Returns</option>
            <option value="utilities">Utilities & Internet</option>
            <option value="other">Other Expenses</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 text-right font-semibold">Amount</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No expense records found. Click Record Expense to log one.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {exp.date}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-500">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {exp.payment_method}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400">
                      {currency}{exp.amount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete expense "${exp.title}"?`)) {
                              onDeleteExpense(exp.id);
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

      {/* Add / Edit Expense Modal */}
      {(isAddModalOpen || editingExpense) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Record New Expense'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpense(null);
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
                const title = (form.elements.namedItem('expTitle') as HTMLInputElement).value;
                const category = (form.elements.namedItem('expCategory') as HTMLSelectElement).value as ExpenseCategory;
                const amount = parseFloat((form.elements.namedItem('expAmount') as HTMLInputElement).value) || 0;
                const paymentMethod = (form.elements.namedItem('expPaymentMethod') as HTMLInputElement).value;
                const date = (form.elements.namedItem('expDate') as HTMLInputElement).value;
                const notes = (form.elements.namedItem('expNotes') as HTMLInputElement).value;

                if (editingExpense) {
                  onUpdateExpense(editingExpense.id, {
                    title,
                    category,
                    amount,
                    payment_method: paymentMethod,
                    date,
                    notes: notes || undefined
                  });
                } else {
                  onAddExpense({
                    title,
                    category,
                    amount,
                    currency: workspace.currency || workspace.currency_code || 'USD',
                    payment_method: paymentMethod,
                    date,
                    notes: notes || undefined
                  });
                }

                setIsAddModalOpen(false);
                setEditingExpense(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  name="expTitle"
                  defaultValue={editingExpense?.title || ''}
                  placeholder="e.g. Meta Facebook Ads February Campaign"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expense Category *
                </label>
                <select
                  name="expCategory"
                  defaultValue={editingExpense?.category || 'facebook_ads'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                >
                  <option value="facebook_ads">Facebook / Meta Ads</option>
                  <option value="packaging">Packaging Materials & Boxes</option>
                  <option value="office_rent">Office & Warehouse Rent</option>
                  <option value="employee_salaries">Staff Salaries</option>
                  <option value="courier_charges">Courier Fees & Return Adjustments</option>
                  <option value="utilities">Utilities & Internet</option>
                  <option value="software_tools">Software & Tools</option>
                  <option value="other">Other Expenses</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="expAmount"
                    defaultValue={editingExpense?.amount || 5000}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    name="expDate"
                    defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Method
                </label>
                <input
                  type="text"
                  name="expPaymentMethod"
                  defaultValue={editingExpense?.payment_method || 'bKash Merchant'}
                  placeholder="e.g. Bank Transfer, Cash, Card"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  name="expNotes"
                  defaultValue={editingExpense?.notes || ''}
                  placeholder="e.g. Invoice #29482 from supplier"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
