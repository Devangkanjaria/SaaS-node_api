module.exports = {
  INVOICE_STATUS: {
    DRAFT: "draft",
    SENT: "sent",
    PARTIAL: "partial",
    PAID: "paid",
    OVERDUE: "overdue",
    CANCELLED: "cancelled",
  },
  PAYMENT_STATUS: {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
    CANCELLED: "cancelled",
  },
  PAYMENT_METHODS: {
    CASH: "cash",
    BANK_TRANSFER: "bank_transfer",
    UPI: "upi",
    CARD: "card",
    CHEQUE: "cheque",
    GATEWAY: "gateway",
    OTHER: "other",
  },
  USER_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    BLOCKED: "blocked",
  },
  ENTITY_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
  },
  DISCOUNT_TYPES: {
    PERCENTAGE: "percentage",
    FIXED: "fixed",
  },
  ADDRESS_TYPES: {
    BILLING: "billing",
    SHIPPING: "shipping",
  },
  NOTIFICATION_CHANNELS: {
    IN_APP: "in_app",
    EMAIL: "email",
    WHATSAPP: "whatsapp",
    SMS: "sms",
  },
};
