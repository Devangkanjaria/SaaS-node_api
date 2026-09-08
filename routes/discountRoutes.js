const express = require("express");
const router = express.Router();
const { discountController } = require("../controllers/taxDiscountController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createDiscountSchema,
  updateDiscountSchema,
  updateDiscountStatusSchema,
} = require("../validators/taxDiscountValidator");

router.use(authenticateJWT);

router.get("/", discountController.listDiscounts);
router.get("/:id", discountController.getDiscountById);
router.post("/", requirePermission(PERMISSIONS.DISCOUNT_MANAGE), validate(createDiscountSchema), discountController.createDiscount);
router.put("/:id", requirePermission(PERMISSIONS.DISCOUNT_MANAGE), validate(updateDiscountSchema), discountController.updateDiscount);
router.patch("/:id/status", requirePermission(PERMISSIONS.DISCOUNT_MANAGE), validate(updateDiscountStatusSchema), discountController.updateDiscountStatus);

module.exports = router;
