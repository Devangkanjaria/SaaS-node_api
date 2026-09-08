const { ForbiddenError, UnauthorizedError } = require("../errors/errorTypes");
const { ROLES } = require("../constants/roles");

/**
 * RBAC Permission Checker: Checks if req.user has the required permission
 * Admins bypass all individual permission requirements.
 */
const requirePermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // Admin has full access
    if (req.user.roles && req.user.roles.includes(ROLES.ADMIN)) {
      return next();
    }

    if (req.user.permissions && req.user.permissions.includes(permissionName)) {
      return next();
    }

    return next(
      new ForbiddenError(`Forbidden: You lack the '${permissionName}' permission to perform this action`)
    );
  };
};

/**
 * RBAC Role Checker: Checks if req.user has one of the required roles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const hasRole = req.user.roles && req.user.roles.some((r) => allowedRoles.includes(r));
    if (hasRole) {
      return next();
    }

    return next(new ForbiddenError("Forbidden: Insufficient role privilege"));
  };
};

module.exports = {
  requirePermission,
  requireRole,
};
