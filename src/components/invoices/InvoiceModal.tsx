import React from 'react';
import { Order, BusinessWorkspace, WhiteLabelConfig } from '../../types';
import { formatCurrency } from '../../services/currency';
import { formatLocalizedDate } from '../../services/dateTime';
import { formatAddressSingleLine } from '../../services/addressPhone';
import { useI18n } from '../../services/i18n';
import { X, Printer, Download, CheckCircle, Clock } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  workspace,
  whiteLabel,
  isOpen,
  onClose
}) => {
  const { t } = useI18n();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const currencyCode = order.currency_code || workspace.currency_code || 'USD';
  const invoiceDate = formatLocalizedDate(
    order.created_at,
    workspace.date_format || 'YYYY-MM-DD',
    workspace.timezone || 'UTC'
  );

  // Address rendering
  const addr = order.shipping_address || order.address;
  const recipientAddress = typeof addr === 'object' && addr !== null
    ? [
        addr.address_line1 || addr.line1,
        addr.address_line2 || addr.line2,
        addr.city,
        addr.state_province_region || addr.state_province,
        addr.postal_zip_code || addr.postal_code,
        addr.country
      ].filter(Boolean).join(', ')
    : typeof addr === 'string'
      ? `${addr}, ${order.shipping_city || ''}, ${order.shipping_country_code || workspace.country}`
      : `${order.shipping_city || ''}, ${workspace.country}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Action Header (hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('invoices.title')} #{order.order_number}
            </span>
            <span className="text-xs text-slate-500">· Ready for download & print</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {t('invoices.print')}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* Top Brand & Invoice Details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                {workspace.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                <p>{workspace.address}{workspace.city ? `, ${workspace.city}` : ''}{workspace.country ? `, ${workspace.country}` : ''}</p>
                <p>Phone: {workspace.phone} · Email: {workspace.email}</p>
                {workspace.tax_number && <p className="font-mono">{workspace.tax_config?.tax_name || 'Tax ID / VAT'}: {workspace.tax_number}</p>}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded">
                TAX INVOICE
              </span>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-0.5 font-mono">
                <p>Invoice No: <span className="font-bold text-slate-900 dark:text-white">{order.order_number}</span></p>
                <p>Date: {invoiceDate}</p>
                <p>Currency: <span className="font-bold">{currencyCode}</span></p>
                <p>Payment: <span className="capitalize">{order.payment_method.replace('_', ' ')}</span></p>
                <p className="flex items-center gap-1 sm:justify-end">
                  Status:
                  {order.payment_status === 'paid' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {order.payment_status.toUpperCase()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Recipient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <div className="font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t('invoices.bill_to')}:
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{order.customer_name}</div>
              <div className="text-slate-600 dark:text-slate-400 mt-0.5">{recipientAddress}</div>
              <div className="text-slate-600 dark:text-slate-400 font-mono mt-1">Phone: {order.customer_phone}</div>
              {order.customer_email && <div className="text-slate-600 dark:text-slate-400 font-mono">Email: {order.customer_email}</div>}
            </div>

            <div className="sm:text-right">
              <div className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Dispatch Details:</div>
              <div className="text-slate-700 dark:text-slate-300">
                Courier: <span className="font-semibold">{order.courier_name || 'Standard Courier Dispatch'}</span>
              </div>
              {order.courier_tracking_id && (
                <div className="text-slate-700 dark:text-slate-300 font-mono">
                  Tracking ID: {order.courier_tracking_id}
                </div>
              )}
              {order.consignment_id && (
                <div className="text-slate-700 dark:text-slate-300 font-mono">
                  Consignment: {order.consignment_id}
                </div>
              )}
              {order.package_weight_kg && (
                <div className="text-slate-500 font-mono text-[11px]">
                  Weight: {order.package_weight_kg} kg
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-2 font-semibold">{t('invoices.item')}</th>
                  <th className="pb-2 text-center font-semibold">{t('invoices.qty')}</th>
                  <th className="pb-2 text-right font-semibold">{t('invoices.unit_price')}</th>
                  <th className="pb-2 text-right font-semibold">{t('invoices.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {order.items.map((item) => (
                  <tr key={item.id} className="py-2.5">
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.product_title}</div>
                      {item.variant_name && (
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">{item.variant_name}</div>
                      )}
                      <div className="text-slate-400 font-mono text-[10px]">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 text-center font-mono tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {formatCurrency(item.unit_price, currencyCode)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(item.total_price, currencyCode)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown Summary */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t('invoices.subtotal')}:</span>
                <span className="font-mono tabular-nums">{formatCurrency(order.subtotal, currencyCode)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>{t('invoices.discount')}:</span>
                  <span className="font-mono tabular-nums">-{formatCurrency(order.discount, currencyCode)}</span>
                </div>
              )}
              {order.tax_amount !== undefined && order.tax_amount > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{order.tax_name || 'Tax'} ({order.tax_rate || 0}%):</span>
                  <span className="font-mono tabular-nums">{formatCurrency(order.tax_amount, currencyCode)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t('invoices.shipping')}:</span>
                <span className="font-mono tabular-nums">{formatCurrency(order.delivery_charge, currencyCode)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-950 dark:text-white">
                <span>{t('invoices.grand_total')}:</span>
                <span className="font-mono tabular-nums">{formatCurrency(order.total_amount, currencyCode)}</span>
              </div>
              {order.payment_method === 'cod' && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 text-right pt-0.5">
                  Collect via Cash on Delivery
                </div>
              )}
            </div>
          </div>

          {/* Notes & Terms Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Terms & Return Policy:</div>
            <p>{whiteLabel.invoice_footer_note}</p>
            <div className="mt-3 flex items-center justify-between text-slate-400 text-[10px]">
              <span>Generated securely by {whiteLabel.app_name} Global SaaS</span>
              <span>Authorized Merchant Signature: ______________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
