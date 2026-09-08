const paymentService = require("../services/paymentService");
const { sendSuccess, sendCreated, sendPaginated } = require("../utils/responseHandler");

class PaymentController {
  async listPayments(req, res, next) {
    try {
      const { payments, pagination } = await paymentService.listPayments(req.query);
      return sendPaginated(res, "Payments fetched successfully", payments, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      return sendSuccess(res, "Payment fetched successfully", payment);
    } catch (err) {
      next(err);
    }
  }

  async createPayment(req, res, next) {
    try {
      const payment = await paymentService.createPayment(req.params.invoiceId, req.body, req);
      return sendCreated(res, "Payment recorded successfully", payment);
    } catch (err) {
      next(err);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const payment = await paymentService.refundPayment(req.params.id, req.body, req);
      return sendSuccess(res, "Payment refunded successfully", payment);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
