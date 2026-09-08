const userRepository = require("../repositories/userRepository");
const roleRepository = require("../repositories/roleRepository");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwtUtils");
const { ConflictError, UnauthorizedError, BadRequestError } = require("../errors/errorTypes");
const { ROLES } = require("../constants/roles");

class AuthService {
  async register({ name, email, password, phone }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const password_hash = await hashPassword(password);
    const user = await userRepository.create({
      name,
      email,
      password_hash,
      phone,
      status: "active",
    });

    // Assign default role (Staff if exists, otherwise first role or Admin)
    const staffRole = await roleRepository.findByName(ROLES.STAFF) || await roleRepository.findByName(ROLES.ADMIN);
    if (staffRole) {
      await userRepository.assignRole(user.id, staffRole.id);
    }

    const roles = await userRepository.getUserRoles(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    const payload = { id: user.id, email: user.email, roles: roles.map((r) => r.name) };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles,
        permissions,
      },
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.status === "blocked") {
      throw new UnauthorizedError("Your account has been blocked. Please contact admin.");
    }
    if (user.status === "inactive") {
      throw new UnauthorizedError("Your account is inactive.");
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    await userRepository.updateLastLogin(user.id);

    const roles = await userRepository.getUserRoles(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    const payload = { id: user.id, email: user.email, roles: roles.map((r) => r.name) };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles,
        permissions,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await userRepository.findById(decoded.id);
      if (!user || user.status !== "active") {
        throw new UnauthorizedError("User is no longer active or valid");
      }

      const roles = await userRepository.getUserRoles(user.id);
      const payload = { id: user.id, email: user.email, roles: roles.map((r) => r.name) };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
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
      roles,
      permissions,
    };
  }
}

module.exports = new AuthService();
