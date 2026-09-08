const authService = require("../services/authService");
const { sendSuccess, sendCreated } = require("../utils/responseHandler");

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendCreated(res, "User registered successfully", result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, "Login successful", result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      // In stateless JWT, client deletes tokens. Could add blacklist if needed.
      return sendSuccess(res, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return sendSuccess(res, "Token refreshed successfully", result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, "Current user profile fetched", user);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      // Stub ready for email integration
      return sendSuccess(res, "If this email is registered, a password reset link has been sent.");
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      // Stub ready for reset token verification
      return sendSuccess(res, "Password has been successfully reset.");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
