const express = require("express");
const router = express.Router();
const { taxController } = require("../controllers/taxDiscountController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createTaxSchema,
  updateTaxSchema,
  updateTaxStatusSchema,
} = require("../validators/taxDiscountValidator");

router.use(authenticateJWT);

router.get("/", taxController.listTaxes);
router.get("/:id", taxController.getTaxById);
router.post("/", requirePermission(PERMISSIONS.TAX_MANAGE), validate(createTaxSchema), taxController.createTax);
router.put("/:id", requirePermission(PERMISSIONS.TAX_MANAGE), validate(updateTaxSchema), taxController.updateTax);
router.patch("/:id/status", requirePermission(PERMISSIONS.TAX_MANAGE), validate(updateTaxStatusSchema), taxController.updateTaxStatus);

module.exports = router;
