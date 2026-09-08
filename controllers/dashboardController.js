const reportService = require("../services/reportService");
const auditService = require("../services/auditService");
const notificationService = require("../services/notificationService");
const { sendSuccess, sendPaginated } = require("../utils/responseHandler");

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await reportService.getDashboardSummary();
      return sendSuccess(res, "Dashboard summary fetched successfully", summary);
    } catch (err) {
      next(err);
    }
  }

  async getRevenueReport(req, res, next) {
    try {
      const { from_date, to_date, group_by } = req.query;
      const report = await reportService.getRevenueReport({
        fromDate: from_date,
        toDate: to_date,
        groupBy: group_by,
      });
      return sendSuccess(res, "Revenue report fetched successfully", report);
    } catch (err) {
      next(err);
    }
  }

  async getInvoiceReport(req, res, next) {
    try {
      const { from_date, to_date } = req.query;
      const report = await reportService.getInvoiceReport({
        fromDate: from_date,
        toDate: to_date,
      });
      return sendSuccess(res, "Invoice report fetched successfully", report);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { logs, total } = await auditService.listLogs(req.query);
      return sendPaginated(res, "Audit logs fetched successfully", logs, {
        page: req.query.page,
        limit: req.query.limit,
        total,
      });
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const { notifications, total } = await notificationService.listUserNotifications(req.user.id, req.query);
      return sendPaginated(res, "Notifications fetched successfully", notifications, {
        page: req.query.page,
        limit: req.query.limit,
        total,
      });
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req.params.id, req.user.id);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }

  async markAllNotificationsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
