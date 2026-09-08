const db = require("../config/db");
const { UnprocessableEntityError, ForbiddenError } = require("../errors/errorTypes");

class PlanLimitService {
  /**
   * Checks if an organization has reached the user limit for its current subscription plan.
   */
  async checkUserLimit(organizationId) {
    const sub = await this.getActiveSubscriptionWithPlan(organizationId);
    if (!sub || !sub.max_users) return; // Unlimited or trial fallback

    const countResult = await db("organization_members")
      .where({ organization_id: organizationId, status: "active" })
      .count({ total: "id" })
      .first();

    const currentCount = countResult ? parseInt(countResult.total, 10) : 0;
    if (currentCount >= sub.max_users) {
      throw new UnprocessableEntityError(
        `Your organization has reached the maximum allowed active users limit (${sub.max_users}) for the "${sub.plan_name}" plan. Please upgrade your plan.`,
        { currentCount, maxLimit: sub.max_users },
        "PLAN_LIMIT_REACHED"
      );
    }
  }

  /**
   * Checks if an organization has reached the client limit for its current subscription plan.
   */
  async checkClientLimit(organizationId) {
    const sub = await this.getActiveSubscriptionWithPlan(organizationId);
    if (!sub || !sub.max_clients) return;

    const countResult = await db("clients")
      .where({ organization_id: organizationId, status: "active" })
      .count({ total: "id" })
      .first();

    const currentCount = countResult ? parseInt(countResult.total, 10) : 0;
    if (currentCount >= sub.max_clients) {
      throw new UnprocessableEntityError(
        `Your organization has reached the maximum allowed clients limit (${sub.max_clients}) for the "${sub.plan_name}" plan. Please upgrade your plan.`,
        { currentCount, maxLimit: sub.max_clients },
        "PLAN_LIMIT_REACHED"
      );
    }
  }

  /**
   * Checks if an organization has reached the product limit for its current subscription plan.
   */
  async checkProductLimit(organizationId) {
    const sub = await this.getActiveSubscriptionWithPlan(organizationId);
    if (!sub || !sub.max_products) return;

    const countResult = await db("products")
      .where({ organization_id: organizationId, status: "active" })
      .count({ total: "id" })
      .first();

    const currentCount = countResult ? parseInt(countResult.total, 10) : 0;
    if (currentCount >= sub.max_products) {
      throw new UnprocessableEntityError(
        `Your organization has reached the maximum allowed products limit (${sub.max_products}) for the "${sub.plan_name}" plan. Please upgrade your plan.`,
        { currentCount, maxLimit: sub.max_products },
        "PLAN_LIMIT_REACHED"
      );
    }
  }

  /**
   * Checks if an organization has reached the invoice limit for its current subscription plan.
   */
  async checkInvoiceLimit(organizationId) {
    const sub = await this.getActiveSubscriptionWithPlan(organizationId);
    if (!sub || !sub.max_invoices) return;

    const countResult = await db("invoices")
      .where({ organization_id: organizationId })
      .count({ total: "id" })
      .first();

    const currentCount = countResult ? parseInt(countResult.total, 10) : 0;
    if (currentCount >= sub.max_invoices) {
      throw new UnprocessableEntityError(
        `Your organization has reached the maximum allowed invoices limit (${sub.max_invoices}) for the "${sub.plan_name}" plan. Please upgrade your plan.`,
        { currentCount, maxLimit: sub.max_invoices },
        "PLAN_LIMIT_REACHED"
      );
    }
  }

  /**
   * Helper to fetch active subscription with joined plan details
   */
  async getActiveSubscriptionWithPlan(organizationId) {
    return db("subscriptions")
      .join("plans", "subscriptions.plan_id", "plans.id")
      .where("subscriptions.organization_id", organizationId)
      .whereIn("subscriptions.status", ["active", "trial"])
      .select(
        "subscriptions.*",
        "plans.name as plan_name",
        "plans.code as plan_code",
        "plans.max_users",
        "plans.max_clients",
        "plans.max_products",
        "plans.max_invoices"
      )
      .orderBy("subscriptions.created_at", "desc")
      .first();
  }
}

module.exports = new PlanLimitService();
