const { z } = require("zod");

const createPaymentSchema = {
  params: z.object({
    invoiceId: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    amount: z.number().positive("Payment amount must be greater than zero"),
    payment_method: z.enum(["cash", "bank_transfer", "upi", "card", "cheque", "gateway", "other"]),
    reference_number: z.string().max(100).optional().nullable(),
    transaction_id: z.string().max(150).optional().nullable(), // For gateway idempotency
    gateway: z.string().max(50).optional().nullable(),
    gateway_transaction_id: z.string().max(150).optional().nullable(),
    gateway_response: z.record(z.any()).optional().nullable(),
    paid_at: z.string().optional().nullable(),
    notes: z.string().max(255).optional().nullable(),
  }),
};

const refundPaymentSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    reason: z.string().min(2, "Refund reason is required").max(255),
  }),
};

const getPaymentByIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

module.exports = {
  createPaymentSchema,
  refundPaymentSchema,
  getPaymentByIdSchema,
};
