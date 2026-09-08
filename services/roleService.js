const roleRepository = require("../repositories/roleRepository");
const { NotFoundError, ConflictError } = require("../errors/errorTypes");

class RoleService {
  async listRoles() {
    return roleRepository.listRoles();
  }

  async getRoleById(id) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    const permissions = await roleRepository.getRolePermissions(id);
    return { ...role, permissions };
  }

  async createRole({ name, description }) {
    const existing = await roleRepository.findByName(name);
    if (existing) {
      throw new ConflictError("A role with this name already exists");
    }
    return roleRepository.create({ name, description });
  }

  async updateRole(id, { name, description }) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    if (name && name !== role.name) {
      const existing = await roleRepository.findByName(name);
      if (existing) {
        throw new ConflictError("A role with this name already exists");
      }
    }

    return roleRepository.update(id, { name, description });
  }

  async listPermissions() {
    return roleRepository.listPermissions();
  }

  async assignPermission(roleId, permissionId) {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const currentPerms = await roleRepository.getRolePermissions(roleId);
    if (currentPerms.some((p) => p.id === permissionId)) {
      throw new ConflictError("Permission is already assigned to this role");
    }

    await roleRepository.assignPermissionToRole(roleId, permissionId);
    return this.getRoleById(roleId);
  }

  async removePermission(roleId, permissionId) {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    await roleRepository.removePermissionFromRole(roleId, permissionId);
    return this.getRoleById(roleId);
  }
}

module.exports = new RoleService();
