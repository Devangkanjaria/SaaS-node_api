module.exports = {
  ROLES: {
    ADMIN: "Admin",
    ACCOUNTANT: "Accountant",
    STAFF: "Staff",
  },
  PERMISSIONS: {
    // Auth & Users
    USER_VIEW: "user.view",
    USER_CREATE: "user.create",
    USER_UPDATE: "user.update",
    USER_DELETE: "user.delete",

    // Roles & Permissions
    ROLE_VIEW: "role.view",
    ROLE_MANAGE: "role.manage",

    // Clients
    CLIENT_VIEW: "client.view",
    CLIENT_CREATE: "client.create",
    CLIENT_UPDATE: "client.update",
    CLIENT_DELETE: "client.delete",

    // Products & Inventory
    PRODUCT_VIEW: "product.view",
    PRODUCT_CREATE: "product.create",
    PRODUCT_UPDATE: "product.update",
    PRODUCT_DELETE: "product.delete",
    INVENTORY_MANAGE: "inventory.manage",

    // Invoices
    INVOICE_VIEW: "invoice.view",
    INVOICE_CREATE: "invoice.create",
    INVOICE_UPDATE: "invoice.update",
    INVOICE_DELETE: "invoice.delete",
    INVOICE_STATUS_CHANGE: "invoice.status_change",

    // Payments
    PAYMENT_VIEW: "payment.view",
    PAYMENT_CREATE: "payment.create",
    PAYMENT_REFUND: "payment.refund",

    // Taxes & Discounts
    TAX_MANAGE: "tax.manage",
    DISCOUNT_MANAGE: "discount.manage",

    // Reports & Dashboard
    DASHBOARD_VIEW: "dashboard.view",
    REPORT_VIEW: "report.view",
    AUDIT_VIEW: "audit.view",
  },
};
