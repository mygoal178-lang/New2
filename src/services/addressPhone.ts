/**
 * ORDERFLOW - Global Countries, Calling Codes & Flexible Address System
 * Supports E.164 phone numbering and country-specific address conventions.
 */

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string;
  phoneCode: string;
  defaultCurrency: string;
  defaultTimezone: string;
  defaultMeasurement: 'metric' | 'imperial';
  defaultTaxName: string;
  defaultTaxRate: number;
}

export const GLOBAL_COUNTRIES: CountryInfo[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1', defaultCurrency: 'USD', defaultTimezone: 'America/New_York', defaultMeasurement: 'imperial', defaultTaxName: 'Sales Tax', defaultTaxRate: 8.875 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44', defaultCurrency: 'GBP', defaultTimezone: 'Europe/London', defaultMeasurement: 'metric', defaultTaxName: 'VAT', defaultTaxRate: 20 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1', defaultCurrency: 'CAD', defaultTimezone: 'America/Toronto', defaultMeasurement: 'metric', defaultTaxName: 'HST/GST', defaultTaxRate: 13 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Berlin', defaultMeasurement: 'metric', defaultTaxName: 'MwSt.', defaultTaxRate: 19 },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Paris', defaultMeasurement: 'metric', defaultTaxName: 'TVA', defaultTaxRate: 20 },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61', defaultCurrency: 'AUD', defaultTimezone: 'Australia/Sydney', defaultMeasurement: 'metric', defaultTaxName: 'GST', defaultTaxRate: 10 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81', defaultCurrency: 'JPY', defaultTimezone: 'Asia/Tokyo', defaultMeasurement: 'metric', defaultTaxName: '消費税', defaultTaxRate: 10 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phoneCode: '+82', defaultCurrency: 'KRW', defaultTimezone: 'Asia/Seoul', defaultMeasurement: 'metric', defaultTaxName: '부가세', defaultTaxRate: 10 },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65', defaultCurrency: 'SGD', defaultTimezone: 'Asia/Singapore', defaultMeasurement: 'metric', defaultTaxName: 'GST', defaultTaxRate: 9 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', phoneCode: '+971', defaultCurrency: 'AED', defaultTimezone: 'Asia/Dubai', defaultMeasurement: 'metric', defaultTaxName: 'VAT', defaultTaxRate: 5 },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', phoneCode: '+966', defaultCurrency: 'SAR', defaultTimezone: 'Asia/Riyadh', defaultMeasurement: 'metric', defaultTaxName: 'VAT', defaultTaxRate: 15 },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91', defaultCurrency: 'INR', defaultTimezone: 'Asia/Kolkata', defaultMeasurement: 'metric', defaultTaxName: 'GST', defaultTaxRate: 18 },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', phoneCode: '+880', defaultCurrency: 'BDT', defaultTimezone: 'Asia/Dhaka', defaultMeasurement: 'metric', defaultTaxName: 'VAT', defaultTaxRate: 5 },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', phoneCode: '+34', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Madrid', defaultMeasurement: 'metric', defaultTaxName: 'IVA', defaultTaxRate: 21 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', phoneCode: '+39', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Rome', defaultMeasurement: 'metric', defaultTaxName: 'IVA', defaultTaxRate: 22 },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', phoneCode: '+31', defaultCurrency: 'EUR', defaultTimezone: 'Europe/Amsterdam', defaultMeasurement: 'metric', defaultTaxName: 'BTW', defaultTaxRate: 21 },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', phoneCode: '+55', defaultCurrency: 'BRL', defaultTimezone: 'America/Sao_Paulo', defaultMeasurement: 'metric', defaultTaxName: 'ICMS', defaultTaxRate: 18 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', phoneCode: '+52', defaultCurrency: 'MXN', defaultTimezone: 'America/Mexico_City', defaultMeasurement: 'metric', defaultTaxName: 'IVA', defaultTaxRate: 16 }
];

export function getCountryByCode(code: string): CountryInfo | undefined {
  return GLOBAL_COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
}

export function findCountry(codeOrName: string): CountryInfo {
  const match = GLOBAL_COUNTRIES.find(
    c => c.code.toLowerCase() === codeOrName.toLowerCase() ||
         c.name.toLowerCase() === codeOrName.toLowerCase()
  );
  return match || GLOBAL_COUNTRIES[0];
}

/**
 * Format flexible international address for invoices and shipment manifests
 */
export function formatFullAddress(address: {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province_region?: string;
  postal_zip_code?: string;
  country?: string;
}): string {
  const parts: string[] = [];
  if (address.address_line1) parts.push(address.address_line1);
  if (address.address_line2) parts.push(address.address_line2);

  const cityStateZip = [
    address.city,
    address.state_province_region,
    address.postal_zip_code
  ].filter(Boolean).join(', ');

  if (cityStateZip) parts.push(cityStateZip);
  if (address.country) parts.push(address.country);

  return parts.join('\n');
}

export function formatAddressSingleLine(address: {
  line1?: string;
  line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
}): string {
  return [
    address.line1,
    address.line2,
    address.city,
    address.state_province,
    address.postal_code,
    address.country
  ].filter(Boolean).join(', ');
}

/**
 * Format international phone number with country calling code
 */
export function formatPhoneNumber(callingCode: string, localNumber: string): string {
  const cleanCode = callingCode.startsWith('+') ? callingCode : `+${callingCode}`;
  const cleanNum = localNumber.replace(/[^\d]/g, '');
  return `${cleanCode} ${cleanNum}`;
}
