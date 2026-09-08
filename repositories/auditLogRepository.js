const db = require("../config/db");

class AuditLogRepository {
  async createLog({ organizationId, userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null }, trx = null) {
    const query = (trx || db)("audit_logs");
    return query.insert({
      organization_id: organizationId || null,
      user_id: userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      created_at: new Date(),
    });
  }

  async listLogs(organizationId, { page = 1, limit = 20, entityType, entityId, userId }) {
    const offset = (page - 1) * limit;
    let baseQuery = db("audit_logs")
      .leftJoin("users", "audit_logs.user_id", "users.id")
      .where("audit_logs.organization_id", organizationId);

    if (entityType) {
      baseQuery = baseQuery.where("audit_logs.entity_type", entityType);
    }
    if (entityId) {
      baseQuery = baseQuery.where("audit_logs.entity_id", entityId);
    }
    if (userId) {
      baseQuery = baseQuery.where("audit_logs.user_id", userId);
    }

    const countResult = await baseQuery.clone().count({ total: "audit_logs.id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const logs = await baseQuery
      .clone()
      .select("audit_logs.*", "users.name as user_name", "users.email as user_email")
      .orderBy("audit_logs.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return { logs, total };
  }
}

module.exports = new AuditLogRepository();
