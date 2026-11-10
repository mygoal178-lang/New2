/**
 * ORDERFLOW - International Multilingual Translation & Localization Service
 * Supports 11 languages with full bidirectional RTL support for Arabic.
 */

import { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
export type { SupportedLanguage };

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

// Complete dictionary of translations across core SaaS domains
export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    nav_dashboard: 'Main Dashboard',
    nav_orders: 'Orders & Fulfillment',
    nav_inventory: 'Inventory & Catalog',
    nav_customers: 'Customer CRM',
    nav_shipping: 'Shipping & Logistics',
    nav_analytics: 'Financial P&L Analytics',
    nav_expenses: 'Expense Ledger',
    nav_integrations: 'Channel Integrations',
    nav_settings: 'Store & Global Settings',
    nav_handover: 'Commercial Handover',

    // Actions
    btn_create_order: 'Create Order',
    btn_add_product: 'Add Product',
    btn_record_expense: 'Record Expense',
    btn_export_csv: 'Export CSV',
    btn_print_report: 'Print Statement',
    btn_save: 'Save Changes',
    btn_cancel: 'Cancel',
    btn_edit: 'Edit',
    btn_delete: 'Delete',
    btn_search: 'Search...',
    btn_filter: 'Filter',
    btn_details: 'Details',
    btn_invoice: 'Invoice',
    btn_dispatch: 'Dispatch Parcel',
    btn_switch_workspace: 'Switch Workspace',

    // Dashboard metrics
    metric_gross_sales: 'Gross Order Value',
    metric_collected_revenue: 'Collected Realized Revenue',
    metric_recorded_expenses: 'Recorded Operating Expenses',
    metric_net_profit: 'Estimated Net Profit',
    metric_outstanding_cod: 'In-Transit Cash on Delivery',
    metric_stock_alerts: 'Low Stock Alert',
    metric_total_orders: 'Total Orders Processed',

    // Statuses
    status_pending: 'Pending',
    status_confirmed: 'Confirmed',
    status_processing: 'Processing',
    status_ready_to_ship: 'Ready To Ship',
    status_shipped: 'Shipped',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
    status_returned: 'Returned',

    // Payment statuses
    pay_paid: 'Paid',
    pay_unpaid: 'Unpaid',
    pay_partially_paid: 'Partial',
    pay_refunded: 'Refunded',

    // Invoicing
    inv_title: 'Commercial Tax Invoice',
    inv_billed_to: 'Billed & Shipped To',
    inv_date: 'Invoice Date',
    inv_no: 'Invoice Number',
    inv_subtotal: 'Subtotal',
    inv_discount: 'Discount',
    inv_shipping_fee: 'Shipping & Handling',
    inv_tax_vat: 'Tax / VAT',
    inv_total_due: 'Grand Total Due',
    inv_payment_method: 'Payment Method',
    inv_terms: 'Terms & Return Policy',

    // Global
    lbl_country: 'Country',
    lbl_currency: 'Currency',
    lbl_timezone: 'Time Zone',
    lbl_language: 'Language',
    lbl_address: 'Address',
    lbl_city: 'City',
    lbl_postal_code: 'Postal / ZIP Code',
    lbl_state_region: 'State / Province / Region',
    lbl_tax_number: 'Tax ID / VAT Number'
  },

  es: {
    nav_dashboard: 'Panel Principal',
    nav_orders: 'Pedidos y Cumplimiento',
    nav_inventory: 'Inventario y Catálogo',
    nav_customers: 'CRM de Clientes',
    nav_shipping: 'Envíos y Logística',
    nav_analytics: 'Finanzas y Pérdidas/Ganancias',
    nav_expenses: 'Libro de Gastos',
    nav_integrations: 'Integraciones de Tiendas',
    nav_settings: 'Configuración Global',
    nav_handover: 'Traspaso Comercial',

    btn_create_order: 'Crear Pedido',
    btn_add_product: 'Añadir Producto',
    btn_record_expense: 'Registrar Gasto',
    btn_export_csv: 'Exportar CSV',
    btn_print_report: 'Imprimir Informe',
    btn_save: 'Guardar Cambios',
    btn_cancel: 'Cancelar',
    btn_edit: 'Editar',
    btn_delete: 'Eliminar',
    btn_search: 'Buscar...',
    btn_filter: 'Filtrar',
    btn_details: 'Detalles',
    btn_invoice: 'Factura',
    btn_dispatch: 'Despachar Paquete',
    btn_switch_workspace: 'Cambiar Tienda',

    metric_gross_sales: 'Valor Bruto de Pedidos',
    metric_collected_revenue: 'Ingresos Cobrados',
    metric_recorded_expenses: 'Gastos Operativos',
    metric_net_profit: 'Beneficio Neto Estimado',
    metric_outstanding_cod: 'Cobro en Destino en Tránsito',
    metric_stock_alerts: 'Alerta de Stock Bajo',
    metric_total_orders: 'Total de Pedidos',

    status_pending: 'Pendiente',
    status_confirmed: 'Confirmado',
    status_processing: 'En Proceso',
    status_ready_to_ship: 'Listo para Enviar',
    status_shipped: 'Enviado',
    status_delivered: 'Entregado',
    status_cancelled: 'Cancelado',
    status_returned: 'Devuelto',

    pay_paid: 'Pagado',
    pay_unpaid: 'No Pagado',
    pay_partially_paid: 'Parcial',
    pay_refunded: 'Reembolsado',

    inv_title: 'Factura Fiscal Comercial',
    inv_billed_to: 'Facturado y Enviado a',
    inv_date: 'Fecha de Factura',
    inv_no: 'Número de Factura',
    inv_subtotal: 'Subtotal',
    inv_discount: 'Descuento',
    inv_shipping_fee: 'Gastos de Envío',
    inv_tax_vat: 'Impuestos / IVA',
    inv_total_due: 'Total a Pagar',
    inv_payment_method: 'Método de Pago',
    inv_terms: 'Términos y Política de Devolución',

    lbl_country: 'País',
    lbl_currency: 'Moneda',
    lbl_timezone: 'Zona Horaria',
    lbl_language: 'Idioma',
    lbl_address: 'Dirección',
    lbl_city: 'Ciudad',
    lbl_postal_code: 'Código Postal',
    lbl_state_region: 'Estado / Provincia',
    lbl_tax_number: 'NIF / CIF / IVA'
  },

  fr: {
    nav_dashboard: 'Tableau de Bord',
    nav_orders: 'Commandes et Livraisons',
    nav_inventory: 'Stock et Catalogue',
    nav_customers: 'CRM Clients',
    nav_shipping: 'Expédition et Transport',
    nav_analytics: 'Résultats Financiers (P&L)',
    nav_expenses: 'Grand Livre des Dépenses',
    nav_integrations: 'Canaux E-Commerce',
    nav_settings: 'Paramètres Généraux',
    nav_handover: 'Transmission Commerciale',

    btn_create_order: 'Créer Commande',
    btn_add_product: 'Ajouter Produit',
    btn_record_expense: 'Enregistrer Dépense',
    btn_export_csv: 'Exporter CSV',
    btn_print_report: 'Imprimer Bilan',
    btn_save: 'Enregistrer',
    btn_cancel: 'Annuler',
    btn_edit: 'Modifier',
    btn_delete: 'Supprimer',
    btn_search: 'Rechercher...',
    btn_filter: 'Filtrer',
    btn_details: 'Détails',
    btn_invoice: 'Facture',
    btn_dispatch: 'Expédier Colis',
    btn_switch_workspace: 'Changer de Boutique',

    metric_gross_sales: 'Chiffre d’Affaires Brut',
    metric_collected_revenue: 'Revenus Encaissés',
    metric_recorded_expenses: 'Dépenses Opérationnelles',
    metric_net_profit: 'Bénéfice Net Estimé',
    metric_outstanding_cod: 'Paiements à la Livraison en Cours',
    metric_stock_alerts: 'Alerte Stock Faible',
    metric_total_orders: 'Total Commandes',

    status_pending: 'En attente',
    status_confirmed: 'Confirmée',
    status_processing: 'En préparation',
    status_ready_to_ship: 'Prêt à expédier',
    status_shipped: 'Expédiée',
    status_delivered: 'Livrée',
    status_cancelled: 'Annulée',
    status_returned: 'Retournée',

    pay_paid: 'Payé',
    pay_unpaid: 'Impayé',
    pay_partially_paid: 'Partiel',
    pay_refunded: 'Remboursé',

    inv_title: 'Facture Commerciale',
    inv_billed_to: 'Facturé et Livré à',
    inv_date: 'Date de Facture',
    inv_no: 'N° de Facture',
    inv_subtotal: 'Sous-total',
    inv_discount: 'Remise',
    inv_shipping_fee: 'Frais de Port',
    inv_tax_vat: 'TVA / Taxes',
    inv_total_due: 'Total Net à Payer',
    inv_payment_method: 'Mode de Paiement',
    inv_terms: 'Conditions Générales et Retours',

    lbl_country: 'Pays',
    lbl_currency: 'Devise',
    lbl_timezone: 'Fuseau Horaire',
    lbl_language: 'Langue',
    lbl_address: 'Adresse',
    lbl_city: 'Ville',
    lbl_postal_code: 'Code Postal',
    lbl_state_region: 'Région / Département',
    lbl_tax_number: 'N° TVA Intracommunautaire'
  },

  de: {
    nav_dashboard: 'Übersicht & Dashboard',
    nav_orders: 'Bestellungen & Versand',
    nav_inventory: 'Warenbestand & Katalog',
    nav_customers: 'Kundenverwaltung (CRM)',
    nav_shipping: 'Logistik & Paketversand',
    nav_analytics: 'Finanzen & GuV-Bericht',
    nav_expenses: 'Betriebsausgaben',
    nav_integrations: 'Shop-Schnittstellen',
    nav_settings: 'Globale Einstellungen',
    nav_handover: 'Asset-Übergabe',

    btn_create_order: 'Bestellung anlegen',
    btn_add_product: 'Produkt hinzufügen',
    btn_record_expense: 'Ausgabe buchen',
    btn_export_csv: 'CSV exportieren',
    btn_print_report: 'Bericht drucken',
    btn_save: 'Speichern',
    btn_cancel: 'Abbrechen',
    btn_edit: 'Bearbeiten',
    btn_delete: 'Löschen',
    btn_search: 'Suchen...',
    btn_filter: 'Filtern',
    btn_details: 'Details',
    btn_invoice: 'Rechnung',
    btn_dispatch: 'Paket versenden',
    btn_switch_workspace: 'Mandant wechseln',

    metric_gross_sales: 'Bruttobestellwert',
    metric_collected_revenue: 'Realisierter Umsatz',
    metric_recorded_expenses: 'Betriebsausgaben',
    metric_net_profit: 'Geschätzter Reingewinn',
    metric_outstanding_cod: 'Offene Nachnahmezahlungen',
    metric_stock_alerts: 'Geringer Lagerbestand',
    metric_total_orders: 'Gesamte Aufträge',

    status_pending: 'Ausstehend',
    status_confirmed: 'Bestätigt',
    status_processing: 'In Bearbeitung',
    status_ready_to_ship: 'Versandbereit',
    status_shipped: 'Versandt',
    status_delivered: 'Zugestellt',
    status_cancelled: 'Storniert',
    status_returned: 'Retoure',

    pay_paid: 'Bezahlt',
    pay_unpaid: 'Offen',
    pay_partially_paid: 'Teilweise',
    pay_refunded: 'Erstattet',

    inv_title: 'Handelsrechnung',
    inv_billed_to: 'Rechnungs- und Lieferadresse',
    inv_date: 'Rechnungsdatum',
    inv_no: 'Rechnungsnummer',
    inv_subtotal: 'Zwischensumme',
    inv_discount: 'Rabatt',
    inv_shipping_fee: 'Versandkosten',
    inv_tax_vat: 'Umsatzsteuer (MwSt.)',
    inv_total_due: 'Gesamtbetrag',
    inv_payment_method: 'Zahlungsart',
    inv_terms: 'Widerrufsbelehrung & AGB',

    lbl_country: 'Land',
    lbl_currency: 'Währung',
    lbl_timezone: 'Zeitzone',
    lbl_language: 'Sprache',
    lbl_address: 'Straße & Hausnummer',
    lbl_city: 'Stadt',
    lbl_postal_code: 'Postleitzahl (PLZ)',
    lbl_state_region: 'Bundesland / Region',
    lbl_tax_number: 'USt-IdNr.'
  },

  pt: {
    nav_dashboard: 'Painel Geral',
    nav_orders: 'Pedidos e Entregas',
    nav_inventory: 'Estoque e Catálogo',
    nav_customers: 'CRM de Clientes',
    nav_shipping: 'Frete e Envio',
    nav_analytics: 'Relatórios Financeiros',
    nav_expenses: 'Livro de Despesas',
    nav_integrations: 'Canais de Venda',
    nav_settings: 'Configurações Globais',
    nav_handover: 'Transferência Comercial',

    btn_create_order: 'Criar Pedido',
    btn_add_product: 'Adicionar Produto',
    btn_record_expense: 'Lançar Despesa',
    btn_export_csv: 'Exportar CSV',
    btn_print_report: 'Imprimir Balanço',
    btn_save: 'Salvar',
    btn_cancel: 'Cancelar',
    btn_edit: 'Editar',
    btn_delete: 'Excluir',
    btn_search: 'Pesquisar...',
    btn_filter: 'Filtrar',
    btn_details: 'Detalhes',
    btn_invoice: 'Fatura',
    btn_dispatch: 'Despachar Pacote',
    btn_switch_workspace: 'Trocar Loja',

    metric_gross_sales: 'Valor Bruto de Vendas',
    metric_collected_revenue: 'Receita Realizada',
    metric_recorded_expenses: 'Despesas Operacionais',
    metric_net_profit: 'Lucro Líquido Estimado',
    metric_outstanding_cod: 'Cobrança na Entrega em Trânsito',
    metric_stock_alerts: 'Alerta de Estoque Baixo',
    metric_total_orders: 'Total de Pedidos',

    status_pending: 'Pendente',
    status_confirmed: 'Confirmado',
    status_processing: 'Em Preparação',
    status_ready_to_ship: 'Pronto para Envio',
    status_shipped: 'Enviado',
    status_delivered: 'Entregue',
    status_cancelled: 'Cancelado',
    status_returned: 'Devolvido',

    pay_paid: 'Pago',
    pay_unpaid: 'Não Pago',
    pay_partially_paid: 'Parcial',
    pay_refunded: 'Reembolsado',

    inv_title: 'Nota Fiscal / Fatura Comercial',
    inv_billed_to: 'Faturado e Enviado Para',
    inv_date: 'Data de Emissão',
    inv_no: 'Número da Fatura',
    inv_subtotal: 'Subtotal',
    inv_discount: 'Desconto',
    inv_shipping_fee: 'Taxa de Frete',
    inv_tax_vat: 'Impostos / IVA',
    inv_total_due: 'Valor Total Devido',
    inv_payment_method: 'Forma de Pagamento',
    inv_terms: 'Políticas de Devolução e Garantia',

    lbl_country: 'País',
    lbl_currency: 'Moeda',
    lbl_timezone: 'Fuso Horário',
    lbl_language: 'Idioma',
    lbl_address: 'Endereço',
    lbl_city: 'Cidade',
    lbl_postal_code: 'CEP / Código Postal',
    lbl_state_region: 'Estado / Região',
    lbl_tax_number: 'CNPJ / CPF / NIF'
  },

  ar: {
    nav_dashboard: 'لوحة التحكم الرئيسية',
    nav_orders: 'إدارة الطلبات والشحن',
    nav_inventory: 'المخزون والمنتجات',
    nav_customers: 'إدارة العملاء',
    nav_shipping: 'شركات الشحن والتوصيل',
    nav_analytics: 'الأرباح والتقارير المالية',
    nav_expenses: 'سجل المصروفات',
    nav_integrations: 'ربط المتاجر الإلكترونية',
    nav_settings: 'إعدادات المتجر العامة',
    nav_handover: 'تسليم النظام التجاري',

    btn_create_order: 'إنشاء طلب جديد',
    btn_add_product: 'إضافة منتج',
    btn_record_expense: 'تسجيل مصروف',
    btn_export_csv: 'تصدير كملف CSV',
    btn_print_report: 'طباعة التقرير',
    btn_save: 'حفظ التغييرات',
    btn_cancel: 'إلغاء',
    btn_edit: 'تعديل',
    btn_delete: 'حذف',
    btn_search: 'بحث...',
    btn_filter: 'تصفية',
    btn_details: 'التفاصيل',
    btn_invoice: 'فاتورة ضريبية',
    btn_dispatch: 'إرسال الشحنة',
    btn_switch_workspace: 'تبديل مساحة العمل',

    metric_gross_sales: 'إجمالي قيمة المبيعات',
    metric_collected_revenue: 'الإيرادات المحصلة الفعلية',
    metric_recorded_expenses: 'إجمالي المصروفات',
    metric_net_profit: 'صافي الربح التقديري',
    metric_outstanding_cod: 'مبالغ الدفع عند الاستلام المعلقة',
    metric_stock_alerts: 'تنبيه انخفاض المخزون',
    metric_total_orders: 'إجمالي الطلبات المنجزة',

    status_pending: 'قيد الانتظار',
    status_confirmed: 'تم التأكيد',
    status_processing: 'قيد التجهيز',
    status_ready_to_ship: 'جاهز للشحن',
    status_shipped: 'تم الشحن',
    status_delivered: 'تم التوصيل',
    status_cancelled: 'ملغي',
    status_returned: 'مرتجع',

    pay_paid: 'مدفوع',
    pay_unpaid: 'غير مدفوع',
    pay_partially_paid: 'دفع جزئي',
    pay_refunded: 'مسترجع',

    inv_title: 'فاتورة ضريبية تجارية',
    inv_billed_to: 'فاتورة وشحن إلى',
    inv_date: 'تاريخ الفاتورة',
    inv_no: 'رقم الفاتورة',
    inv_subtotal: 'المجموع الفرعي',
    inv_discount: 'الخصم',
    inv_shipping_fee: 'رسوم الشحن والتوصيل',
    inv_tax_vat: 'ضريبة القيمة المضافة',
    inv_total_due: 'المبلغ الإجمالي المستحق',
    inv_payment_method: 'طريقة الدفع',
    inv_terms: 'شروط الإرجاع والضمان',

    lbl_country: 'الدولة',
    lbl_currency: 'العملة',
    lbl_timezone: 'المنطقة الزمنية',
    lbl_language: 'اللغة',
    lbl_address: 'العنوان بالتفصيل',
    lbl_city: 'المدينة',
    lbl_postal_code: 'الرمز البريدي',
    lbl_state_region: 'المنطقة / المحافظة',
    lbl_tax_number: 'الرقم الضريبي'
  },

  ja: {
    nav_dashboard: 'ダッシュボード',
    nav_orders: '注文管理と出荷',
    nav_inventory: '在庫と商品カタログ',
    nav_customers: '顧客管理 (CRM)',
    nav_shipping: '配送・運送管理',
    nav_analytics: '売上と損益計算 (P&L)',
    nav_expenses: '経費管理台帳',
    nav_integrations: 'ECモール連携',
    nav_settings: 'ストア設定',
    nav_handover: '譲渡・資産パッケージ',

    btn_create_order: '新規注文を作成',
    btn_add_product: '商品を追加',
    btn_record_expense: '経費を登録',
    btn_export_csv: 'CSVエクスポート',
    btn_print_report: '帳票を印刷',
    btn_save: '保存',
    btn_cancel: 'キャンセル',
    btn_edit: '編集',
    btn_delete: '削除',
    btn_search: '検索...',
    btn_filter: '絞り込み',
    btn_details: '詳細',
    btn_invoice: '請求書 / 納品書',
    btn_dispatch: '荷物を出荷',
    btn_switch_workspace: '店舗を切り替え',

    metric_gross_sales: '総注文金額',
    metric_collected_revenue: '回収済み売上',
    metric_recorded_expenses: '営業経費合計',
    metric_net_profit: '推定純利益',
    metric_outstanding_cod: '代金引換配送中残高',
    metric_stock_alerts: '在庫低下アラート',
    metric_total_orders: '処理済み総注文件数',

    status_pending: '保留中',
    status_confirmed: '確認済み',
    status_processing: '梱包準備中',
    status_ready_to_ship: '出荷可能',
    status_shipped: '出荷済み',
    status_delivered: '配達完了',
    status_cancelled: 'キャンセル',
    status_returned: '返品',

    pay_paid: '支払済み',
    pay_unpaid: '未払い',
    pay_partially_paid: '一部支払い',
    pay_refunded: '返金済み',

    inv_title: '商業インボイス / 納品書',
    inv_billed_to: '請求先・納品先',
    inv_date: '発行日',
    inv_no: '伝票番号',
    inv_subtotal: '小計',
    inv_discount: '割引',
    inv_shipping_fee: '配送料',
    inv_tax_vat: '消費税',
    inv_total_due: '合計請求金額',
    inv_payment_method: '決済方法',
    inv_terms: '返品規定および特記事項',

    lbl_country: '国・地域',
    lbl_currency: '通貨',
    lbl_timezone: 'タイムゾーン',
    lbl_language: '言語',
    lbl_address: '住所・番地',
    lbl_city: '市区町村',
    lbl_postal_code: '郵便番号',
    lbl_state_region: '都道府県',
    lbl_tax_number: '適格請求書発行事業者番号'
  },

  ko: {
    nav_dashboard: '메인 대시보드',
    nav_orders: '주문 및 배송 관리',
    nav_inventory: '재고 및 상품 카탈로그',
    nav_customers: '고객 관계 관리 (CRM)',
    nav_shipping: '택배 및 물류',
    nav_analytics: '매출 및 손익분석 (P&L)',
    nav_expenses: '비용 지출 내역',
    nav_integrations: '쇼핑몰 채널 연동',
    nav_settings: '스토어 환경설정',
    nav_handover: '인수·자산 핸드오버',

    btn_create_order: '주문 생성',
    btn_add_product: '상품 등록',
    btn_record_expense: '지출 기록',
    btn_export_csv: 'CSV 다운로드',
    btn_print_report: '보고서 인쇄',
    btn_save: '저장',
    btn_cancel: '취소',
    btn_edit: '수정',
    btn_delete: '삭제',
    btn_search: '검색...',
    btn_filter: '필터',
    btn_details: '상세보기',
    btn_invoice: '세금계산서/인보이스',
    btn_dispatch: '배송 접수',
    btn_switch_workspace: '스토어 변경',

    metric_gross_sales: '총 주문금액',
    metric_collected_revenue: '정산 수금 매출',
    metric_recorded_expenses: '운영 지출액',
    metric_net_profit: '추정 순이익',
    metric_outstanding_cod: '배송중 착불 잔액',
    metric_stock_alerts: '재고 부족 경고',
    metric_total_orders: '총 처리 주문',

    status_pending: '대기중',
    status_confirmed: '주문확인',
    status_processing: '상품준비중',
    status_ready_to_ship: '배송준비완료',
    status_shipped: '배송출고',
    status_delivered: '배송완료',
    status_cancelled: '주문취소',
    status_returned: '반품완료',

    pay_paid: '결제완료',
    pay_unpaid: '미결제',
    pay_partially_paid: '부분결제',
    pay_refunded: '환불완료',

    inv_title: '세금 인보이스 / 거래명세서',
    inv_billed_to: '수령인 및 배송지',
    inv_date: '발행일자',
    inv_no: '주문/송장번호',
    inv_subtotal: '공급가액',
    inv_discount: '할인금액',
    inv_shipping_fee: '배송비',
    inv_tax_vat: '부가가치세 (VAT)',
    inv_total_due: '최종 청구금액',
    inv_payment_method: '결제수단',
    inv_terms: '교환 및 반품 규정',

    lbl_country: '국가',
    lbl_currency: '통화',
    lbl_timezone: '표준시',
    lbl_language: '언어',
    lbl_address: '도로명 주소',
    lbl_city: '시/군/구',
    lbl_postal_code: '우편번호',
    lbl_state_region: '시/도',
    lbl_tax_number: '사업자등록번호'
  },

  zh: {
    nav_dashboard: '控制台大盘',
    nav_orders: '订单与发货履约',
    nav_inventory: '商品库存与目录',
    nav_customers: '客户关系 (CRM)',
    nav_shipping: '物流与快递运力',
    nav_analytics: '损益与财务报表 (P&L)',
    nav_expenses: '经营支出记账',
    nav_integrations: '多渠道电商集成',
    nav_settings: '全局业务设置',
    nav_handover: '商业转让与交付',

    btn_create_order: '创建新订单',
    btn_add_product: '添加商品',
    btn_record_expense: '记一笔支出',
    btn_export_csv: '导出 CSV',
    btn_print_report: '打印财务单据',
    btn_save: '保存更改',
    btn_cancel: '取消',
    btn_edit: '编辑',
    btn_delete: '删除',
    btn_search: '搜索...',
    btn_filter: '筛选',
    btn_details: '详情',
    btn_invoice: '商业发票',
    btn_dispatch: '派发快递包裹',
    btn_switch_workspace: '切换店铺空间',

    metric_gross_sales: '总订单流水',
    metric_collected_revenue: '已结算实收收入',
    metric_recorded_expenses: '经营支出总计',
    metric_net_profit: '预估净利润',
    metric_outstanding_cod: '在途货到付款款项',
    metric_stock_alerts: '低库存预警',
    metric_total_orders: '已处理订单总数',

    status_pending: '待处理',
    status_confirmed: '已确认',
    status_processing: '拣货配货中',
    status_ready_to_ship: '待揽收',
    status_shipped: '已发货',
    status_delivered: '已送达',
    status_cancelled: '已取消',
    status_returned: '已退货',

    pay_paid: '已支付',
    pay_unpaid: '未付款',
    pay_partially_paid: '部分支付',
    pay_refunded: '已退款',

    inv_title: '商业发票 / 出货清单',
    inv_billed_to: '收件人与送货地址',
    inv_date: '开票日期',
    inv_no: '发票编号',
    inv_subtotal: '商品小计',
    inv_discount: '优惠折扣',
    inv_shipping_fee: '运费',
    inv_tax_vat: '增值税 / 消费税',
    inv_total_due: '应付总金额',
    inv_payment_method: '付款方式',
    inv_terms: '退换货条例及保障声明',

    lbl_country: '国家/地区',
    lbl_currency: '结算币种',
    lbl_timezone: '时区',
    lbl_language: '系统语言',
    lbl_address: '详细街道地址',
    lbl_city: '城市',
    lbl_postal_code: '邮政编码',
    lbl_state_region: '省份 / 地区',
    lbl_tax_number: '纳税人识别号 / 税号'
  },

  hi: {
    nav_dashboard: 'मुख्य डैशबोर्ड',
    nav_orders: 'ऑर्डर और डिलीवरी प्रबंधन',
    nav_inventory: 'इन्वेंट्री और कैटलॉग',
    nav_customers: 'ग्राहक संबंध (CRM)',
    nav_shipping: 'कूरियर और लॉजिस्टिक्स',
    nav_analytics: 'बिक्री और लाभ (P&L)',
    nav_expenses: 'खर्च का खाता',
    nav_integrations: 'ई-कॉमर्स चैनल एकीकरण',
    nav_settings: 'स्टोर और वैश्विक सेटिंग्स',
    nav_handover: 'व्यावसायिक हस्तांतरण',

    btn_create_order: 'नया ऑर्डर बनाएं',
    btn_add_product: 'उत्पाद जोड़ें',
    btn_record_expense: 'खर्च दर्ज करें',
    btn_export_csv: 'CSV डाउनलोड करें',
    btn_print_report: 'रिपोर्ट प्रिंट करें',
    btn_save: 'सुरक्षित करें',
    btn_cancel: 'रद्द करें',
    btn_edit: 'संपादित करें',
    btn_delete: 'हटाएं',
    btn_search: 'खोजें...',
    btn_filter: 'फ़िल्टर',
    btn_details: 'विवरण',
    btn_invoice: 'इनवॉइस',
    btn_dispatch: 'पार्सल भेजें',
    btn_switch_workspace: 'स्टोर बदलें',

    metric_gross_sales: 'कुल सकल बिक्री',
    metric_collected_revenue: 'प्राप्त वास्तविक राजस्व',
    metric_recorded_expenses: 'दर्ज परिचालन खर्च',
    metric_net_profit: 'अनुमानित शुद्ध लाभ',
    metric_outstanding_cod: 'रास्ते में लंबित COD राशि',
    metric_stock_alerts: 'कम स्टॉक चेतावनी',
    metric_total_orders: 'कुल संसाधित ऑर्डर',

    status_pending: 'लंबित',
    status_confirmed: 'पुष्ट',
    status_processing: 'प्रक्रिया में',
    status_ready_to_ship: 'भेजने के लिए तैयार',
    status_shipped: 'भेज दिया गया',
    status_delivered: 'वितरित',
    status_cancelled: 'रद्द',
    status_returned: 'वापस किया गया',

    pay_paid: 'भुगतान किया गया',
    pay_unpaid: 'अदत्त',
    pay_partially_paid: 'आंशिक',
    pay_refunded: 'वापस किया गया',

    inv_title: 'टैक्स इनवॉइस',
    inv_billed_to: 'बिल और शिपिंग पता',
    inv_date: 'इनवॉइस तिथि',
    inv_no: 'इनवॉइस संख्या',
    inv_subtotal: 'उप-योग',
    inv_discount: 'छूट',
    inv_shipping_fee: 'वितरण शुल्क',
    inv_tax_vat: 'जीएसटी / टैक्स',
    inv_total_due: 'कुल देय राशि',
    inv_payment_method: 'भुगतान विधि',
    inv_terms: 'शर्तें और वापसी नीति',

    lbl_country: 'देश',
    lbl_currency: 'मुद्रा',
    lbl_timezone: 'समय क्षेत्र',
    lbl_language: 'भाषा',
    lbl_address: 'पता',
    lbl_city: 'शहर',
    lbl_postal_code: 'पिन कोड',
    lbl_state_region: 'राज्य / प्रांत',
    lbl_tax_number: 'GSTIN / टैक्स नंबर'
  },

  bn: {
    nav_dashboard: 'প্রধান ড্যাশবোর্ড',
    nav_orders: 'অর্ডার ও ডেলিভারি ব্যবস্থাপনা',
    nav_inventory: 'ইনভেন্টরি ও প্রোডাক্ট ক্যাটালগ',
    nav_customers: 'কাস্টমার সিআরএম (CRM)',
    nav_shipping: 'কুরিয়ার ও লজিস্টিকস',
    nav_analytics: 'আয়-ব্যয় ও প্রফিট রিপোর্ট (P&L)',
    nav_expenses: 'অপারেটিং খরচের খাতা',
    nav_integrations: 'অনলাইন শপ ইন্টিগ্রেশন',
    nav_settings: 'স্টোর ও রিব্র্যান্ডিং সেটিংস',
    nav_handover: 'বাণিজ্যিক হ্যান্ডওভার',

    btn_create_order: 'নতুন অর্ডার তৈরি করুন',
    btn_add_product: 'পণ্য যোগ করুন',
    btn_record_expense: 'খরচ এন্ট্রি করুন',
    btn_export_csv: 'CSV এক্সপোর্ট',
    btn_print_report: 'স্টেটমেন্ট প্রিন্ট',
    btn_save: 'সংরক্ষণ করুন',
    btn_cancel: 'বাতিল',
    btn_edit: 'সম্পাদনা',
    btn_delete: 'মুছে ফেলুন',
    btn_search: 'অনুসন্ধান করুন...',
    btn_filter: 'ফিল্টার',
    btn_details: 'বিস্তারিত',
    btn_invoice: 'চালান / ইনভয়েস',
    btn_dispatch: 'কুরিয়ারে পাঠান',
    btn_switch_workspace: 'ওয়ার্কস্পেস পরিবর্তন',

    metric_gross_sales: 'মোট বুকড বিক্রয়মূল্য',
    metric_collected_revenue: 'সংগৃহীত প্রকৃত নগদ টাকা',
    metric_recorded_expenses: 'মোট পরিচালন ব্যয়',
    metric_net_profit: 'প্রকৃত নিট মুনাফা',
    metric_outstanding_cod: 'কুরিয়ারে জমা থাকা COD টাকা',
    metric_stock_alerts: 'স্বল্প স্টক সতর্কতা',
    metric_total_orders: 'মোট প্রসেস করা অর্ডার',

    status_pending: 'অপেক্ষমাণ (Pending)',
    status_confirmed: 'নিশ্চিত (Confirmed)',
    status_processing: 'প্রস্তুত হচ্ছে (Processing)',
    status_ready_to_ship: 'ডেলিভারির জন্য প্রস্তুত',
    status_shipped: 'কুরিয়ারে পাঠানো হয়েছে',
    status_delivered: 'সফলভাবে ডেলিভার্ড',
    status_cancelled: 'বাতিল (Cancelled)',
    status_returned: 'ফেরত এসেছে (Returned)',

    pay_paid: 'পরিশোধিত',
    pay_unpaid: 'অপরিশোধিত',
    pay_partially_paid: 'আংশিক',
    pay_refunded: 'রিফান্ড করা হয়েছে',

    inv_title: 'ট্যাক্স চালান ও বিলপত্র',
    inv_billed_to: 'বিল ও ডেলিভারি প্রাপক',
    inv_date: 'চালানের তারিখ',
    inv_no: 'ইনভয়েস নম্বর',
    inv_subtotal: 'সাব-টোটাল',
    inv_discount: 'মূল্যছাড় / ডিসকাউন্ট',
    inv_shipping_fee: 'ডেলিভারি চার্জ',
    inv_tax_vat: 'ভ্যাট / ট্যাক্স',
    inv_total_due: 'সর্বমোট প্রদেয় টাকা',
    inv_payment_method: 'পেমেন্ট মাধ্যম',
    inv_terms: 'ফেরত ও ওয়ারেন্টি শর্তাবলী',

    lbl_country: 'দেশ',
    lbl_currency: 'মুদ্রা (Currency)',
    lbl_timezone: 'টাইমজোন',
    lbl_language: 'ভাষা',
    lbl_address: 'পূর্ণ ঠিকানা',
    lbl_city: 'শহর / জেলা',
    lbl_postal_code: 'পোস্টাল কোড',
    lbl_state_region: 'বিভাগ / রাজ্য',
    lbl_tax_number: 'ট্যাক্স / BIN নম্বর'
  }
};

// Singleton language state
const STORAGE_LANG_KEY = 'orderflow_active_language';

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
  } catch (e) {}

  return detectBrowserLocale();
})();

const langListeners = new Set<(lang: SupportedLanguage) => void>();

export function setApplicationLanguage(lang: SupportedLanguage) {
  if (!TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch (e) {}

  // Update HTML document direction for Arabic RTL support
  const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = meta?.direction || 'ltr';
  }

  langListeners.forEach(fn => fn(lang));
}

export function getApplicationLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function translate(key: string, fallback?: string): string {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || fallback || key;
}

export function useI18n() {
  const [lang, setLang] = useState<SupportedLanguage>(currentLanguage);

  useEffect(() => {
    // Initial sync
    const meta = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
    if (document) {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = meta?.direction || 'ltr';
    }

    const listener = (newLang: SupportedLanguage) => setLang(newLang);
    langListeners.add(listener);
    return () => {
      langListeners.delete(listener);
    };
  }, []);

  const t = (key: string, fallback?: string) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || fallback || key;
  };

  const currentMeta = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return {
    language: lang,
    currentLanguage: lang,
    setLanguage: setApplicationLanguage,
    t,
    isRtl: currentMeta.direction === 'rtl',
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentMeta
  };
}
