import React, { useState, useMemo } from 'react';
import { Product, StockMovement, BusinessWorkspace, WhiteLabelConfig } from '../../types';
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Package,
  Layers,
  ArrowUpDown,
  History,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  stockMovements: StockMovement[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onAddProduct: (prod: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (
    productId: string,
    variantId: string | undefined,
    qtyChange: number,
    type: StockMovement['type'],
    notes?: string
  ) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  stockMovements,
  workspace,
  whiteLabel,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const currency = workspace.currency_symbol || whiteLabel.default_currency_symbol;

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (stockStatusFilter === 'low' && (p.stock <= 0 || p.stock > p.min_stock_alert)) {
        return false;
      }
      if (stockStatusFilter === 'out' && p.stock > 0) {
        return false;
      }
      if (stockStatusFilter === 'healthy' && p.stock <= p.min_stock_alert) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = p.title.toLowerCase().includes(q);
        const mSku = p.sku.toLowerCase().includes(q);
        const mBarcode = p.barcode?.toLowerCase().includes(q);
        if (!mTitle && !mSku && !mBarcode) return false;
      }
      return true;
    });
  }, [products, selectedCategory, stockStatusFilter, searchQuery]);

  // Inventory Valuation Metrics
  const valuation = useMemo(() => {
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const totalCostValue = products.reduce((acc, p) => acc + (p.purchase_price * p.stock), 0);
    const totalRetailValue = products.reduce((acc, p) => acc + (p.selling_price * p.stock), 0);
    const projectedProfit = totalRetailValue - totalCostValue;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.min_stock_alert).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return {
      totalProducts: products.length,
      totalUnits,
      totalCostValue,
      totalRetailValue,
      projectedProfit,
      lowStockCount,
      outOfStockCount
    };
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory & Catalog Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time warehouse stock, variant SKUs, valuation, and ledger movements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            Stock Ledger
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Valuation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Catalog SKUs</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {valuation.totalProducts} <span className="text-xs font-normal text-slate-500">items</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {valuation.totalUnits.toLocaleString()} total units on shelf
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Inventory Cost Value (COGS)</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {currency}{valuation.totalCostValue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Total capital tied in current inventory
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Potential Retail Value</div>
          <div className="mt-1.5 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {currency}{valuation.totalRetailValue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Projected sales if all units sold
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400">Stock Health Alerts</div>
          <div className="mt-1.5 flex items-center gap-3">
            <div>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {valuation.lowStockCount}
              </span>{' '}
              <span className="text-[11px] text-slate-500">Low Stock</span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              <span className="text-lg font-bold font-mono text-rose-600">
                {valuation.outOfStockCount}
              </span>{' '}
              <span className="text-[11px] text-slate-500">Sold Out</span>
            </div>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Requires supplier reordering
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title, SKU, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Condition Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Stock Statuses</option>
            <option value="healthy">In Stock (Healthy)</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">SKU / Barcode</th>
                <th className="py-3 px-4 text-right font-semibold">Cost Price</th>
                <th className="py-3 px-4 text-right font-semibold">Selling Price</th>
                <th className="py-3 px-4 text-center font-semibold">Stock Level</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.min_stock_alert;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                              {p.title}
                            </div>
                            {p.variants.length > 0 && (
                              <div className="text-[11px] text-slate-400">
                                {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {p.category}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        <div>{p.sku}</div>
                        {p.barcode && <div className="text-[10px] text-slate-400">{p.barcode}</div>}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        {currency}{p.purchase_price.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {currency}{p.selling_price.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold tabular-nums">
                          <span className={
                            isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                          }>
                            {p.stock}
                          </span>
                          {isOutOfStock ? (
                            <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] rounded uppercase font-semibold">
                              Out
                            </span>
                          ) : isLowStock ? (
                            <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] rounded uppercase font-semibold">
                              Low
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize text-[11px] text-emerald-600 font-medium">
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Adjust Stock"
                            onClick={() => setStockAdjustProduct(p)}
                            className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors cursor-pointer"
                          >
                            Adjust Stock
                          </button>
                          <button
                            title="Edit Product"
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Product"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${p.title}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Stock Adjustment Modal */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Adjust Warehouse Stock
              </h2>
              <button onClick={() => setStockAdjustProduct(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{stockAdjustProduct.title}</div>
              <div className="text-slate-500 font-mono mt-0.5">
                Current Stock: <span className="font-bold text-slate-900 dark:text-white">{stockAdjustProduct.stock}</span> units
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const change = parseInt((form.elements.namedItem('qtyChange') as HTMLInputElement).value, 10);
                const type = (form.elements.namedItem('adjustType') as HTMLSelectElement).value as StockMovement['type'];
                const notes = (form.elements.namedItem('adjustNotes') as HTMLInputElement).value;
                onAdjustStock(stockAdjustProduct.id, undefined, change, type, notes);
                setStockAdjustProduct(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Adjustment Type
                </label>
                <select name="adjustType" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <option value="restock">Restock / New Shipment Received (+)</option>
                  <option value="audit_adjustment">Physical Inventory Count Correction</option>
                  <option value="damage">Damaged / Broken / Expired Stock (-)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantity Change (+ to add, - to subtract)
                </label>
                <input
                  type="number"
                  name="qtyChange"
                  required
                  defaultValue="10"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  name="adjustNotes"
                  placeholder="e.g. Received shipment batch #884 from supplier"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
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
                const title = (form.elements.namedItem('prodTitle') as HTMLInputElement).value;
                const sku = (form.elements.namedItem('prodSku') as HTMLInputElement).value;
                const barcode = (form.elements.namedItem('prodBarcode') as HTMLInputElement).value;
                const category = (form.elements.namedItem('prodCategory') as HTMLInputElement).value;
                const description = (form.elements.namedItem('prodDesc') as HTMLTextAreaElement).value;
                const purchasePrice = parseFloat((form.elements.namedItem('purchasePrice') as HTMLInputElement).value) || 0;
                const sellingPrice = parseFloat((form.elements.namedItem('sellingPrice') as HTMLInputElement).value) || 0;
                const stock = parseInt((form.elements.namedItem('prodStock') as HTMLInputElement).value, 10) || 0;
                const minStock = parseInt((form.elements.namedItem('prodMinStock') as HTMLInputElement).value, 10) || 5;
                const imageUrl = (form.elements.namedItem('prodImg') as HTMLInputElement).value;

                if (editingProduct) {
                  onUpdateProduct(editingProduct.id, {
                    title,
                    sku,
                    barcode,
                    category,
                    description,
                    purchase_price: purchasePrice,
                    selling_price: sellingPrice,
                    stock,
                    min_stock_alert: minStock,
                    image_url: imageUrl
                  });
                } else {
                  onAddProduct({
                    title,
                    sku,
                    barcode,
                    category,
                    description,
                    purchase_price: purchasePrice,
                    selling_price: sellingPrice,
                    stock,
                    min_stock_alert: minStock,
                    status: 'active',
                    image_url: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
                    variants: []
                  });
                }

                setIsAddModalOpen(false);
                setEditingProduct(null);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    name="prodTitle"
                    defaultValue={editingProduct?.title || ''}
                    placeholder="e.g. Wireless ANC Earbuds 32H"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    name="prodSku"
                    defaultValue={editingProduct?.sku || `SKU-${Date.now().toString().slice(-6)}`}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Barcode / EAN
                  </label>
                  <input
                    type="text"
                    name="prodBarcode"
                    defaultValue={editingProduct?.barcode || ''}
                    placeholder="8901234567XX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    name="prodCategory"
                    defaultValue={editingProduct?.category || 'Audio'}
                    placeholder="e.g. Audio, Wearables, Power"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="prodImg"
                    defaultValue={editingProduct?.image_url || ''}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Purchase Price / Cost ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="purchasePrice"
                    defaultValue={editingProduct?.purchase_price || 1200}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Selling Price ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="sellingPrice"
                    defaultValue={editingProduct?.selling_price || 2400}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Stock Count *
                  </label>
                  <input
                    type="number"
                    required
                    name="prodStock"
                    defaultValue={editingProduct?.stock || 25}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="prodMinStock"
                    defaultValue={editingProduct?.min_stock_alert || 5}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Product Description
                  </label>
                  <textarea
                    name="prodDesc"
                    rows={2}
                    defaultValue={editingProduct?.description || ''}
                    placeholder="Key specifications, warranty, dimensions..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Ledger History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Warehouse Stock Movement Ledger
                </h2>
                <p className="text-[11px] text-slate-500">
                  Audit trail of stock deductions, restocks, and returns
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {stockMovements.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  No stock movements recorded yet. Movements trigger when orders are placed, cancelled, or restocked.
                </div>
              ) : (
                stockMovements.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {m.product_title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.notes || m.type} · {new Date(m.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`font-bold tabular-nums text-sm ${
                        m.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Result: {m.resulting_stock} units
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
