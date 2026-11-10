/**
 * ORDERFLOW - Global Tax & VAT Calculation System
 * Handles VAT, GST, Sales Tax, tax-inclusive and tax-exclusive rules.
 */

import { TaxConfig, Product } from '../types';

export function calculateOrderTax(
  items: Array<{ unit_price: number; quantity: number; tax_exempt?: boolean }>,
  deliveryCharge: number,
  discount: number,
  taxConfig: TaxConfig
): {
  taxableSubtotal: number;
  taxAmount: number;
  finalTotal: number;
  taxLabel: string;
} {
  const taxLabel = taxConfig.name || 'Tax';

  if (!taxConfig.is_enabled || taxConfig.rate_percentage <= 0) {
    const rawSubtotal = items.reduce((sum, it) => sum + (it.unit_price * it.quantity), 0);
    const finalTotal = Math.max(0, rawSubtotal - discount + deliveryCharge);
    return {
      taxableSubtotal: rawSubtotal,
      taxAmount: 0,
      finalTotal,
      taxLabel
    };
  }

  // Calculate taxable items
  let taxableSubtotal = 0;
  let exemptSubtotal = 0;

  items.forEach(it => {
    const lineTotal = it.unit_price * it.quantity;
    if (it.tax_exempt) {
      exemptSubtotal += lineTotal;
    } else {
      taxableSubtotal += lineTotal;
    }
  });

  const rate = taxConfig.rate_percentage / 100;
  const netTaxable = Math.max(0, taxableSubtotal - discount);

  if (taxConfig.calculation_type === 'inclusive') {
    // Tax is already included in product prices: taxAmount = netTaxable - (netTaxable / (1 + rate))
    const taxAmount = Number((netTaxable - (netTaxable / (1 + rate))).toFixed(2));
    const finalTotal = netTaxable + exemptSubtotal + deliveryCharge;
    return {
      taxableSubtotal,
      taxAmount,
      finalTotal,
      taxLabel: `${taxLabel} (${taxConfig.rate_percentage}% Incl.)`
    };
  } else {
    // Exclusive: Tax is added on top of the subtotal
    const taxAmount = Number((netTaxable * rate).toFixed(2));
    const finalTotal = Number((netTaxable + exemptSubtotal + deliveryCharge + taxAmount).toFixed(2));
    return {
      taxableSubtotal,
      taxAmount,
      finalTotal,
      taxLabel: `${taxLabel} (${taxConfig.rate_percentage}%)`
    };
  }
}
