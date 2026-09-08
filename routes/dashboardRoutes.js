const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authenticateJWT = require("../middlewares/authMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");

router.use(authenticateJWT);

// Dashboard Summary KPI
router.get("/summary", requirePermission(PERMISSIONS.DASHBOARD_VIEW), dashboardController.getSummary);

// Reports
router.get("/reports/revenue", requirePermission(PERMISSIONS.REPORT_VIEW), dashboardController.getRevenueReport);
router.get("/reports/invoices", requirePermission(PERMISSIONS.REPORT_VIEW), dashboardController.getInvoiceReport);

// Audit Logs
router.get("/audit-logs", requirePermission(PERMISSIONS.AUDIT_VIEW), dashboardController.getAuditLogs);

// Notifications
router.get("/notifications", dashboardController.getNotifications);
router.patch("/notifications/:id/read", dashboardController.markNotificationRead);
router.post("/notifications/mark-all-read", dashboardController.markAllNotificationsRead);

module.exports = router;
