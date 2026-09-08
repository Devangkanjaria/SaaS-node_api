const { BadRequestError, UnprocessableEntityError } = require("../errors/errorTypes");

/**
 * Monetary & calculation utility functions
 */
const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

class InvoiceCalculationService {
  /**
   * Recalculates invoice financials server-side.
   *
   * @param {Array} items - Array of items { product_id, description, quantity, unit_price, discount_amount, tax_rate }
   * @param {Object} globalDiscount - Optional { type: 'percentage'|'fixed', value: number }
   * @param {Object} globalTax - Optional { rate: number }
   * @returns {Object} Calculated totals and formatted line items
   */
  calculateInvoice({ items = [], discount = null, tax = null }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("Invoice must contain at least one item");
    }

    let calculatedSubtotal = 0;
    let itemsTaxTotal = 0;
    let itemsDiscountTotal = 0;

    const processedItems = items.map((item, index) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const itemDiscount = Number(item.discount_amount || 0);
      const itemTaxRate = Number(item.tax_rate || 0);

      if (isNaN(quantity) || quantity <= 0) {
        throw new UnprocessableEntityError(`Item at position ${index + 1} has invalid quantity (${item.quantity})`);
      }
      if (isNaN(unitPrice) || unitPrice < 0) {
        throw new UnprocessableEntityError(`Item at position ${index + 1} has invalid unit price (${item.unit_price})`);
      }
      if (itemDiscount < 0) {
        throw new UnprocessableEntityError(`Item at position ${index + 1} has negative discount`);
      }

      // Line item calculation:
      const rawLineTotal = round2(quantity * unitPrice);
      const lineSubtotalAfterDiscount = Math.max(0, round2(rawLineTotal - itemDiscount));
      const lineTaxAmount = round2((lineSubtotalAfterDiscount * itemTaxRate) / 100);
      const lineTotalAmount = round2(lineSubtotalAfterDiscount + lineTaxAmount);

      calculatedSubtotal = round2(calculatedSubtotal + rawLineTotal);
      itemsDiscountTotal = round2(itemsDiscountTotal + itemDiscount);
      itemsTaxTotal = round2(itemsTaxTotal + lineTaxAmount);

      return {
        product_id: item.product_id || null,
        description: item.description || "Item",
        quantity: round2(quantity),
        unit_price: round2(unitPrice),
        discount_amount: round2(itemDiscount),
        tax_rate: round2(itemTaxRate),
        tax_amount: round2(lineTaxAmount),
        total_amount: round2(lineTotalAmount),
      };
    });

    // Handle overall/global discount if provided
    let globalDiscountAmount = 0;
    if (discount && discount.value > 0) {
      if (discount.type === "percentage") {
        globalDiscountAmount = round2((calculatedSubtotal * discount.value) / 100);
      } else {
        globalDiscountAmount = round2(discount.value);
      }
    }
    const totalDiscountAmount = round2(itemsDiscountTotal + globalDiscountAmount);

    // Handle overall/global tax if provided
    let globalTaxAmount = 0;
    const taxableBase = Math.max(0, round2(calculatedSubtotal - totalDiscountAmount));
    if (tax && tax.rate > 0) {
      globalTaxAmount = round2((taxableBase * tax.rate) / 100);
    }
    const totalTaxAmount = round2(itemsTaxTotal + globalTaxAmount);

    // Final total calculation
    const totalAmount = Math.max(0, round2(taxableBase + totalTaxAmount));

    return {
      subtotal: calculatedSubtotal,
      discount_amount: totalDiscountAmount,
      tax_amount: totalTaxAmount,
      total_amount: totalAmount,
      items: processedItems,
    };
  }
}

module.exports = new InvoiceCalculationService();
