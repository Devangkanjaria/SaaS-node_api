const { z } = require("zod");

// Tax schemas
const createTaxSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(2).max(50),
    rate: z.number().min(0).max(100),
    description: z.string().max(255).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional().default("active"),
  }),
};

const updateTaxSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(50).optional(),
    rate: z.number().min(0).max(100).optional(),
    description: z.string().max(255).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
};

const updateTaxStatusSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(["active", "inactive"]),
  }),
};

// Discount schemas
const createDiscountSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(0),
    status: z.enum(["active", "inactive"]).optional().default("active"),
  }),
};

const updateDiscountSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    type: z.enum(["percentage", "fixed"]).optional(),
    value: z.number().min(0).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
};

const updateDiscountStatusSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(["active", "inactive"]),
  }),
};

module.exports = {
  createTaxSchema,
  updateTaxSchema,
  updateTaxStatusSchema,
  createDiscountSchema,
  updateDiscountSchema,
  updateDiscountStatusSchema,
};
