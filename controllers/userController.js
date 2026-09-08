const userService = require("../services/userService");
const { sendSuccess, sendCreated, sendPaginated } = require("../utils/responseHandler");

class UserController {
  async listUsers(req, res, next) {
    try {
      const { users, pagination } = await userService.listUsers(req.query);
      return sendPaginated(res, "Users fetched successfully", users, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return sendSuccess(res, "User fetched successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      return sendCreated(res, "User created successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return sendSuccess(res, "User updated successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const user = await userService.updateUserStatus(req.params.id, req.body.status);
      return sendSuccess(res, "User status updated successfully", user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
