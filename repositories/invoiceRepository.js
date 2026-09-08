const db = require("../config/db");

class InvoiceRepository {
  async listInvoices({ page = 1, limit = 10, search, status, clientId, dateFrom, dateTo, minAmount, maxAmount, sortBy = "created_at", sortOrder = "desc" }) {
    const offset = (page - 1) * limit;

    let baseQuery = db("invoices")
      .join("clients", "invoices.client_id", "clients.id")
      .select("invoices.*", "clients.name as client_name", "clients.email as client_email", "clients.company_name as client_company");

    if (search) {
      baseQuery = baseQuery.where(function () {
        this.where("invoices.invoice_number", "like", `%${search}%`)
          .orWhere("clients.name", "like", `%${search}%`)
          .orWhere("clients.company_name", "like", `%${search}%`);
      });
    }

    if (status) {
      baseQuery = baseQuery.where("invoices.status", status);
    }

    if (clientId) {
      baseQuery = baseQuery.where("invoices.client_id", clientId);
    }

    if (dateFrom) {
      baseQuery = baseQuery.where("invoices.issue_date", ">=", dateFrom);
    }

    if (dateTo) {
      baseQuery = baseQuery.where("invoices.issue_date", "<=", dateTo);
    }

    if (minAmount) {
      baseQuery = baseQuery.where("invoices.total_amount", ">=", minAmount);
    }

    if (maxAmount) {
      baseQuery = baseQuery.where("invoices.total_amount", "<=", maxAmount);
    }

    const countResult = await baseQuery.clone().count({ total: "invoices.id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const invoices = await baseQuery
      .clone()
      .orderBy(`invoices.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return { invoices, total };
  }

  async findById(id, trx = null) {
    const query = (trx || db)("invoices");
    return query
      .join("clients", "invoices.client_id", "clients.id")
      .where("invoices.id", id)
      .select(
        "invoices.*",
        "clients.name as client_name",
        "clients.email as client_email",
        "clients.phone as client_phone",
        "clients.company_name as client_company",
        "clients.tax_number as client_tax_number"
      )
      .first();
  }

  async findByIdForUpdate(id, trx) {
    return trx("invoices").where({ id }).forUpdate().first();
  }

  async findByInvoiceNumber(invoiceNumber, trx = null) {
    const query = (trx || db)("invoices");
    return query.where({ invoice_number: invoiceNumber }).first();
  }

  async create(invoiceData, trx = null) {
    const query = (trx || db)("invoices");
    const [id] = await query.insert({
      invoice_number: invoiceData.invoice_number,
      client_id: invoiceData.client_id,
      status: invoiceData.status || "draft",
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date || null,
      subtotal: invoiceData.subtotal,
      discount_amount: invoiceData.discount_amount || 0.0,
      tax_amount: invoiceData.tax_amount || 0.0,
      total_amount: invoiceData.total_amount,
      paid_amount: invoiceData.paid_amount || 0.0,
      balance_amount: invoiceData.balance_amount !== undefined ? invoiceData.balance_amount : invoiceData.total_amount,
      currency: invoiceData.currency || "INR",
      notes: invoiceData.notes || null,
      terms: invoiceData.terms || null,
      created_by: invoiceData.created_by || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return id;
  }

  async update(id, updateData, trx = null) {
    const query = (trx || db)("invoices");
    await query.where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id, trx);
  }

  async delete(id, trx = null) {
    const query = (trx || db)("invoices");
    return query.where({ id }).del();
  }

  // Invoice Items
  async getInvoiceItems(invoiceId, trx = null) {
    const query = (trx || db)("invoice_items");
    return query
      .leftJoin("products", "invoice_items.product_id", "products.id")
      .where("invoice_items.invoice_id", invoiceId)
      .select("invoice_items.*", "products.name as product_name", "products.sku as product_sku");
  }

  async createInvoiceItems(items, trx = null) {
    const query = (trx || db)("invoice_items");
    return query.insert(items);
  }

  async deleteInvoiceItems(invoiceId, trx = null) {
    const query = (trx || db)("invoice_items");
    return query.where({ invoice_id: invoiceId }).del();
  }

  // Invoice Status History
  async createStatusHistory({ invoiceId, oldStatus, newStatus, reason, changedBy }, trx = null) {
    const query = (trx || db)("invoice_status_history");
    return query.insert({
      invoice_id: invoiceId,
      old_status: oldStatus,
      new_status: newStatus,
      reason: reason || null,
      changed_by: changedBy || null,
      created_at: new Date(),
    });
  }

  async getStatusHistory(invoiceId) {
    return db("invoice_status_history")
      .leftJoin("users", "invoice_status_history.changed_by", "users.id")
      .where("invoice_status_history.invoice_id", invoiceId)
      .select("invoice_status_history.*", "users.name as changed_by_name")
      .orderBy("invoice_status_history.created_at", "desc");
  }

  // Payments for this invoice
  async getInvoicePayments(invoiceId) {
    return db("payments").where({ invoice_id: invoiceId }).orderBy("paid_at", "desc");
  }

  // Helper to generate unique sequential invoice number
  async generateNextInvoiceNumber(trx = null) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const latest = await (trx || db)("invoices")
      .where("invoice_number", "like", `INV-${dateStr}-%`)
      .orderBy("id", "desc")
      .first();

    let seq = 1;
    if (latest && latest.invoice_number) {
      const parts = latest.invoice_number.split("-");
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }
    return `INV-${dateStr}-${String(seq).padStart(4, "0")}`;
  }
}

module.exports = new InvoiceRepository();
