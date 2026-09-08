const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const tenantMiddleware = require("../middlewares/tenantMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  getInvoiceByIdSchema,
} = require("../validators/invoiceValidator");

router.use(authenticateJWT);
router.use(tenantMiddleware);

router.get("/", requirePermission(PERMISSIONS.INVOICE_VIEW), invoiceController.listInvoices);
router.get("/:id", requirePermission(PERMISSIONS.INVOICE_VIEW), validate(getInvoiceByIdSchema), invoiceController.getInvoiceById);
router.post("/", requirePermission(PERMISSIONS.INVOICE_CREATE), validate(createInvoiceSchema), invoiceController.createInvoice);
router.put("/:id", requirePermission(PERMISSIONS.INVOICE_UPDATE), validate(updateInvoiceSchema), invoiceController.updateInvoice);
router.patch("/:id/status", requirePermission(PERMISSIONS.INVOICE_STATUS_CHANGE), validate(updateInvoiceStatusSchema), invoiceController.updateInvoiceStatus);
router.post("/:id/duplicate", requirePermission(PERMISSIONS.INVOICE_CREATE), validate(getInvoiceByIdSchema), invoiceController.duplicateInvoice);
router.delete("/:id", requirePermission(PERMISSIONS.INVOICE_DELETE), validate(getInvoiceByIdSchema), invoiceController.deleteInvoice);

module.exports = router;