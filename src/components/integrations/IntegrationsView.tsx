import React, { useState } from 'react';
import { ECommerceIntegration, BusinessWorkspace, WhiteLabelConfig } from '../../types';
import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Settings2,
  X,
  ShieldCheck,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useI18n } from '../../services/i18n';

interface IntegrationsViewProps {
  integrations: ECommerceIntegration[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onToggleConnection: (id: string, isConnected: boolean) => void;
  onSyncOrders: (id: string) => number;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  workspace,
  whiteLabel,
  onToggleConnection,
  onSyncOrders
}) => {
  const { t } = useI18n();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [editingInteg, setEditingInteg] = useState<ECommerceIntegration | null>(null);

  const channelLogos: Record<string, { badge: string; color: string; desc: string }> = {
    shopify: {
      badge: 'Shopify',
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      desc: 'Synchronize online orders, fulfillments, and real-time inventory from your Shopify store.'
    },
    woocommerce: {
      badge: 'WooCommerce',
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      desc: 'Two-way order and stock synchronization with your WordPress WooCommerce store via REST API.'
    },
    amazon: {
      badge: 'Amazon FBM',
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      desc: 'Import Merchant-Fulfilled Network (MFN/FBM) customer orders from Amazon Marketplace.'
    },
    ebay: {
      badge: 'eBay',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      desc: 'Import orders from global eBay auction and fixed-price listings automatically.'
    },
    etsy: {
      badge: 'Etsy',
      color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      desc: 'Connect your handmade and vintage Etsy storefront to print labels and manage inventory.'
    }
  };

  const handleSync = (integ: ECommerceIntegration) => {
    setSyncingId(integ.id);
    setSyncResult(null);
    setTimeout(() => {
      const imported = onSyncOrders(integ.id);
      setSyncingId(null);
      setSyncResult(`Successfully synchronized ${imported} new orders from ${integ.name}!`);
      setTimeout(() => setSyncResult(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_integrations', 'Channel Integrations')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Connect global e-commerce channels (Shopify, WooCommerce, Amazon) to centralize inventory & orders
          </p>
        </div>

        {syncResult && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncResult}</span>
          </div>
        )}
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((integ) => {
          const meta = channelLogos[integ.channel] || {
            badge: integ.channel.toUpperCase(),
            color: 'bg-slate-100 text-slate-800',
            desc: 'Multi-channel e-commerce store connector.'
          };

          return (
            <div
              key={integ.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${meta.color}`}>
                    {meta.badge}
                  </span>

                  {integ.is_connected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active & Synced
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      Not Configured
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {integ.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {meta.desc}
                </p>

                {integ.is_connected && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                    {integ.store_url && (
                      <div className="truncate font-mono">
                        Store: <span className="text-slate-800 dark:text-slate-200">{integ.store_url}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Synced Orders:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{integ.orders_synced_count}</span>
                    </div>
                    {integ.last_sync_at && (
                      <div className="text-[10px] text-slate-400">
                        Last sync: {new Date(integ.last_sync_at).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {integ.is_connected ? (
                  <>
                    <button
                      disabled={syncingId === integ.id}
                      onClick={() => handleSync(integ)}
                      className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === integ.id ? 'animate-spin' : ''}`} />
                      <span>{syncingId === integ.id ? 'Syncing...' : 'Sync Orders'}</span>
                    </button>
                    <button
                      onClick={() => onToggleConnection(integ.id, false)}
                      className="py-1.5 px-3 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingInteg(integ)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Connect Store API
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Setup Modal */}
      {editingInteg && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Connect {editingInteg.name}
              </h2>
              <button onClick={() => setEditingInteg(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-indigo-900 dark:text-indigo-200 text-[11px] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
              <div>
                OrderFlow communicates directly with the official {editingInteg.name} REST/GraphQL API. Credentials are kept securely isolated per tenant workspace.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onToggleConnection(editingInteg.id, true);
                setEditingInteg(null);
                setSyncResult(`Connected to ${editingInteg.name}! Initial orders imported.`);
                setTimeout(() => setSyncResult(null), 4000);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Store Domain / Endpoint URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. my-store.myshopify.com"
                  defaultValue={editingInteg.store_url || ''}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  API Key / Access Token *
                </label>
                <input
                  type="password"
                  required
                  placeholder="shpat_xxxxxxxxxxxxxxxxx"
                  defaultValue="shpat_sample_access_token_88921"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInteg(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Authorize & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
