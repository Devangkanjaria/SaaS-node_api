const { z } = require("zod");

const createUserSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").max(150),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional().nullable(),
    roleId: z.number().int().positive().optional(),
    status: z.enum(["active", "inactive", "blocked"]).optional().default("active"),
  }),
};

const updateUserSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, "User ID must be a numeric integer"),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().max(150).optional(),
    phone: z.string().optional().nullable(),
    password: z.string().min(6).optional(),
    roleId: z.number().int().positive().optional(),
  }),
};

const updateUserStatusSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.enum(["active", "inactive", "blocked"]),
  }),
};

const getUserByIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  getUserByIdSchema,
};
