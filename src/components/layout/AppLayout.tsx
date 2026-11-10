import React, { useState, useEffect } from 'react';
import {
  BusinessWorkspace,
  UserProfile,
  WhiteLabelConfig,
  AppNotification,
  Role
} from '../../types';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../services/i18n';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Truck,
  TrendingUp,
  Receipt,
  Settings,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
  ChevronDown,
  Building2,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Globe,
  Share2,
  Check
} from 'lucide-react';

interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  workspace: BusinessWorkspace;
  workspaces: BusinessWorkspace[];
  currentUser: UserProfile;
  whiteLabel: WhiteLabelConfig;
  notifications: AppNotification[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSwitchWorkspace: (id: string) => void;
  onSwitchRole: (role: Role) => void;
  onResetDemoData: () => void;
  onOpenNewOrder: () => void;
  onOpenOnboarding?: () => void;
  onReturnToLanding: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  workspace,
  workspaces,
  currentUser,
  whiteLabel,
  notifications,
  isDarkMode,
  onToggleDarkMode,
  onSwitchWorkspace,
  onSwitchRole,
  onResetDemoData,
  onOpenNewOrder,
  onOpenOnboarding,
  onReturnToLanding,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  children
}) => {
  const { currentLanguage, setLanguage, t, isRtl } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Sync RTL attribute on document
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [isRtl, currentLanguage]);

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'orders', label: t('nav.orders'), icon: ShoppingBag },
    { id: 'inventory', label: t('nav.inventory'), icon: Package },
    { id: 'customers', label: t('nav.customers'), icon: Users },
    { id: 'couriers', label: t('nav.couriers'), icon: Truck },
    { id: 'integrations', label: t('nav.integrations') || 'eCommerce Channels', icon: Share2 },
    { id: 'analytics', label: t('nav.analytics'), icon: TrendingUp },
    { id: 'expenses', label: t('nav.expenses'), icon: Receipt },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    { id: 'handover', label: t('nav.handover'), icon: ShieldCheck, highlight: true }
  ];

  return (
    <div className={`min-h-screen bg-slate-100/70 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 antialiased ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Sidebar Desktop (Fixed 260px) */}
      <aside className={`hidden lg:flex w-64 flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shrink-0 ${isRtl ? 'border-l' : 'border-r'}`}>
        <div>
          {/* Top Brand Header */}
          <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onReturnToLanding}
              className="text-left group cursor-pointer"
            >
              <div className="font-bold text-base tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
                <span>{whiteLabel.app_name}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-mono font-bold">
                  Global
                </span>
              </div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
                ← {t('brand.return_home')}
              </div>
            </button>
          </div>

          {/* Workspace Switcher Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              <button
                onClick={() => setWorkspaceSwitcherOpen(!workspaceSwitcherOpen)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-left text-xs transition-colors cursor-pointer"
              >
                <div className="min-w-0 pr-1">
                  <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                    <span>{workspace.name}</span>
                    <span className="text-[10px] px-1 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono">
                      {workspace.currency_code || 'USD'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {workspace.country || 'Global'} · {workspace.category}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {workspaceSwitcherOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('workspace.switch')}:
                  </div>
                  {workspaces.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        onSwitchWorkspace(w.id);
                        setWorkspaceSwitcherOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer ${
                        w.id === workspace.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-medium truncate">{w.name}</div>
                        <div className="text-[10px] text-slate-400">{w.country} ({w.currency_code})</div>
                      </div>
                      {w.id === workspace.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                  {onOpenOnboarding && (
                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setWorkspaceSwitcherOpen(false);
                          onOpenOnboarding();
                        }}
                        className="w-full px-3 py-1.5 text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ {t('workspace.create')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2.5 font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-mono">
                      $3K
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Current User & Demo Reset */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2">
          {/* User profile & role selector */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-xs shrink-0">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white truncate text-[11px]">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Role: {currentUser.role}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test RBAC Roles:
                </div>
                {(['owner', 'admin', 'staff'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onSwitchRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left capitalize cursor-pointer ${
                      currentUser.role === r
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Switch to {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to default initial state?')) {
                onResetDemoData();
              }
            }}
            className="w-full py-1.5 px-2 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo Workspace
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Workspace Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Mobile Toggle & Contextual Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {workspace.name}
              </span>
              <span>/</span>
              <span className="capitalize text-slate-600 dark:text-slate-400 truncate">
                {currentTab.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Right: Language, Actions, Notifications, Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change language / تغيير اللغة"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">{currentLangObj.flag} {currentLangObj.nativeName}</span>
                <span className="sm:hidden font-mono uppercase">{currentLangObj.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('common.language') || 'Language'}:
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as SupportedLanguage);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between cursor-pointer transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {currentLanguage === lang.code && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Create Order Button */}
            <button
              onClick={onOpenNewOrder}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('orders.new_order')}
            </button>

            {/* In-App Notifications Drawer */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-40 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Notifications ({unreadNotificationsCount})
                    </span>
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationRead(notif.id);
                            if (notif.link_tab) onTabChange(notif.link_tab);
                            setNotificationsOpen(false);
                          }}
                          className={`p-3 text-left cursor-pointer transition-colors ${
                            !notif.is_read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {notif.title}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {notif.message}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              title="Toggle Dark / Light Theme"
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl z-10 text-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {whiteLabel.app_name}
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 font-medium cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  onReturnToLanding();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-slate-500 hover:underline cursor-pointer"
              >
                ← {t('brand.return_home')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
