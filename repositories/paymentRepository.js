const db = require("../config/db");

class PaymentRepository {
  async listPayments(organizationId, { page = 1, limit = 10, invoiceId, status, paymentMethod, dateFrom, dateTo }) {
    const offset = (page - 1) * limit;

    let baseQuery = db("payments")
      .join("invoices", "payments.invoice_id", "invoices.id")
      .join("clients", "invoices.client_id", "clients.id")
      .where("payments.organization_id", organizationId)
      .select(
        "payments.*",
        "invoices.invoice_number",
        "invoices.total_amount as invoice_total",
        "invoices.balance_amount as invoice_balance",
        "clients.name as client_name"
      );

    if (invoiceId) {
      baseQuery = baseQuery.where("payments.invoice_id", invoiceId);
    }
    if (status) {
      baseQuery = baseQuery.where("payments.status", status);
    }
    if (paymentMethod) {
      baseQuery = baseQuery.where("payments.payment_method", paymentMethod);
    }
    if (dateFrom) {
      baseQuery = baseQuery.where("payments.paid_at", ">=", dateFrom);
    }
    if (dateTo) {
      baseQuery = baseQuery.where("payments.paid_at", "<=", dateTo);
    }

    const countResult = await baseQuery.clone().count({ total: "payments.id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const payments = await baseQuery
      .clone()
      .orderBy("payments.paid_at", "desc")
      .limit(limit)
      .offset(offset);

    return { payments, total };
  }

  async findById(organizationId, id, trx = null) {
    const query = (trx || db)("payments");
    return query
      .join("invoices", "payments.invoice_id", "invoices.id")
      .where({ "payments.id": id, "payments.organization_id": organizationId })
      .select("payments.*", "invoices.invoice_number")
      .first();
  }

  async findByIdForUpdate(organizationId, id, trx) {
    return trx("payments").where({ id, organization_id: organizationId }).forUpdate().first();
  }

  async create(paymentData, trx = null) {
    const query = (trx || db)("payments");
    const [id] = await query.insert({
      organization_id: paymentData.organization_id,
      invoice_id: paymentData.invoice_id,
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      status: paymentData.status || "completed",
      reference_number: paymentData.reference_number || null,
      paid_at: paymentData.paid_at || new Date(),
      notes: paymentData.notes || null,
      created_by: paymentData.created_by || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(paymentData.organization_id, id, trx);
  }

  async update(organizationId, id, updateData, trx = null) {
    const query = (trx || db)("payments");
    await query.where({ id, organization_id: organizationId }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(organizationId, id, trx);
  }

  async findTransactionById(transactionId, trx = null) {
    const query = (trx || db)("payment_transactions");
    return query.where({ transaction_id: transactionId }).first();
  }

  async createPaymentTransaction(txData, trx = null) {
    const query = (trx || db)("payment_transactions");
    const [id] = await query.insert({
      payment_id: txData.payment_id,
      transaction_id: txData.transaction_id,
      gateway: txData.gateway || null,
      gateway_transaction_id: txData.gateway_transaction_id || null,
      amount: txData.amount,
      status: txData.status || "success",
      gateway_response: txData.gateway_response ? JSON.stringify(txData.gateway_response) : null,
      processed_at: txData.processed_at || new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });
    return (trx || db)("payment_transactions").where({ id }).first();
  }
}

module.exports = new PaymentRepository();
