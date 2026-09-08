const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createRoleSchema,
  updateRoleSchema,
  getRoleByIdSchema,
  assignPermissionSchema,
  removePermissionSchema,
} = require("../validators/roleValidator");

router.use(authenticateJWT);

router.get("/permissions", requirePermission(PERMISSIONS.ROLE_VIEW), roleController.listPermissions);

router.get("/", requirePermission(PERMISSIONS.ROLE_VIEW), roleController.listRoles);
router.get("/:id", requirePermission(PERMISSIONS.ROLE_VIEW), validate(getRoleByIdSchema), roleController.getRoleById);
router.post("/", requirePermission(PERMISSIONS.ROLE_MANAGE), validate(createRoleSchema), roleController.createRole);
router.put("/:id", requirePermission(PERMISSIONS.ROLE_MANAGE), validate(updateRoleSchema), roleController.updateRole);

router.post("/:id/permissions", requirePermission(PERMISSIONS.ROLE_MANAGE), validate(assignPermissionSchema), roleController.assignPermission);
router.delete("/:id/permissions/:permissionId", requirePermission(PERMISSIONS.ROLE_MANAGE), validate(removePermissionSchema), roleController.removePermission);

module.exports = router;
