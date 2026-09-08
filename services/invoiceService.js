const db = require("../config/db");
const invoiceRepository = require("../repositories/invoiceRepository");
const clientRepository = require("../repositories/clientRepository");
const productRepository = require("../repositories/productRepository");
const invoiceCalculationService = require("./invoiceCalculationService");
const planLimitService = require("./planLimitService");
const auditService = require("./auditService");
const notificationService = require("./notificationService");
const { NotFoundError, BadRequestError, UnprocessableEntityError } = require("../errors/errorTypes");
const { INVOICE_STATUS } = require("../constants/statusCodes");

class InvoiceService {
  async listInvoices(organizationId, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = query.search || null;
    const status = query.status || null;
    const clientId = query.clientId ? parseInt(query.clientId, 10) : null;
    const dateFrom = query.date_from || query.from_date || null;
    const dateTo = query.date_to || query.to_date || null;
    const minAmount = query.min_amount ? parseFloat(query.min_amount) : null;
    const maxAmount = query.max_amount ? parseFloat(query.max_amount) : null;
    const sortBy = query.sort_by || "created_at";
    const sortOrder = query.sort_order || "desc";

    const allowedSortFields = ["id", "invoice_number", "issue_date", "due_date", "total_amount", "paid_amount", "balance_amount", "status", "created_at"];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";

    const { invoices, total } = await invoiceRepository.listInvoices(organizationId, {
      page,
      limit,
      search,
      status,
      clientId,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      sortBy: validSortBy,
      sortOrder: sortOrder.toLowerCase() === "asc" ? "asc" : "desc",
    });

    return {
      invoices,
      pagination: { page, limit, total },
    };
  }

  async getInvoiceById(organizationId, id) {
    const invoice = await invoiceRepository.findById(organizationId, id);
    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    const items = await invoiceRepository.getInvoiceItems(id);
    const payments = await invoiceRepository.getInvoicePayments(id);
    const statusHistory = await invoiceRepository.getStatusHistory(id);

    return {
      ...invoice,
      items,
      payments,
      status_history: statusHistory,
    };
  }

  /**
   * Tenant-Scoped Transactional Invoice Creation
   */
  async createInvoice(organizationId, invoiceData, req) {
    const userId = req.user ? req.user.id : null;

    // 0. Enforce SaaS Plan Limit on Invoices
    await planLimitService.checkInvoiceLimit(organizationId);

    // 1. Verify Client in Tenant
    const client = await clientRepository.findById(organizationId, invoiceData.client_id);
    if (!client) {
      throw new NotFoundError("Client not found in this organization");
    }
    if (client.status !== "active") {
      throw new BadRequestError("Cannot create invoice for an inactive client");
    }

    // 2. Validate Products & Stock in Tenant
    for (const item of invoiceData.items) {
      if (item.product_id) {
        const product = await productRepository.findById(organizationId, item.product_id);
        if (!product) {
          throw new NotFoundError(`Product ID ${item.product_id} not found in this organization`);
        }
        if (product.status !== "active") {
          throw new BadRequestError(`Product "${product.name}" is currently inactive`);
        }
      }
    }

    // 3. Recalculate Financials Server-Side
    const calculation = invoiceCalculationService.calculateInvoice({
      items: invoiceData.items,
      discount: invoiceData.discount,
      tax: invoiceData.tax,
    });

    // 4. Begin Knex Database Transaction
    return await db.transaction(async (trx) => {
      // Generate unique invoice number scoped to organization
      let invoiceNumber = invoiceData.invoice_number;
      if (!invoiceNumber) {
        invoiceNumber = await invoiceRepository.generateNextInvoiceNumber(organizationId, trx);
      } else {
        const existing = await invoiceRepository.findByInvoiceNumber(organizationId, invoiceNumber, trx);
        if (existing) {
          throw new BadRequestError(`Invoice number ${invoiceNumber} already exists in your organization`);
        }
      }

      // Insert Invoice Record
      const invoiceId = await invoiceRepository.create(
        {
          organization_id: organizationId,
          invoice_number: invoiceNumber,
          client_id: invoiceData.client_id,
          status: INVOICE_STATUS.DRAFT,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date || null,
          subtotal: calculation.subtotal,
          discount_amount: calculation.discount_amount,
          tax_amount: calculation.tax_amount,
          total_amount: calculation.total_amount,
          paid_amount: 0.0,
          balance_amount: calculation.total_amount,
          currency: invoiceData.currency || "INR",
          notes: invoiceData.notes || null,
          terms: invoiceData.terms || null,
          created_by: userId,
        },
        trx
      );

      // Insert Line Items
      const lineItemsToInsert = calculation.items.map((item) => ({
        invoice_id: invoiceId,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        tax_rate: item.tax_rate,
        tax_amount: item.tax_amount,
        total_amount: item.total_amount,
        created_at: new Date(),
        updated_at: new Date(),
      }));
      await invoiceRepository.createInvoiceItems(lineItemsToInsert, trx);

      // Deduct/Adjust Inventory if product linked
      for (const item of calculation.items) {
        if (item.product_id) {
          await productRepository.adjustInventoryQuantity(item.product_id, -item.quantity, trx);
        }
      }

      // Status History
      await invoiceRepository.createStatusHistory(
        {
          invoiceId,
          oldStatus: null,
          newStatus: INVOICE_STATUS.DRAFT,
          reason: "Initial invoice creation",
          changedBy: userId,
        },
        trx
      );

      // Audit Log
      await auditService.logAction(
        req,
        {
          action: "CREATE",
          entityType: "invoice",
          entityId: invoiceId,
          newValues: { invoice_number: invoiceNumber, total_amount: calculation.total_amount },
        },
        trx
      );

      // Notification
      if (userId) {
        await notificationService.notify(
          {
            organizationId,
            userId,
            type: "INVOICE_CREATED",
            title: "Invoice Created",
            message: `Invoice ${invoiceNumber} created for ${client.name} for ₹${calculation.total_amount}`,
            entityType: "invoice",
            entityId: invoiceId,
          },
          trx
        );
      }

      const createdInvoice = await invoiceRepository.findById(organizationId, invoiceId, trx);
      const insertedItems = await invoiceRepository.getInvoiceItems(invoiceId, trx);

      return {
        ...createdInvoice,
        items: insertedItems,
      };
    });
  }

