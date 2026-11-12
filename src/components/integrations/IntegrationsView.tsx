import React, { useState } from 'react';
import { ECommerceIntegration, BusinessWorkspace, WhiteLabelConfig } from '../../types';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings2,
  X,
  ShieldCheck
} from 'lucide-react';
import { useI18n } from '../../services/i18n';
import {
  testChannelConnection,
  syncChannelOrders,
  saveChannelCredentials,
  loadChannelCredentials,
  clearChannelCredentials,
  type ChannelCredentials,
  type NormalizedChannelOrder
} from '../../services/channelIntegrations';

interface IntegrationsViewProps {
  integrations: ECommerceIntegration[];
  workspace: BusinessWorkspace;
  whiteLabel: WhiteLabelConfig;
  onToggleConnection: (id: string, isConnected: boolean) => void;
  onSyncOrders: (id: string) => number;
  /** Optional: import normalized channel orders into the app store */
  onImportOrders?: (integrationId: string, orders: NormalizedChannelOrder[]) => number;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  workspace,
  whiteLabel,
  onToggleConnection,
  onSyncOrders,
  onImportOrders
}) => {
  const { t } = useI18n();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingInteg, setEditingInteg] = useState<ECommerceIntegration | null>(null);

  const [storeUrl, setStoreUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [region, setRegion] = useState<'na' | 'eu' | 'fe'>('na');

  const channelLogos: Record<string, { badge: string; color: string; desc: string }> = {
    shopify: {
      badge: 'Shopify',
      color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      desc: 'Live Admin API: orders + shop verification via your access token.'
    },
    woocommerce: {
      badge: 'WooCommerce',
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      desc: 'Live REST API: orders via consumer key + secret.'
    },
    amazon: {
      badge: 'Amazon SP-API',
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      desc: 'LWA credential check + SP-API Orders (SigV4 required for full import).'
    },
    ebay: {
      badge: 'eBay',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      desc: 'Coming soon — production connector not enabled yet.'
    },
    etsy: {
      badge: 'Etsy',
      color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      desc: 'Coming soon — production connector not enabled yet.'
    }
  };

  const openConnect = (integ: ECommerceIntegration) => {
    setErrorMsg(null);
    const saved = loadChannelCredentials(integ.id);
    setStoreUrl(saved?.store_url || integ.store_url || '');
    setApiKey(saved?.api_key || '');
    setApiSecret(saved?.api_secret || saved?.client_secret || '');
    setRefreshToken(saved?.refresh_token || '');
    setRegion((saved?.region as any) || 'na');
    setEditingInteg(integ);
  };

  const buildCreds = (integ: ECommerceIntegration): ChannelCredentials => {
    if (integ.channel === 'amazon') {
      return {
        channel: 'amazon',
        client_id: apiKey,
        client_secret: apiSecret,
        refresh_token: refreshToken,
        api_key: apiKey,
        api_secret: apiSecret,
        region
      };
    }
    return {
      channel: integ.channel,
      store_url: storeUrl,
      api_key: apiKey,
      api_secret: apiSecret || undefined
    };
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInteg) return;
    setConnecting(true);
    setErrorMsg(null);
    try {
      const creds = buildCreds(editingInteg);
      const result = await testChannelConnection(creds);
      if (!result.ok) {
        setErrorMsg(result.message || 'Connection failed');
        return;
      }
      saveChannelCredentials(editingInteg.id, creds);
      onToggleConnection(editingInteg.id, true);
      setSyncResult(result.message || `Connected to ${editingInteg.name}`);
      setEditingInteg(null);
      setTimeout(() => setSyncResult(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async (integ: ECommerceIntegration) => {
    setSyncingId(integ.id);
    setSyncResult(null);
    setErrorMsg(null);
    try {
      const saved = loadChannelCredentials(integ.id);
      if (!saved) {
        setErrorMsg('No saved credentials. Disconnect and connect again.');
        return;
      }
      const result = await syncChannelOrders({ ...saved, limit: 50 });
      if (!result.ok && result.message) {
        setErrorMsg(result.message);
        return;
      }
      let imported = result.count;
      if (onImportOrders && result.orders?.length) {
        imported = onImportOrders(integ.id, result.orders);
      } else {
        // Fall back to legacy mock counter if parent has no importer
        onSyncOrders(integ.id);
      }
      const note = result.note ? ` ${result.note}` : '';
      setSyncResult(`Synced ${imported} order(s) from ${integ.name}.${note}`);
      setTimeout(() => setSyncResult(null), 8000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = (integ: ECommerceIntegration) => {
    clearChannelCredentials(integ.id);
    onToggleConnection(integ.id, false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav_integrations', 'Channel Integrations')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Production connectors: Shopify & WooCommerce order APIs; Amazon LWA / SP-API
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Workspace: {workspace.name} · See docs/CHANNEL_INTEGRATIONS.md for API keys
          </p>
        </div>

        {syncResult && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 max-w-md">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="line-clamp-3">{syncResult}</span>
          </div>
        )}
        {errorMsg && !editingInteg && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-800 max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="line-clamp-3">{errorMsg}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((integ) => {
          const meta = channelLogos[integ.channel] || {
            badge: integ.channel.toUpperCase(),
            color: 'bg-slate-100 text-slate-800',
            desc: 'Multi-channel connector.'
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
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Not Connected</span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{integ.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{meta.desc}</p>

                {integ.is_connected && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                    {integ.store_url && (
                      <div className="truncate font-mono">
                        Store: <span className="text-slate-800 dark:text-slate-200">{integ.store_url}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Orders synced (counter):</span>
                      <span className="font-mono font-bold">{integ.orders_synced_count}</span>
                    </div>
                    {integ.last_sync_at && (
                      <div className="text-[10px] text-slate-400">
                        Last sync: {new Date(integ.last_sync_at).toLocaleString()}
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
                      <span>{syncingId === integ.id ? 'Syncing…' : 'Sync Orders'}</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(integ)}
                      className="py-1.5 px-3 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openConnect(integ)}
                    disabled={integ.channel === 'ebay' || integ.channel === 'etsy'}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
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
                Credentials are sent to <strong>/api/integrations/test</strong> on your Vercel backend to verify the live API.
                Use a private Admin token / REST key — never commit secrets to git.
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleConnect} className="space-y-3">
              {editingInteg.channel !== 'amazon' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {editingInteg.channel === 'shopify' ? 'Store domain *' : 'Store URL *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder={
                      editingInteg.channel === 'shopify'
                        ? 'my-store.myshopify.com'
                        : 'https://mystore.com'
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {editingInteg.channel === 'shopify'
                    ? 'Admin API access token *'
                    : editingInteg.channel === 'woocommerce'
                    ? 'Consumer key *'
                    : 'LWA Client ID *'}
                </label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    editingInteg.channel === 'shopify'
                      ? 'shpat_…'
                      : editingInteg.channel === 'woocommerce'
                      ? 'ck_…'
                      : 'amzn1.application-oa2-client.…'
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                />
              </div>

              {(editingInteg.channel === 'woocommerce' || editingInteg.channel === 'amazon') && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {editingInteg.channel === 'woocommerce' ? 'Consumer secret *' : 'LWA Client secret *'}
                  </label>
                  <input
                    type="password"
                    required
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder={editingInteg.channel === 'woocommerce' ? 'cs_…' : 'Client secret'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  />
                </div>
              )}

              {editingInteg.channel === 'amazon' && (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Refresh token *
                    </label>
                    <input
                      type="password"
                      required
                      value={refreshToken}
                      onChange={(e) => setRefreshToken(e.target.value)}
                      placeholder="Atzr|…"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                    >
                      <option value="na">North America (na)</option>
                      <option value="eu">Europe (eu)</option>
                      <option value="fe">Far East (fe)</option>
                    </select>
                  </div>
                </>
              )}

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
                  disabled={connecting}
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer"
                >
                  {connecting ? 'Testing…' : 'Authorize & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
