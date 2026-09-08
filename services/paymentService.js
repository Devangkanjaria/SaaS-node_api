const db = require("../config/db");
const paymentRepository = require("../repositories/paymentRepository");
const invoiceRepository = require("../repositories/invoiceRepository");
const auditService = require("./auditService");
const notificationService = require("./notificationService");
const { NotFoundError, BadRequestError, UnprocessableEntityError } = require("../errors/errorTypes");
const { INVOICE_STATUS, PAYMENT_STATUS } = require("../constants/statusCodes");

const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

class PaymentService {
  async listPayments(organizationId, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const invoiceId = query.invoiceId ? parseInt(query.invoiceId, 10) : null;
    const status = query.status || null;
    const paymentMethod = query.paymentMethod || query.payment_method || null;
    const dateFrom = query.date_from || query.from_date || null;
    const dateTo = query.date_to || query.to_date || null;

    const { payments, total } = await paymentRepository.listPayments(organizationId, {
      page,
      limit,
      invoiceId,
      status,
      paymentMethod,
      dateFrom,
      dateTo,
    });

    return {
      payments,
      pagination: { page, limit, total },
    };
  }

  async getPaymentById(organizationId, id) {
    const payment = await paymentRepository.findById(organizationId, id);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    return payment;
  }

  /**
   * Tenant-Scoped Transactional Payment Creation
   */
  async createPayment(organizationId, invoiceId, paymentData, req) {
    const userId = req.user ? req.user.id : null;
    const paymentAmount = round2(paymentData.amount);

    // 1. Idempotency Check
    if (paymentData.transaction_id) {
      const existingTx = await paymentRepository.findTransactionById(paymentData.transaction_id);
      if (existingTx) {
        return paymentRepository.findById(organizationId, existingTx.payment_id);
      }
    }

    // 2. Transaction
    return await db.transaction(async (trx) => {
      const invoice = await invoiceRepository.findByIdForUpdate(organizationId, invoiceId, trx);
      if (!invoice) {
        throw new NotFoundError("Invoice not found in your organization");
      }

      if (invoice.status === INVOICE_STATUS.CANCELLED) {
        throw new BadRequestError("Cannot record payment for a cancelled invoice");
      }

      if (invoice.status === INVOICE_STATUS.PAID && Number(invoice.balance_amount) <= 0) {
        throw new BadRequestError("Invoice is already fully paid");
      }

      const currentBalance = round2(invoice.balance_amount);
      if (paymentAmount > currentBalance) {
        throw new UnprocessableEntityError(
          `Payment amount (₹${paymentAmount}) exceeds invoice outstanding balance (₹${currentBalance})`
        );
      }

      // 3. Insert Payment
      const payment = await paymentRepository.create(
        {
          organization_id: organizationId,
          invoice_id: invoiceId,
          amount: paymentAmount,
          payment_method: paymentData.payment_method,
          status: PAYMENT_STATUS.COMPLETED,
          reference_number: paymentData.reference_number || null,
          paid_at: paymentData.paid_at || new Date(),
          notes: paymentData.notes || null,
          created_by: userId,
        },
        trx
      );

      // 4. Insert Payment Transaction
      if (paymentData.transaction_id) {
        await paymentRepository.createPaymentTransaction(
          {
            payment_id: payment.id,
            transaction_id: paymentData.transaction_id,
            gateway: paymentData.gateway || "generic",
            gateway_transaction_id: paymentData.gateway_transaction_id || null,
            amount: paymentAmount,
            status: "success",
            gateway_response: paymentData.gateway_response || null,
            processed_at: new Date(),
          },
          trx
        );
      }

      // 5. Update Financials
      const newPaidAmount = round2(Number(invoice.paid_amount) + paymentAmount);
      const newBalanceAmount = Math.max(0, round2(Number(invoice.total_amount) - newPaidAmount));

      let newInvoiceStatus = invoice.status;
      if (newBalanceAmount <= 0) {
        newInvoiceStatus = INVOICE_STATUS.PAID;
      } else if (newPaidAmount > 0) {
        newInvoiceStatus = INVOICE_STATUS.PARTIAL;
      }

      await invoiceRepository.update(
        organizationId,
        invoiceId,
        {
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          status: newInvoiceStatus,
        },
        trx
      );

      if (newInvoiceStatus !== invoice.status) {
        await invoiceRepository.createStatusHistory(
          {
            invoiceId,
            oldStatus: invoice.status,
            newStatus: newInvoiceStatus,
            reason: `Payment of ₹${paymentAmount} received`,
            changedBy: userId,
          },
          trx
        );
      }

      await auditService.logAction(
        req,
        {
          action: "PAYMENT",
          entityType: "payment",
          entityId: payment.id,
          newValues: { invoice_id: invoiceId, amount: paymentAmount, payment_method: paymentData.payment_method },
        },
        trx
      );

      if (userId) {
        await notificationService.notify(
          {
            organizationId,
            userId,
            type: "PAYMENT_RECEIVED",
            title: "Payment Received",
            message: `Payment of ₹${paymentAmount} recorded for invoice ${invoice.invoice_number}`,
            entityType: "payment",
            entityId: payment.id,
          },
          trx
        );
      }

      return payment;
    });
  }

  /**
   * Process Payment Refund
   */
  async refundPayment(organizationId, paymentId, { reason }, req) {
    const userId = req.user ? req.user.id : null;

    return await db.transaction(async (trx) => {
      const payment = await paymentRepository.findByIdForUpdate(organizationId, paymentId, trx);
      if (!payment) {
        throw new NotFoundError("Payment not found in your organization");
      }

      if (payment.status === PAYMENT_STATUS.REFUNDED) {
        throw new BadRequestError("This payment has already been refunded");
      }

      const invoice = await invoiceRepository.findByIdForUpdate(organizationId, payment.invoice_id, trx);
      if (!invoice) {
        throw new NotFoundError("Invoice associated with payment not found");
      }

      const refundAmount = round2(payment.amount);
      const newPaidAmount = Math.max(0, round2(Number(invoice.paid_amount) - refundAmount));
      const newBalanceAmount = Math.min(Number(invoice.total_amount), round2(Number(invoice.balance_amount) + refundAmount));

      let newInvoiceStatus = invoice.status;
      if (newPaidAmount === 0) {
        newInvoiceStatus = INVOICE_STATUS.SENT;
      } else {
        newInvoiceStatus = INVOICE_STATUS.PARTIAL;
      }

      await paymentRepository.update(
        organizationId,
        paymentId,
        {
          status: PAYMENT_STATUS.REFUNDED,
          notes: payment.notes ? `${payment.notes} | Refund Reason: ${reason}` : `Refund Reason: ${reason}`,
        },
        trx
      );

      await invoiceRepository.update(
        organizationId,
        payment.invoice_id,
        {
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          status: newInvoiceStatus,
        },
        trx
      );

      await invoiceRepository.createStatusHistory(
        {
          invoiceId: payment.invoice_id,
          oldStatus: invoice.status,
          newStatus: newInvoiceStatus,
          reason: `Payment refund of ₹${refundAmount}: ${reason}`,
          changedBy: userId,
        },
        trx
      );

      await auditService.logAction(
        req,
        {
          action: "REFUND",
          entityType: "payment",
          entityId: paymentId,
          newValues: { refund_amount: refundAmount, reason },
        },
        trx
      );

      return paymentRepository.findById(organizationId, paymentId, trx);
    });
  }
}

module.exports = new PaymentService();
