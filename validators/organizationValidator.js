const { z } = require("zod");

const createOrganizationSchema = {
  body: z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters").max(150),
    slug: z.string().min(2).max(150).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens").optional(),
    email: z.string().email("Invalid organization email address").max(150),
    phone: z.string().max(20).optional().nullable(),
    currency: z.string().length(3).optional().default("INR"),
    timezone: z.string().max(50).optional().default("Asia/Kolkata"),
    logo_url: z.string().max(500).optional().nullable(),
  }),
};

const updateOrganizationSchema = {
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    email: z.string().email().max(150).optional(),
    phone: z.string().max(20).optional().nullable(),
    currency: z.string().length(3).optional(),
    timezone: z.string().max(50).optional(),
    logo_url: z.string().max(500).optional().nullable(),
  }),
};

const addMemberSchema = {
  body: z.object({
    userId: z.number().int().positive().optional(),
    email: z.string().email().optional(), // Can invite by email
    roleId: z.number().int().positive("Role ID is required"),
  }),
};

const updateMemberSchema = {
  params: z.object({
    userId: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    roleId: z.number().int().positive().optional(),
    status: z.enum(["active", "inactive", "invited"]).optional(),
  }),
};

const memberIdParamSchema = {
  params: z.object({
    userId: z.string().regex(/^\d+$/),
  }),
};

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberSchema,
  memberIdParamSchema,
};
