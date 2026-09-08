const db = require("../config/db");

class RoleRepository {
  async listRoles() {
    return db("roles").select("*").orderBy("id", "asc");
  }

  async findById(id) {
    return db("roles").where({ id }).first();
  }

  async findByName(name) {
    return db("roles").where({ name }).first();
  }

  async create(roleData, trx = null) {
    const query = (trx || db)("roles");
    const [id] = await query.insert({
      name: roleData.name,
      description: roleData.description || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async update(id, updateData, trx = null) {
    const query = (trx || db)("roles");
    await query.where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async listPermissions() {
    return db("permissions").select("*").orderBy("module", "asc").orderBy("name", "asc");
  }

  async getRolePermissions(roleId) {
    return db("role_permissions")
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .where("role_permissions.role_id", roleId)
      .select("permissions.id", "permissions.name", "permissions.module", "permissions.action", "permissions.description");
  }

  async assignPermissionToRole(roleId, permissionId, trx = null) {
    const query = (trx || db)("role_permissions");
    return query.insert({
      role_id: roleId,
      permission_id: permissionId,
      created_at: new Date(),
    });
  }

  async removePermissionFromRole(roleId, permissionId, trx = null) {
    const query = (trx || db)("role_permissions");
    return query.where({ role_id: roleId, permission_id: permissionId }).del();
  }
}

module.exports = new RoleRepository();
