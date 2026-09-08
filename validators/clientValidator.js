const { z } = require("zod");

const createClientSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(150),
    email: z.string().email("Invalid email address").max(150).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    company_name: z.string().max(150).optional().nullable(),
    tax_number: z.string().max(50).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional().default("active"),
    notes: z.string().optional().nullable(),
  }),
};

const updateClientSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    email: z.string().email().max(150).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    company_name: z.string().max(150).optional().nullable(),
    tax_number: z.string().max(50).optional().nullable(),
    status: z.enum(["active", "inactive"]).optional(),
    notes: z.string().optional().nullable(),
  }),
};

const updateClientStatusSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(["active", "inactive"]),
  }),
};

const getClientByIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

const createAddressSchema = {
  params: z.object({
    clientId: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    address_type: z.enum(["billing", "shipping"]),
    address_line1: z.string().min(2).max(255),
    address_line2: z.string().max(255).optional().nullable(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    postal_code: z.string().min(2).max(20),
    country: z.string().max(100).optional().default("India"),
    is_default: z.boolean().optional().default(false),
  }),
};

const updateAddressSchema = {
  params: z.object({
    clientId: z.string().regex(/^\d+$/),
    addressId: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    address_type: z.enum(["billing", "shipping"]).optional(),
    address_line1: z.string().min(2).max(255).optional(),
    address_line2: z.string().max(255).optional().nullable(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    postal_code: z.string().min(2).max(20).optional(),
    country: z.string().max(100).optional(),
    is_default: z.boolean().optional(),
  }),
};

const addressIdParamSchema = {
  params: z.object({
    clientId: z.string().regex(/^\d+$/),
    addressId: z.string().regex(/^\d+$/),
  }),
};

module.exports = {
  createClientSchema,
  updateClientSchema,
  updateClientStatusSchema,
  getClientByIdSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
};
