/**
 * OrderFlow i18n — 11 languages, RTL for Arabic.
 * Keys accept dots or underscores (nav.dashboard → nav_dashboard).
 */
import { useState, useEffect } from 'react';

export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ar'
  | 'ja'
  | 'ko'
  | 'zh'
  | 'hi'
  | 'bn';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', direction: 'ltr' }
];

const STORAGE_LANG_KEY = 'orderflow_active_language';

const NAV_KEYS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    nav_dashboard: 'Main Dashboard',
    nav_orders: 'Orders & Fulfillment',
    nav_inventory: 'Inventory & Catalog',
    nav_customers: 'Customer CRM',
    nav_couriers: 'Shipping & Couriers',
    nav_analytics: 'Financial P&L Analytics',
    nav_expenses: 'Expense Ledger',
    nav_integrations: 'Channel Integrations',
    nav_settings: 'Store & Global Settings',
    nav_handover: 'Commercial Handover',
    brand_return_home: 'Return to home',
    orders_new_order: 'New Order',
    workspace_create: 'Create Workspace',
    workspace_switch: 'Switch workspace',
    common_language: 'Language'
  },
  es: {
    nav_dashboard: 'Panel Principal',
    nav_orders: 'Pedidos y Cumplimiento',
    nav_inventory: 'Inventario y Catálogo',
    nav_customers: 'CRM de Clientes',
    nav_couriers: 'Envíos y Mensajería',
    nav_analytics: 'Finanzas y Pérdidas/Ganancias',
    nav_expenses: 'Libro de Gastos',
    nav_integrations: 'Integraciones de Tiendas',
    nav_settings: 'Configuración Global',
    nav_handover: 'Traspaso Comercial',
    brand_return_home: 'Volver al inicio',
    orders_new_order: 'Nuevo pedido',
    workspace_create: 'Crear espacio de trabajo',
    workspace_switch: 'Cambiar espacio',
    common_language: 'Idioma'
  },
  fr: {
    nav_dashboard: 'Tableau de Bord',
    nav_orders: 'Commandes',
    nav_inventory: 'Stock',
    nav_customers: 'Clients',
    nav_couriers: 'Transporteurs',
    nav_analytics: 'Analyses',
    nav_expenses: 'Dépenses',
    nav_integrations: 'Intégrations',
    nav_settings: 'Paramètres',
    nav_handover: 'Transmission',
    brand_return_home: 'Accueil',
    orders_new_order: 'Nouvelle commande',
    workspace_create: 'Créer un espace',
    workspace_switch: 'Changer',
    common_language: 'Langue'
  },
  de: {
    nav_dashboard: 'Dashboard',
    nav_orders: 'Bestellungen',
    nav_inventory: 'Lager',
    nav_customers: 'Kunden',
    nav_couriers: 'Versand',
    nav_analytics: 'Analysen',
    nav_expenses: 'Ausgaben',
    nav_integrations: 'Integrationen',
    nav_settings: 'Einstellungen',
    nav_handover: 'Übergabe',
    brand_return_home: 'Startseite',
    orders_new_order: 'Neue Bestellung',
    workspace_create: 'Arbeitsbereich',
    workspace_switch: 'Wechseln',
    common_language: 'Sprache'
  },
  pt: {
    nav_dashboard: 'Painel',
    nav_orders: 'Pedidos',
    nav_inventory: 'Estoque',
    nav_customers: 'Clientes',
    nav_couriers: 'Entregas',
    nav_analytics: 'Análises',
    nav_expenses: 'Despesas',
    nav_integrations: 'Integrações',
    nav_settings: 'Configurações',
    nav_handover: 'Transferência',
    brand_return_home: 'Início',
    orders_new_order: 'Novo pedido',
    workspace_create: 'Criar espaço',
    workspace_switch: 'Trocar',
    common_language: 'Idioma'
  },
  ar: {
    nav_dashboard: 'لوحة التحكم',
    nav_orders: 'الطلبات',
    nav_inventory: 'المخزون',
    nav_customers: 'العملاء',
    nav_couriers: 'الشحن',
    nav_analytics: 'التحليلات',
    nav_expenses: 'المصروفات',
    nav_integrations: 'التكاملات',
    nav_settings: 'الإعدادات',
    nav_handover: 'التسليم',
    brand_return_home: 'العودة للرئيسية',
    orders_new_order: 'طلب جديد',
    workspace_create: 'إنشاء مساحة',
    workspace_switch: 'تبديل',
    common_language: 'اللغة'
  },
  ja: {
    nav_dashboard: 'ダッシュボード',
    nav_orders: '注文',
    nav_inventory: '在庫',
    nav_customers: '顧客',
    nav_couriers: '配送',
    nav_analytics: '分析',
    nav_expenses: '経費',
    nav_integrations: '連携',
    nav_settings: '設定',
    nav_handover: '引き継ぎ',
    brand_return_home: 'ホーム',
    orders_new_order: '新規注文',
    workspace_create: 'ワークスペース作成',
    workspace_switch: '切替',
    common_language: '言語'
  },
  ko: {
    nav_dashboard: '대시보드',
    nav_orders: '주문',
    nav_inventory: '재고',
    nav_customers: '고객',
    nav_couriers: '배송',
    nav_analytics: '분석',
    nav_expenses: '비용',
    nav_integrations: '연동',
    nav_settings: '설정',
    nav_handover: '인수인계',
    brand_return_home: '홈',
    orders_new_order: '새 주문',
    workspace_create: '워크스페이스',
    workspace_switch: '전환',
    common_language: '언어'
  },
  zh: {
    nav_dashboard: '仪表盘',
    nav_orders: '订单',
    nav_inventory: '库存',
    nav_customers: '客户',
    nav_couriers: '物流',
    nav_analytics: '分析',
    nav_expenses: '支出',
    nav_integrations: '集成',
    nav_settings: '设置',
    nav_handover: '交接',
    brand_return_home: '首页',
    orders_new_order: '新建订单',
    workspace_create: '创建工作区',
    workspace_switch: '切换',
    common_language: '语言'
  },
  hi: {
    nav_dashboard: 'डैशबोर्ड',
    nav_orders: 'ऑर्डर',
    nav_inventory: 'इन्वेंटरी',
    nav_customers: 'ग्राहक',
    nav_couriers: 'शिपिंग',
    nav_analytics: 'विश्लेषण',
    nav_expenses: 'खर्च',
    nav_integrations: 'इंटीग्रेशन',
    nav_settings: 'सेटिंग्स',
    nav_handover: 'हैंडओवर',
    brand_return_home: 'होम',
    orders_new_order: 'नया ऑर्डर',
    workspace_create: 'वर्कस्पेस',
    workspace_switch: 'बदलें',
    common_language: 'भाषा'
  },
  bn: {
    nav_dashboard: 'মূল ড্যাশবোর্ড',
    nav_orders: 'অর্ডার ও ডেলিভারি',
    nav_inventory: 'ইনভেন্টরি ও ক্যাটালগ',
    nav_customers: 'কাস্টমার CRM',
    nav_couriers: 'কুরিয়ার',
    nav_analytics: 'আর্থিক P&L বিশ্লেষণ',
    nav_expenses: 'খরচের খাতা',
    nav_integrations: 'চ্যানেল ইন্টিগ্রেশন',
    nav_settings: 'স্টোর সেটিংস',
    nav_handover: 'হ্যান্ডওভার',
    brand_return_home: 'হোমে ফিরুন',
    orders_new_order: 'নতুন অর্ডার',
    workspace_create: 'ওয়ার্কস্পেস তৈরি',
    workspace_switch: 'ওয়ার্কস্পেস বদলান',
    common_language: 'ভাষা'
  }
};

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = NAV_KEYS;

