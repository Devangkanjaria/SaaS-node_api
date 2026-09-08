const db = require("../config/db");

class ReportService {
  async getDashboardSummary(organizationId) {
    // 1. Invoices stats aggregation for tenant
    const invoiceStats = await db("invoices")
      .where("organization_id", organizationId)
      .select(
        db.raw("COUNT(id) as totalInvoices"),
        db.raw("COALESCE(SUM(total_amount), 0) as totalRevenue"),
        db.raw("COALESCE(SUM(paid_amount), 0) as totalPaid"),
        db.raw("COALESCE(SUM(balance_amount), 0) as totalOutstanding"),
        db.raw("COALESCE(SUM(CASE WHEN status = 'overdue' THEN balance_amount ELSE 0 END), 0) as totalOverdue"),
        db.raw("COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draftCount"),
        db.raw("COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paidCount"),
        db.raw("COALESCE(SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END), 0) as partialCount"),
        db.raw("COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelledCount")
      )
      .first();

    // 2. Count clients in tenant
    const clientCountResult = await db("clients")
      .where({ organization_id: organizationId, status: "active" })
      .count({ total: "id" })
      .first();
    const totalClients = clientCountResult ? parseInt(clientCountResult.total, 10) : 0;

    // 3. Count products in tenant
    const productCountResult = await db("products")
      .where({ organization_id: organizationId, status: "active" })
      .count({ total: "id" })
      .first();
    const totalProducts = productCountResult ? parseInt(productCountResult.total, 10) : 0;

    // 4. Recent Invoices in tenant
    const recentInvoices = await db("invoices")
      .join("clients", "invoices.client_id", "clients.id")
      .where("invoices.organization_id", organizationId)
      .select("invoices.id", "invoices.invoice_number", "invoices.status", "invoices.total_amount", "invoices.paid_amount", "invoices.issue_date", "clients.name as client_name")
      .orderBy("invoices.created_at", "desc")
      .limit(5);

    return {
      totalInvoices: parseInt(invoiceStats.totalInvoices || 0, 10),
      totalRevenue: parseFloat(invoiceStats.totalRevenue || 0),
      totalPaid: parseFloat(invoiceStats.totalPaid || 0),
      totalOutstanding: parseFloat(invoiceStats.totalOutstanding || 0),
      totalOverdue: parseFloat(invoiceStats.totalOverdue || 0),
      statusBreakdown: {
        draft: parseInt(invoiceStats.draftCount || 0, 10),
        paid: parseInt(invoiceStats.paidCount || 0, 10),
        partial: parseInt(invoiceStats.partialCount || 0, 10),
        cancelled: parseInt(invoiceStats.cancelledCount || 0, 10),
      },
      totalClients,
      totalProducts,
      recentInvoices,
    };
  }

  async getRevenueReport(organizationId, { fromDate, toDate, groupBy = "month" }) {
    let query = db("payments")
      .where("payments.organization_id", organizationId)
      .where("status", "completed");

    if (fromDate) query = query.where("paid_at", ">=", fromDate);
    if (toDate) query = query.where("paid_at", "<=", toDate);

    let groupByField = "DATE_FORMAT(paid_at, '%Y-%m')";
    if (groupBy === "day") {
      groupByField = "DATE_FORMAT(paid_at, '%Y-%m-%d')";
    } else if (groupBy === "year") {
      groupByField = "DATE_FORMAT(paid_at, '%Y')";
    }

    const data = await query
      .select(
        db.raw(`${groupByField} as period`),
        db.raw("COALESCE(SUM(amount), 0) as totalRevenue"),
        db.raw("COUNT(id) as totalTransactions")
      )
      .groupByRaw(groupByField)
      .orderByRaw("period ASC");

    return data.map((d) => ({
      period: d.period,
      totalRevenue: parseFloat(d.totalRevenue),
      totalTransactions: parseInt(d.totalTransactions, 10),
    }));
  }

  async getInvoiceReport(organizationId, { fromDate, toDate }) {
    let query = db("invoices").where("organization_id", organizationId);

    if (fromDate) query = query.where("issue_date", ">=", fromDate);
    if (toDate) query = query.where("issue_date", "<=", toDate);

    const summary = await query
      .select(
        "status",
        db.raw("COUNT(id) as count"),
        db.raw("COALESCE(SUM(total_amount), 0) as totalAmount"),
        db.raw("COALESCE(SUM(paid_amount), 0) as paidAmount"),
        db.raw("COALESCE(SUM(balance_amount), 0) as balanceAmount")
      )
      .groupBy("status");

    return summary.map((s) => ({
      status: s.status,
      count: parseInt(s.count, 10),
      totalAmount: parseFloat(s.totalAmount),
      paidAmount: parseFloat(s.paidAmount),
      balanceAmount: parseFloat(s.balanceAmount),
    }));
  }
}

module.exports = new ReportService();
