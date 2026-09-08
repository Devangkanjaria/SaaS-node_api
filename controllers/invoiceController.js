const invoiceService = require("../services/invoiceService");
const { sendSuccess, sendCreated, sendPaginated } = require("../utils/responseHandler");

class InvoiceController {
  async listInvoices(req, res, next) {
    try {
      const { invoices, pagination } = await invoiceService.listInvoices(req.organizationId, req.query);
      return sendPaginated(res, "Invoices fetched successfully", invoices, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.organizationId, req.params.id);
      return sendSuccess(res, "Invoice fetched successfully", invoice);
    } catch (err) {
      next(err);
    }
  }

  async createInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.createInvoice(req.organizationId, req.body, req);
      return sendCreated(res, "Invoice created successfully", invoice);
    } catch (err) {
      next(err);
    }
  }

  async updateInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.updateInvoice(req.organizationId, req.params.id, req.body, req);
      return sendSuccess(res, "Invoice updated successfully", invoice);
    } catch (err) {
      next(err);
    }
  }

  async updateInvoiceStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const invoice = await invoiceService.updateInvoiceStatus(req.organizationId, req.params.id, status, reason, req);
      return sendSuccess(res, "Invoice status updated successfully", invoice);
    } catch (err) {
      next(err);
    }
  }

  async duplicateInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.duplicateInvoice(req.organizationId, req.params.id, req);
      return sendCreated(res, "Invoice duplicated successfully", invoice);
    } catch (err) {
      next(err);
    }
  }

  async deleteInvoice(req, res, next) {
    try {
      const invoice = await invoiceService.deleteInvoice(req.organizationId, req.params.id, req);
      return sendSuccess(res, "Invoice cancelled successfully", invoice);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InvoiceController();
