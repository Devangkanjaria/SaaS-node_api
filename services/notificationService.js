const notificationRepository = require("../repositories/notificationRepository");

class NotificationService {
  async notify({ organizationId, userId, type, title, message, entityType, entityId, channel = "in_app" }, trx = null) {
    try {
      return await notificationRepository.createNotification(
        {
          organization_id: organizationId,
          user_id: userId,
          type,
          title,
          message,
          entity_type: entityType,
          entity_id: entityId,
          channel,
          status: "pending",
        },
        trx
      );
    } catch (err) {
      console.error("[NOTIFICATION ERROR]", err.message);
    }
  }

  async listUserNotifications(organizationId, userId, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    return notificationRepository.listUserNotifications(organizationId, userId, { page, limit, status: query.status });
  }

  async markAsRead(id, userId) {
    await notificationRepository.markAsRead(id, userId);
    return { message: "Notification marked as read" };
  }

  async markAllAsRead(organizationId, userId) {
    await notificationRepository.markAllAsRead(organizationId, userId);
    return { message: "All notifications marked as read" };
  }
}

module.exports = new NotificationService();