export function detectBrowserLocale(): SupportedLanguage {
  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserCode = navigator.language.split('-')[0].toLowerCase() as SupportedLanguage;
    if (TRANSLATIONS[browserCode]) return browserCode;
  }
  return 'en';
}

let currentLanguage: SupportedLanguage = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage;
    if (saved && TRANSLATIONS[saved]) return saved;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
})();

const langListeners = new Set<(lang: SupportedLanguage) => void>();

export function setApplicationLanguage(lang: SupportedLanguage) {
  if (!TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch {
    /* ignore */
  }
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = meta?.direction || 'ltr';
  }
  langListeners.forEach((fn) => fn(lang));
}

export function getApplicationLanguage(): SupportedLanguage {
  return currentLanguage;
}

function normalizeKey(key: string): string {
  return key.replace(/\./g, '_');
}

export function translate(key: string, fallback?: string): string {
  const k = normalizeKey(key);
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  return dict[k] || TRANSLATIONS.en[k] || fallback || key;
}

export function useI18n() {
  const [lang, setLang] = useState<SupportedLanguage>(() => getApplicationLanguage());

  useEffect(() => {
    const listener = (newLang: SupportedLanguage) => setLang(newLang);
    langListeners.add(listener);
    setLang(getApplicationLanguage());
    return () => {
      langListeners.delete(listener);
    };
  }, []);

  const setLanguage = (next: SupportedLanguage) => {
    setApplicationLanguage(next);
    setLang(next);
  };

  const t = (key: string, fallback?: string) => {
    const k = normalizeKey(key);
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[k] || TRANSLATIONS.en[k] || fallback || key;
  };

  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return {
    language: lang,
    currentLanguage: lang,
    setLanguage,
    t,
    isRtl: currentMeta.direction === 'rtl',
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentMeta
  };
}
