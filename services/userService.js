const userRepository = require("../repositories/userRepository");
const roleRepository = require("../repositories/roleRepository");
const { hashPassword } = require("../utils/passwordUtils");
const { NotFoundError, ConflictError, BadRequestError } = require("../errors/errorTypes");

class UserService {
  async listUsers(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = query.search || null;
    const status = query.status || null;
    const roleId = query.roleId ? parseInt(query.roleId, 10) : null;

    const { users, total } = await userRepository.listUsers({ page, limit, search, status, roleId });

    // Attach roles to user list
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await userRepository.getUserRoles(user.id);
        return { ...user, roles };
      })
    );

    return {
      users: usersWithRoles,
      pagination: { page, limit, total },
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const roles = await userRepository.getUserRoles(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles,
      permissions,
    };
  }

  async createUser({ name, email, password, phone, roleId, status }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const password_hash = await hashPassword(password);
    const user = await userRepository.create({
      name,
      email,
      password_hash,
      phone,
      status: status || "active",
    });

    if (roleId) {
      const role = await roleRepository.findById(roleId);
      if (role) {
        await userRepository.assignRole(user.id, roleId);
      }
    }

    return this.getUserById(user.id);
  }

  async updateUser(id, updateData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await userRepository.findByEmail(updateData.email);
      if (existing) {
        throw new ConflictError("Email already in use");
      }
    }

    const fieldsToUpdate = {};
    if (updateData.name) fieldsToUpdate.name = updateData.name;
    if (updateData.email) fieldsToUpdate.email = updateData.email;
    if (updateData.phone !== undefined) fieldsToUpdate.phone = updateData.phone;
    if (updateData.password) {
      fieldsToUpdate.password_hash = await hashPassword(updateData.password);
    }

    if (Object.keys(fieldsToUpdate).length > 0) {
      await userRepository.update(id, fieldsToUpdate);
    }

    if (updateData.roleId) {
      const currentRoles = await userRepository.getUserRoles(id);
      for (const r of currentRoles) {
        await userRepository.removeRole(id, r.id);
      }
      await userRepository.assignRole(id, updateData.roleId);
    }

    return this.getUserById(id);
  }

  async updateUserStatus(id, status) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await userRepository.update(id, { status });
    return this.getUserById(id);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    // Prefer soft status update to inactive/blocked to preserve relational integrity
    await userRepository.update(id, { status: "inactive" });
    return { message: "User marked as inactive successfully" };
  }
}

module.exports = new UserService();