  /**
   * Tenant-Scoped Transactional Invoice Update
   */
  async updateInvoice(organizationId, id, invoiceData, req) {
    const userId = req.user ? req.user.id : null;

    return await db.transaction(async (trx) => {
      const invoice = await invoiceRepository.findByIdForUpdate(organizationId, id, trx);
      if (!invoice) {
        throw new NotFoundError("Invoice not found in your organization");
      }

      if (invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.CANCELLED) {
        throw new BadRequestError(`Cannot update invoice with status '${invoice.status}'`);
      }

      if (invoice.paid_amount > 0) {
        throw new BadRequestError("Cannot edit invoice items after payments have been recorded");
      }

      let calculation = null;
      if (invoiceData.items && invoiceData.items.length > 0) {
        calculation = invoiceCalculationService.calculateInvoice({
          items: invoiceData.items,
          discount: invoiceData.discount,
          tax: invoiceData.tax,
        });

        // Revert previous inventory deductions
        const oldItems = await invoiceRepository.getInvoiceItems(id, trx);
        for (const oldItem of oldItems) {
          if (oldItem.product_id) {
            await productRepository.adjustInventoryQuantity(oldItem.product_id, oldItem.quantity, trx);
          }
        }

        // Remove old items
        await invoiceRepository.deleteInvoiceItems(id, trx);

        // Insert new items
        const lineItemsToInsert = calculation.items.map((item) => ({
          invoice_id: id,
          product_id: item.product_id || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          tax_rate: item.tax_rate,
          tax_amount: item.tax_amount,
          total_amount: item.total_amount,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await invoiceRepository.createInvoiceItems(lineItemsToInsert, trx);

        // Apply new inventory deductions
        for (const item of calculation.items) {
          if (item.product_id) {
            await productRepository.adjustInventoryQuantity(item.product_id, -item.quantity, trx);
          }
        }
      }

      const updateFields = {};
      if (invoiceData.client_id) updateFields.client_id = invoiceData.client_id;
      if (invoiceData.issue_date) updateFields.issue_date = invoiceData.issue_date;
      if (invoiceData.due_date !== undefined) updateFields.due_date = invoiceData.due_date;
      if (invoiceData.currency) updateFields.currency = invoiceData.currency;
      if (invoiceData.notes !== undefined) updateFields.notes = invoiceData.notes;
      if (invoiceData.terms !== undefined) updateFields.terms = invoiceData.terms;

      if (calculation) {
        updateFields.subtotal = calculation.subtotal;
        updateFields.discount_amount = calculation.discount_amount;
        updateFields.tax_amount = calculation.tax_amount;
        updateFields.total_amount = calculation.total_amount;
        updateFields.balance_amount = calculation.total_amount - Number(invoice.paid_amount || 0);
      }

      await invoiceRepository.update(organizationId, id, updateFields, trx);

      await auditService.logAction(
        req,
        {
          action: "UPDATE",
          entityType: "invoice",
          entityId: id,
          oldValues: invoice,
          newValues: updateFields,
        },
        trx
      );

      const updated = await invoiceRepository.findById(organizationId, id, trx);
      const items = await invoiceRepository.getInvoiceItems(id, trx);
      return { ...updated, items };
    });
  }

  /**
   * Tenant-Scoped Status Workflow
   */
  async updateInvoiceStatus(organizationId, id, newStatus, reason, req) {
    const userId = req.user ? req.user.id : null;

    return await db.transaction(async (trx) => {
      const invoice = await invoiceRepository.findByIdForUpdate(organizationId, id, trx);
      if (!invoice) {
        throw new NotFoundError("Invoice not found in your organization");
      }

      const currentStatus = invoice.status;
      if (currentStatus === newStatus) {
        return invoice;
      }

      const validTransitions = {
        [INVOICE_STATUS.DRAFT]: [INVOICE_STATUS.SENT, INVOICE_STATUS.CANCELLED],
        [INVOICE_STATUS.SENT]: [INVOICE_STATUS.PARTIAL, INVOICE_STATUS.PAID, INVOICE_STATUS.OVERDUE, INVOICE_STATUS.CANCELLED],
        [INVOICE_STATUS.PARTIAL]: [INVOICE_STATUS.PAID, INVOICE_STATUS.OVERDUE, INVOICE_STATUS.CANCELLED],
        [INVOICE_STATUS.OVERDUE]: [INVOICE_STATUS.PARTIAL, INVOICE_STATUS.PAID, INVOICE_STATUS.CANCELLED],
        [INVOICE_STATUS.PAID]: [],
        [INVOICE_STATUS.CANCELLED]: [],
      };

      const allowedNext = validTransitions[currentStatus] || [];
      if (!allowedNext.includes(newStatus)) {
        throw new UnprocessableEntityError(
          `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowedNext.join(", ")}]`
        );
      }

      if (newStatus === INVOICE_STATUS.CANCELLED) {
        const items = await invoiceRepository.getInvoiceItems(id, trx);
        for (const item of items) {
          if (item.product_id) {
            await productRepository.adjustInventoryQuantity(item.product_id, item.quantity, trx);
          }
        }
      }

      await invoiceRepository.update(organizationId, id, { status: newStatus }, trx);

      await invoiceRepository.createStatusHistory(
        {
          invoiceId: id,
          oldStatus: currentStatus,
          newStatus,
          reason,
          changedBy: userId,
        },
        trx
      );

      await auditService.logAction(
        req,
        {
          action: "STATUS_CHANGE",
          entityType: "invoice",
          entityId: id,
          oldValues: { status: currentStatus },
          newValues: { status: newStatus, reason },
        },
        trx
      );

      return invoiceRepository.findById(organizationId, id, trx);
    });
  }

  async duplicateInvoice(organizationId, id, req) {
    const original = await this.getInvoiceById(organizationId, id);
    const invoiceData = {
      client_id: original.client_id,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: null,
      currency: original.currency,
      notes: original.notes,
      terms: original.terms,
      items: original.items.map((it) => ({
        product_id: it.product_id,
        description: it.description,
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
        discount_amount: Number(it.discount_amount),
        tax_rate: Number(it.tax_rate),
      })),
    };

    return this.createInvoice(organizationId, invoiceData, req);
  }

  async deleteInvoice(organizationId, id, req) {
    const invoice = await invoiceRepository.findById(organizationId, id);
    if (!invoice) {
      throw new NotFoundError("Invoice not found in your organization");
    }

    if (invoice.paid_amount > 0) {
      throw new BadRequestError("Cannot delete invoice that has recorded payments. Cancel it instead.");
    }

    return this.updateInvoiceStatus(organizationId, id, INVOICE_STATUS.CANCELLED, "Cancelled by user", req);
  }
}

module.exports = new InvoiceService();
