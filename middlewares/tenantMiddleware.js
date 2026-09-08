const organizationRepository = require("../repositories/organizationRepository");
const { ForbiddenError, UnauthorizedError, NotFoundError } = require("../errors/errorTypes");

/**
 * Tenant Context Middleware
 * Resolves active organization, ensures authenticated user is an active member,
 * and sets req.organizationId, req.organization, req.userRole, req.permissions.
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    // 1. Resolve requested organization ID (Header -> Query -> Fallback to User's default)
    let orgId = req.headers["x-organization-id"] || req.query.organization_id || null;

    if (!orgId) {
      const userOrgs = await organizationRepository.getUserOrganizations(req.user.id);
      if (userOrgs.length === 0) {
        return next(
          new ForbiddenError("No active organization found for this user. Please create or join an organization.")
        );
      }
      orgId = userOrgs[0].id;
    } else {
      orgId = parseInt(orgId, 10);
    }

    // 2. Validate user membership in this organization
    const member = await organizationRepository.getMember(orgId, req.user.id);
    if (!member || member.status !== "active") {
      return next(new ForbiddenError("You are not an active member of this organization"));
    }

    // 3. Validate Organization Status
    const org = await organizationRepository.findById(orgId);
    if (!org) {
      return next(new NotFoundError("Organization not found"));
    }
    if (org.status === "suspended") {
      return next(new ForbiddenError("This organization has been suspended. Please contact billing/support."));
    }

    // 4. Resolve Member's Permissions for this specific organization
    const permissions = await organizationRepository.getMemberPermissions(orgId, req.user.id);

    // 5. Attach tenant context to request
    req.organizationId = org.id;
    req.organization = org;
    req.userRole = member.role_name;
    req.user.roles = [member.role_name]; // Tenant-scoped role
    req.user.permissions = permissions; // Tenant-scoped permissions

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = tenantMiddleware;
