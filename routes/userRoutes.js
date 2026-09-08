const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  getUserByIdSchema,
} = require("../validators/userValidator");

router.use(authenticateJWT);

router.get("/", requirePermission(PERMISSIONS.USER_VIEW), userController.listUsers);
router.get("/:id", requirePermission(PERMISSIONS.USER_VIEW), validate(getUserByIdSchema), userController.getUserById);
router.post("/", requirePermission(PERMISSIONS.USER_CREATE), validate(createUserSchema), userController.createUser);
router.put("/:id", requirePermission(PERMISSIONS.USER_UPDATE), validate(updateUserSchema), userController.updateUser);
router.patch("/:id/status", requirePermission(PERMISSIONS.USER_UPDATE), validate(updateUserStatusSchema), userController.updateUserStatus);
router.delete("/:id", requirePermission(PERMISSIONS.USER_DELETE), validate(getUserByIdSchema), userController.deleteUser);

module.exports = router;
