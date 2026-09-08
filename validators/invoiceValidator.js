const { z } = require("zod");

const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  description: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  total: z.number()
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  date: z.string(),
  customerName: z.string().min(1),
  customerMobile: z.string().regex(/^[0-9]{10}$/, "10-digit mobile required"),
  address: z.string().optional(),
  discountPercent: z.number().min(0),
  subTotal: z.number(),
  discountAmount: z.number(),
  finalAmount: z.number(),
  items: z.array(itemSchema).min(1)
});

module.exports = invoiceSchema;