const db = require("../config/db");

class PaymentRepository {
  async listPayments({ page = 1, limit = 10, invoiceId, status, paymentMethod, dateFrom, dateTo }) {
    const offset = (page - 1) * limit;

    let baseQuery = db("payments")
      .join("invoices", "payments.invoice_id", "invoices.id")
      .join("clients", "invoices.client_id", "clients.id")
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

  async findById(id, trx = null) {
    const query = (trx || db)("payments");
    return query
      .join("invoices", "payments.invoice_id", "invoices.id")
      .where("payments.id", id)
      .select("payments.*", "invoices.invoice_number")
      .first();
  }

  async findByIdForUpdate(id, trx) {
    return trx("payments").where({ id }).forUpdate().first();
  }

  async create(paymentData, trx = null) {
    const query = (trx || db)("payments");
    const [id] = await query.insert({
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
    return this.findById(id, trx);
  }

  async update(id, updateData, trx = null) {
    const query = (trx || db)("payments");
    await query.where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id, trx);
  }

  // Payment Transactions (for gateway idempotency)
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
