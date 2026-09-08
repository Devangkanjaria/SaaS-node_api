const { verifyAccessToken } = require("../utils/jwtUtils");
const userRepository = require("../repositories/userRepository");
const { UnauthorizedError } = require("../errors/errorTypes");

/**
 * Authentication Middleware: Validates JWT Bearer token and attaches user
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError("Authenticated user does not exist");
    }

    if (user.status !== "active") {
      throw new UnauthorizedError(`Account is ${user.status}. Access denied.`);
    }

    const roles = await userRepository.getUserRoles(user.id);
    const permissions = await userRepository.getUserPermissions(user.id);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roles: roles.map((r) => r.name),
      permissions,
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticateJWT;
