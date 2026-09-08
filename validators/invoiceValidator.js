const { z } = require("zod");

const invoiceItemSchema = z.object({
  product_id: z.number().int().positive().optional().nullable(),
  description: z.string().min(1, "Item description is required").max(255),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit_price: z.number().min(0, "Unit price cannot be negative"),
  discount_amount: z.number().min(0).optional().default(0),
  tax_rate: z.number().min(0).max(100).optional().default(0),
});

const createInvoiceSchema = {
  body: z.object({
    client_id: z.number().int().positive("Client ID is required"),
    invoice_number: z.string().max(50).optional(),
    issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be YYYY-MM-DD"),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD").optional().nullable(),
    currency: z.string().length(3).optional().default("INR"),
    notes: z.string().optional().nullable(),
    terms: z.string().optional().nullable(),
    items: z.array(invoiceItemSchema).min(1, "Invoice must contain at least one item"),
    discount: z
      .object({
        type: z.enum(["percentage", "fixed"]),
        value: z.number().min(0),
      })
      .optional()
      .nullable(),
    tax: z
      .object({
        rate: z.number().min(0).max(100),
      })
      .optional()
      .nullable(),
  }),
};

const updateInvoiceSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    client_id: z.number().int().positive().optional(),
    issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    currency: z.string().length(3).optional(),
    notes: z.string().optional().nullable(),
    terms: z.string().optional().nullable(),
    items: z.array(invoiceItemSchema).min(1).optional(),
    discount: z
      .object({
        type: z.enum(["percentage", "fixed"]),
        value: z.number().min(0),
      })
      .optional()
      .nullable(),
    tax: z
      .object({
        rate: z.number().min(0).max(100),
      })
      .optional()
      .nullable(),
  }),
};

const updateInvoiceStatusSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(["draft", "sent", "partial", "paid", "overdue", "cancelled"]),
    reason: z.string().max(255).optional().nullable(),
  }),
};

const getInvoiceByIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  getInvoiceByIdSchema,
};