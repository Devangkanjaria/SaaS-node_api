const roleService = require("../services/roleService");
const { sendSuccess, sendCreated } = require("../utils/responseHandler");

class RoleController {
  async listRoles(req, res, next) {
    try {
      const roles = await roleService.listRoles();
      return sendSuccess(res, "Roles fetched successfully", roles);
    } catch (err) {
      next(err);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      return sendSuccess(res, "Role fetched successfully", role);
    } catch (err) {
      next(err);
    }
  }

  async createRole(req, res, next) {
    try {
      const role = await roleService.createRole(req.body);
      return sendCreated(res, "Role created successfully", role);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req, res, next) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      return sendSuccess(res, "Role updated successfully", role);
    } catch (err) {
      next(err);
    }
  }

  async listPermissions(req, res, next) {
    try {
      const permissions = await roleService.listPermissions();
      return sendSuccess(res, "Permissions fetched successfully", permissions);
    } catch (err) {
      next(err);
    }
  }

  async assignPermission(req, res, next) {
    try {
      const role = await roleService.assignPermission(req.params.id, req.body.permissionId);
      return sendSuccess(res, "Permission assigned to role successfully", role);
    } catch (err) {
      next(err);
    }
  }

  async removePermission(req, res, next) {
    try {
      const role = await roleService.removePermission(req.params.id, req.params.permissionId);
      return sendSuccess(res, "Permission removed from role successfully", role);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RoleController();
