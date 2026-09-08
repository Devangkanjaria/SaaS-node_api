const db = require("../config/db");

class NotificationRepository {
  async createNotification(data, trx = null) {
    const query = (trx || db)("notifications");
    const [id] = await query.insert({
      organization_id: data.organization_id || null,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      channel: data.channel || "in_app",
      status: data.status || "pending",
      created_at: new Date(),
    });
    return this.findById(id);
  }

  async findById(id) {
    return db("notifications").where({ id }).first();
  }

  async listUserNotifications(organizationId, userId, { page = 1, limit = 20, status }) {
    const offset = (page - 1) * limit;
    let query = db("notifications").where({ user_id: userId, organization_id: organizationId });

    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count({ total: "id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const notifications = await query
      .clone()
      .select("*")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    return { notifications, total };
  }

  async markAsRead(id, userId) {
    return db("notifications").where({ id, user_id: userId }).update({
      status: "read",
      read_at: new Date(),
    });
  }

  async markAllAsRead(organizationId, userId) {
    return db("notifications").where({ user_id: userId, organization_id: organizationId, status: "pending" }).update({
      status: "read",
      read_at: new Date(),
    });
  }
}

module.exports = new NotificationRepository();
