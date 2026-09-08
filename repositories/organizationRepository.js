const db = require("../config/db");

class OrganizationRepository {
  async findById(id) {
    return db("organizations").where({ id }).first();
  }

  async findBySlug(slug) {
    return db("organizations").where({ slug }).first();
  }

  async create(orgData, trx = null) {
    const query = (trx || db)("organizations");
    const [id] = await query.insert({
      name: orgData.name,
      slug: orgData.slug,
      email: orgData.email,
      phone: orgData.phone || null,
      logo_url: orgData.logo_url || null,
      status: orgData.status || "active",
      timezone: orgData.timezone || "Asia/Kolkata",
      currency: orgData.currency || "INR",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async update(id, updateData, trx = null) {
    const query = (trx || db)("organizations");
    await query.where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  // Memberships
  async getUserOrganizations(userId) {
    return db("organization_members")
      .join("organizations", "organization_members.organization_id", "organizations.id")
      .join("roles", "organization_members.role_id", "roles.id")
      .where("organization_members.user_id", userId)
      .where("organization_members.status", "active")
      .select(
        "organizations.*",
        "roles.id as role_id",
        "roles.name as role_name",
        "organization_members.status as member_status",
        "organization_members.joined_at"
      );
  }

  async getMember(organizationId, userId) {
    return db("organization_members")
      .join("roles", "organization_members.role_id", "roles.id")
      .where({
        "organization_members.organization_id": organizationId,
        "organization_members.user_id": userId,
      })
      .select(
        "organization_members.*",
        "roles.name as role_name"
      )
      .first();
  }

  async getMemberPermissions(organizationId, userId) {
    const member = await this.getMember(organizationId, userId);
    if (!member) return [];

    const permissions = await db("role_permissions")
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .where("role_permissions.role_id", member.role_id)
      .select("permissions.name")
      .distinct();

    return permissions.map((p) => p.name);
  }

  async addMember({ organizationId, userId, roleId, status = "active" }, trx = null) {
    const query = (trx || db)("organization_members");
    const [id] = await query.insert({
      organization_id: organizationId,
      user_id: userId,
      role_id: roleId,
      status,
      joined_at: status === "active" ? new Date() : null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return query.where({ id }).first();
  }

  async updateMember(organizationId, userId, updateData, trx = null) {
    const query = (trx || db)("organization_members");
    await query.where({ organization_id: organizationId, user_id: userId }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.getMember(organizationId, userId);
  }

  async removeMember(organizationId, userId, trx = null) {
    const query = (trx || db)("organization_members");
    return query.where({ organization_id: organizationId, user_id: userId }).del();
  }

  async listMembers(organizationId) {
    return db("organization_members")
      .join("users", "organization_members.user_id", "users.id")
      .join("roles", "organization_members.role_id", "roles.id")
      .where("organization_members.organization_id", organizationId)
      .select(
        "organization_members.id as membership_id",
        "users.id as user_id",
        "users.name as user_name",
        "users.email as user_email",
        "users.phone as user_phone",
        "roles.id as role_id",
        "roles.name as role_name",
        "organization_members.status as member_status",
        "organization_members.joined_at",
        "organization_members.created_at"
      )
      .orderBy("organization_members.created_at", "asc");
  }

  // Plans & Subscriptions
  async listPlans() {
    return db("plans").where({ status: "active" }).orderBy("price", "asc");
  }

  async getPlanById(id) {
    return db("plans").where({ id }).first();
  }

  async getPlanByCode(code) {
    return db("plans").where({ code }).first();
  }

  async getActiveSubscription(organizationId) {
    return db("subscriptions")
      .join("plans", "subscriptions.plan_id", "plans.id")
      .where("subscriptions.organization_id", organizationId)
      .whereIn("subscriptions.status", ["active", "trial"])
      .select("subscriptions.*", "plans.name as plan_name", "plans.code as plan_code", "plans.max_users", "plans.max_invoices", "plans.max_clients")
      .orderBy("subscriptions.created_at", "desc")
      .first();
  }

  async createSubscription(subData, trx = null) {
    const query = (trx || db)("subscriptions");
    const [id] = await query.insert({
      organization_id: subData.organization_id,
      plan_id: subData.plan_id,
      status: subData.status || "trial",
      starts_at: subData.starts_at || new Date(),
      ends_at: subData.ends_at || null,
      trial_ends_at: subData.trial_ends_at || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return query.where({ id }).first();
  }
}

module.exports = new OrganizationRepository();
