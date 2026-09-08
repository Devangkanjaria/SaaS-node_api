const { z } = require("zod");

const createRoleSchema = {
  body: z.object({
    name: z.string().min(2, "Role name must be at least 2 characters").max(50),
    description: z.string().max(255).optional().nullable(),
  }),
};

const updateRoleSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(255).optional().nullable(),
  }),
};

const getRoleByIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
};

const assignPermissionSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    permissionId: z.number().int().positive(),
  }),
};

const removePermissionSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/),
    permissionId: z.string().regex(/^\d+$/),
  }),
};

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
  assignPermissionSchema,
  removePermissionSchema,
};
