const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const tenantMiddleware = require("../middlewares/tenantMiddleware");
const { requireRole } = require("../middlewares/rbacMiddleware");
const { ROLES } = require("../constants/roles");
const {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberSchema,
  memberIdParamSchema,
} = require("../validators/organizationValidator");

// Public plans route
router.get("/plans", organizationController.listPlans);

// Authenticated routes
router.use(authenticateJWT);

// List user's organizations
router.get("/", organizationController.getUserOrganizations);

// Create new organization (user automatically becomes owner/Admin)
router.post("/", validate(createOrganizationSchema), organizationController.createOrganization);

// Current Organization management (requires tenant context)
router.get("/current", tenantMiddleware, organizationController.getCurrentOrganization);
router.put("/current", tenantMiddleware, requireRole(ROLES.ADMIN), validate(updateOrganizationSchema), organizationController.updateCurrentOrganization);
router.get("/current/subscription", tenantMiddleware, organizationController.getSubscription);

// Organization Members
router.get("/current/members", tenantMiddleware, organizationController.listMembers);
router.post("/current/members", tenantMiddleware, requireRole(ROLES.ADMIN), validate(addMemberSchema), organizationController.addMember);
router.patch("/current/members/:userId", tenantMiddleware, requireRole(ROLES.ADMIN), validate(updateMemberSchema), organizationController.updateMember);
router.delete("/current/members/:userId", tenantMiddleware, requireRole(ROLES.ADMIN), validate(memberIdParamSchema), organizationController.removeMember);

module.exports = router;
