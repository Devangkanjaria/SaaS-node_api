const auditLogRepository = require("../repositories/auditLogRepository");

class AuditService {
  async logAction(req, { action, entityType, entityId, oldValues = null, newValues = null }, trx = null) {
    try {
      const userId = req && req.user ? req.user.id : null;
      const ipAddress = req ? req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress : null;
      const userAgent = req ? req.headers["user-agent"] : null;

      // Sanitize any sensitive keys if present in values
      const sanitize = (obj) => {
        if (!obj || typeof obj !== "object") return obj;
        const cloned = { ...obj };
        delete cloned.password;
        delete cloned.password_hash;
        delete cloned.refreshToken;
        delete cloned.token;
        return cloned;
      };

      await auditLogRepository.createLog(
        {
          userId,
          action,
          entityType,
          entityId,
          oldValues: sanitize(oldValues),
          newValues: sanitize(newValues),
          ipAddress: String(ipAddress || "").slice(0, 45),
          userAgent: String(userAgent || "").slice(0, 500),
        },
        trx
      );
    } catch (err) {
      console.error("[AUDIT LOG ERROR]", err.message);
    }
  }

  async listLogs(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    return auditLogRepository.listLogs({
      page,
      limit,
      entityType: query.entityType,
      entityId: query.entityId,
      userId: query.userId,
    });
  }
}

module.exports = new AuditService();
