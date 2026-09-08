const { z } = require("zod");

const createProductSchema = {
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").max(150),
    category_id: z.number().int().positive().optional().nullable(),
    sku: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    unit: z.string().max(30).optional().default("unit"),
    unit_price: z.number().min(0, "Unit price cannot be negative").default(0),
    tax_rate: z.number().min(0).max(100).optional().default(0),
    status: z.enum(["active", "inactive"]).optional().default("active"),
    initial_stock: z.number().min(0).optional().default(0),
    reorder_level: z.number().min(0).optional().default(0),
  }),
};

const updateProductSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    category_id: z.number().int().positive().optional().nullable(),
    sku: z.string().max(100).optional().nullable(),
    description: z.string().optional().nullable(),
    unit: z.string().max(30).optional(),
    unit_price: z.number().min(0).optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
};

const updateProductStatusSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(["active", "inactive"]),
  }),
};

const getProductByIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

// Category schemas
const createCategorySchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional().default("active"),
  }),
};

const updateCategorySchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(255).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
};

// Inventory schemas
const updateInventorySchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    quantity: z.number().min(0, "Stock quantity cannot be negative"),
    reserved_quantity: z.number().min(0).optional().default(0),
    reorder_level: z.number().min(0).optional().default(0),
  }),
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  getProductByIdSchema,
  createCategorySchema,
  updateCategorySchema,
  updateInventorySchema,
};
