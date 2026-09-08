const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createPaymentSchema,
  refundPaymentSchema,
  getPaymentByIdSchema,
} = require("../validators/paymentValidator");

router.use(authenticateJWT);

router.get("/", requirePermission(PERMISSIONS.PAYMENT_VIEW), paymentController.listPayments);
router.get("/:id", requirePermission(PERMISSIONS.PAYMENT_VIEW), validate(getPaymentByIdSchema), paymentController.getPaymentById);
router.post("/invoice/:invoiceId", requirePermission(PERMISSIONS.PAYMENT_CREATE), validate(createPaymentSchema), paymentController.createPayment);
router.post("/:id/refund", requirePermission(PERMISSIONS.PAYMENT_REFUND), validate(refundPaymentSchema), paymentController.refundPayment);

module.exports = router;
