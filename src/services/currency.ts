/**
 * ORDERFLOW - Global ISO 4217 Currency System
 * Supports proper decimal precision, locale-aware formatting, and exchange-rate conversions.
 */

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
  exchangeRateToUsd: number; // 1 USD = X Currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 0.79 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 1.36 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 1.53 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, symbolPosition: 'before', exchangeRateToUsd: 154.5 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 7.23 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, symbolPosition: 'before', exchangeRateToUsd: 1385.0 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 83.4 },
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 118.0 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 1.35 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 3.67 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 3.75 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 0.91 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, symbolPosition: 'after', exchangeRateToUsd: 10.65 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, symbolPosition: 'after', exchangeRateToUsd: 10.85 },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, symbolPosition: 'after', exchangeRateToUsd: 6.89 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 5.15 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', decimals: 2, symbolPosition: 'before', exchangeRateToUsd: 17.1 }
};

export const GLOBAL_CURRENCIES: CurrencyConfig[] = Object.values(SUPPORTED_CURRENCIES);

export const DEFAULT_CURRENCY_CODE = 'USD';

export function getCurrencyConfig(code: string): CurrencyConfig {
  return SUPPORTED_CURRENCIES[code.toUpperCase()] || {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    symbol: code.toUpperCase(),
    decimals: 2,
    symbolPosition: 'before',
    exchangeRateToUsd: 1.0
  };
}

/**
 * Format currency with international locale awareness and proper decimal precision
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  const config = getCurrencyConfig(currencyCode);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals
    }).format(amount);
  } catch (err) {
    // Fallback if locale or currency code is unsupported by browser Intl
    const formattedNum = amount.toLocaleString(locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals
    });
    return config.symbolPosition === 'before'
      ? `${config.symbol}${formattedNum}`
      : `${formattedNum} ${config.symbol}`;
  }
}

/**
 * Convert monetary value for consolidated multi-currency reporting.
 * Preserves the original transaction currency without mutation.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount;
  }

  const fromConfig = getCurrencyConfig(fromCurrency);
  const toConfig = getCurrencyConfig(toCurrency);

  // Convert via USD anchor
  const amountInUsd = amount / fromConfig.exchangeRateToUsd;
  const convertedAmount = amountInUsd * toConfig.exchangeRateToUsd;

  return Number(convertedAmount.toFixed(toConfig.decimals));
}
