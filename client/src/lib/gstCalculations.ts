/**
 * GST calculation utilities for Maharashtra, India
 * Handles SGST + CGST calculations as per Indian GST rules
 */

export interface GSTCalculation {
  baseAmount: number;
  sgstRate: number;
  cgstRate: number;
  sgstAmount: number;
  cgstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  isIntraState: boolean;
}

export interface GSTBreakdown {
  subtotal: number;
  totalSGST: number;
  totalCGST: number;
  totalIGST: number;
  totalTax: number;
  grandTotal: number;
  items: Array<{
    description: string;
    amount: number;
    gstRate: number;
    sgst: number;
    cgst: number;
    igst: number;
  }>;
}

/**
 * Calculate GST for a single item
 * For Maharashtra (intra-state), GST is split equally between SGST and CGST
 * For inter-state, IGST is used
 */
export function calculateGST(
  baseAmount: number,
  gstRate: number,
  isIntraState: boolean = true
): GSTCalculation {
  if (gstRate < 0 || gstRate > 100) {
    throw new Error('GST rate must be between 0 and 100');
  }

  if (baseAmount < 0) {
    throw new Error('Base amount cannot be negative');
  }

  let sgstRate = 0;
  let cgstRate = 0;
  let sgstAmount = 0;
  let cgstAmount = 0;

  if (isIntraState) {
    // For intra-state transactions in Maharashtra: SGST + CGST
    sgstRate = gstRate / 2;
    cgstRate = gstRate / 2;
    sgstAmount = (baseAmount * sgstRate) / 100;
    cgstAmount = (baseAmount * cgstRate) / 100;
  }

  const totalTaxAmount = sgstAmount + cgstAmount;
  const totalAmount = baseAmount + totalTaxAmount;

  return {
    baseAmount,
    sgstRate,
    cgstRate,
    sgstAmount: Number(sgstAmount.toFixed(2)),
    cgstAmount: Number(cgstAmount.toFixed(2)),
    totalTaxAmount: Number(totalTaxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    isIntraState,
  };
}

/**
 * Calculate reverse GST (extract GST from inclusive amount)
 */
export function calculateReverseGST(
  inclusiveAmount: number,
  gstRate: number,
  isIntraState: boolean = true
): GSTCalculation {
  if (gstRate < 0 || gstRate > 100) {
    throw new Error('GST rate must be between 0 and 100');
  }

  if (inclusiveAmount < 0) {
    throw new Error('Inclusive amount cannot be negative');
  }

  const baseAmount = inclusiveAmount / (1 + gstRate / 100);
  return calculateGST(baseAmount, gstRate, isIntraState);
}

/**
 * Calculate GST breakdown for multiple items
 */
export function calculateGSTBreakdown(
  items: Array<{
    description: string;
    amount: number;
    gstRate: number;
    quantity?: number;
  }>,
  isIntraState: boolean = true
): GSTBreakdown {
  let subtotal = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let totalIGST = 0;

  const processedItems = items.map(item => {
    const itemAmount = item.amount * (item.quantity || 1);
    const gstCalc = calculateGST(itemAmount, item.gstRate, isIntraState);
    
    subtotal += gstCalc.baseAmount;
    
    if (isIntraState) {
      totalSGST += gstCalc.sgstAmount;
      totalCGST += gstCalc.cgstAmount;
    } else {
      totalIGST += gstCalc.totalTaxAmount;
    }

    return {
      description: item.description,
      amount: gstCalc.baseAmount,
      gstRate: item.gstRate,
      sgst: gstCalc.sgstAmount,
      cgst: gstCalc.cgstAmount,
      igst: isIntraState ? 0 : gstCalc.totalTaxAmount,
    };
  });

  const totalTax = totalSGST + totalCGST + totalIGST;
  const grandTotal = subtotal + totalTax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalSGST: Number(totalSGST.toFixed(2)),
    totalCGST: Number(totalCGST.toFixed(2)),
    totalIGST: Number(totalIGST.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    items: processedItems,
  };
}

/**
 * Round amount as per Indian currency rules
 * Rounds to nearest 0.05 for cash transactions
 */
export function roundToIndianCurrency(amount: number, isCashTransaction: boolean = false): number {
  if (isCashTransaction) {
    // Round to nearest 0.05 for cash transactions
    return Math.round(amount * 20) / 20;
  }
  
  // Round to nearest paisa (0.01) for digital transactions
  return Math.round(amount * 100) / 100;
}

/**
 * Format currency for Indian locale
 */
export function formatIndianCurrency(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
}

/**
 * Validate GST number format (basic validation)
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  
  // Basic GSTIN format: 22AAAAA0000A1Z5 (15 characters)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
}

/**
 * Get GST rate by HSN code (common rates)
 */
export function getGSTRateByHSN(hsnCode: string): number {
  // Common HSN codes and their typical GST rates
  const hsnRates: Record<string, number> = {
    // Medicines and medical equipment
    '3004': 12, // Medicaments
    '9018': 12, // Medical instruments
    
    // Food items
    '1006': 5,  // Rice
    '1001': 0,  // Wheat
    '1701': 0,  // Sugar
    
    // Agricultural products
    '1201': 0,  // Soya beans
    '1202': 0,  // Ground nuts
    '0713': 0,  // Dried leguminous vegetables
    
    // Restaurant items
    '2101': 18, // Coffee preparations
    '2102': 18, // Yeasts
    '2103': 18, // Sauce preparations
    
    // Common retail items
    '8517': 18, // Mobile phones
    '6204': 12, // Women's clothing
    '6203': 12, // Men's clothing
  };

  // Extract first 4 digits for HSN lookup
  const hsnPrefix = hsnCode.substring(0, 4);
  return hsnRates[hsnPrefix] || 18; // Default to 18% if not found
}

/**
 * Calculate discount with GST considerations
 */
export function calculateDiscountWithGST(
  originalAmount: number,
  discountPercentage: number,
  gstRate: number,
  isDiscountOnBaseAmount: boolean = true,
  isIntraState: boolean = true
): {
  originalGST: GSTCalculation;
  discountAmount: number;
  discountedGST: GSTCalculation;
  totalSavings: number;
} {
  const originalGST = calculateGST(originalAmount, gstRate, isIntraState);
  
  let discountAmount: number;
  let discountedBaseAmount: number;

  if (isDiscountOnBaseAmount) {
    // Discount on base amount (before GST)
    discountAmount = (originalAmount * discountPercentage) / 100;
    discountedBaseAmount = originalAmount - discountAmount;
  } else {
    // Discount on total amount (including GST)
    const totalDiscountAmount = (originalGST.totalAmount * discountPercentage) / 100;
    discountedBaseAmount = (originalGST.totalAmount - totalDiscountAmount) / (1 + gstRate / 100);
    discountAmount = originalAmount - discountedBaseAmount;
  }

  const discountedGST = calculateGST(discountedBaseAmount, gstRate, isIntraState);
  const totalSavings = originalGST.totalAmount - discountedGST.totalAmount;

  return {
    originalGST,
    discountAmount: Number(discountAmount.toFixed(2)),
    discountedGST,
    totalSavings: Number(totalSavings.toFixed(2)),
  };
}

/**
 * Generate GST invoice summary
 */
export function generateGSTInvoiceSummary(
  items: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    discount?: number;
  }>,
  customerGSTIN?: string,
  isIntraState: boolean = true
): {
  items: Array<any>;
  summary: GSTBreakdown;
  isB2B: boolean;
  requiresEInvoice: boolean;
} {
  const processedItems = items.map(item => {
    const baseAmount = item.quantity * item.unitPrice;
    const discountAmount = item.discount || 0;
    const netAmount = baseAmount - discountAmount;
    const gstCalc = calculateGST(netAmount, item.gstRate, isIntraState);

    return {
      ...item,
      baseAmount: Number(baseAmount.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      netAmount: Number(netAmount.toFixed(2)),
      sgstAmount: gstCalc.sgstAmount,
      cgstAmount: gstCalc.cgstAmount,
      totalAmount: gstCalc.totalAmount,
    };
  });

  const summary = calculateGSTBreakdown(
    processedItems.map(item => ({
      description: item.description,
      amount: item.netAmount,
      gstRate: item.gstRate,
    })),
    isIntraState
  );

  const isB2B = !!customerGSTIN && validateGSTIN(customerGSTIN);
  const requiresEInvoice = isB2B && summary.grandTotal >= 50000; // E-invoice mandatory for B2B transactions ≥ ₹50,000

  return {
    items: processedItems,
    summary,
    isB2B,
    requiresEInvoice,
  };
}
