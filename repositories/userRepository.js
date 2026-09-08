const db = require("../config/db");

class UserRepository {
  async findById(id) {
    return db("users").where({ id }).first();
  }

  async findByEmail(email) {
    return db("users").where({ email: email.toLowerCase().trim() }).first();
  }

  async create(userData, trx = null) {
    const query = (trx || db)("users");
    const [id] = await query.insert({
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password_hash: userData.password_hash,
      phone: userData.phone || null,
      status: userData.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async update(id, updateData, trx = null) {
    const query = (trx || db)("users");
    await query.where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async updateLastLogin(id) {
    return db("users").where({ id }).update({
      last_login_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getUserRoles(userId) {
    return db("user_roles")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", userId)
      .select("roles.id", "roles.name", "roles.description");
  }

  async getUserPermissions(userId) {
    const permissions = await db("user_roles")
      .join("role_permissions", "user_roles.role_id", "role_permissions.role_id")
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .where("user_roles.user_id", userId)
      .select("permissions.id", "permissions.name", "permissions.module", "permissions.action")
      .distinct();

    return permissions.map((p) => p.name);
  }

  async assignRole(userId, roleId, trx = null) {
    const query = (trx || db)("user_roles");
    return query.insert({
      user_id: userId,
      role_id: roleId,
      created_at: new Date(),
    });
  }

  async removeRole(userId, roleId, trx = null) {
    const query = (trx || db)("user_roles");
    return query.where({ user_id: userId, role_id: roleId }).del();
  }

  async listUsers({ page = 1, limit = 10, search, status, roleId }) {
    const offset = (page - 1) * limit;

    let baseQuery = db("users");

    if (search) {
      baseQuery = baseQuery.where(function () {
        this.where("name", "like", `%${search}%`)
          .orWhere("email", "like", `%${search}%`)
          .orWhere("phone", "like", `%${search}%`);
      });
    }

    if (status) {
      baseQuery = baseQuery.where("status", status);
    }

    if (roleId) {
      baseQuery = baseQuery.whereIn("id", function () {
        this.select("user_id").from("user_roles").where("role_id", roleId);
      });
    }

    const countResult = await baseQuery.clone().count({ total: "id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const users = await baseQuery
      .clone()
      .select("id", "name", "email", "phone", "status", "last_login_at", "created_at", "updated_at")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    return { users, total };
  }
}

module.exports = new UserRepository();
