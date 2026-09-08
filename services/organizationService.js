const db = require("../config/db");
const organizationRepository = require("../repositories/organizationRepository");
const userRepository = require("../repositories/userRepository");
const roleRepository = require("../repositories/roleRepository");
const planLimitService = require("./planLimitService");
const { NotFoundError, ConflictError, BadRequestError } = require("../errors/errorTypes");
const { ROLES } = require("../constants/roles");

class OrganizationService {
  async getUserOrganizations(userId) {
    return organizationRepository.getUserOrganizations(userId);
  }

  async getCurrentOrganization(organizationId) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError("Organization not found");
    }

    const subscription = await organizationRepository.getActiveSubscription(organizationId);
    return {
      ...org,
      subscription: subscription || { status: "none", plan_name: "No Active Plan" },
    };
  }

  async createOrganization(userId, orgData) {
    // Generate slug if not provided
    let slug = orgData.slug;
    if (!slug) {
      slug = orgData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const existingSlug = await organizationRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return await db.transaction(async (trx) => {
      // 1. Create Organization
      const org = await organizationRepository.create(
        {
          ...orgData,
          slug,
        },
        trx
      );

      // 2. Find or fallback to Admin role
      let adminRole = await roleRepository.findByName(ROLES.ADMIN);
      if (!adminRole) {
        adminRole = await roleRepository.create({ name: ROLES.ADMIN, description: "Organization Administrator" }, trx);
      }

      // 3. Add creating user as Admin member
      await organizationRepository.addMember(
        {
          organizationId: org.id,
          userId,
          roleId: adminRole.id,
          status: "active",
        },
        trx
      );

      // 4. Assign default starter/trial plan if plans exist
      const starterPlan = await organizationRepository.getPlanByCode("starter") || (await organizationRepository.listPlans())[0];
      if (starterPlan) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

        await organizationRepository.createSubscription(
          {
            organization_id: org.id,
            plan_id: starterPlan.id,
            status: "trial",
            starts_at: new Date(),
            trial_ends_at: trialEndDate,
          },
          trx
        );
      }

      return org;
    });
  }

  async updateOrganization(organizationId, updateData) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError("Organization not found");
    }
    return organizationRepository.update(organizationId, updateData);
  }

  async listMembers(organizationId) {
    return organizationRepository.listMembers(organizationId);
  }

  async addMember(organizationId, { userId, email, roleId }) {
    await planLimitService.checkUserLimit(organizationId);

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundError(`User with email '${email}' not found. They must register first.`);
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      throw new BadRequestError("User ID or email is required");
    }

    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const existingMember = await organizationRepository.getMember(organizationId, targetUserId);
    if (existingMember) {
      throw new ConflictError("User is already a member of this organization");
    }

    return organizationRepository.addMember({
      organizationId,
      userId: targetUserId,
      roleId,
      status: "active",
    });
  }

  async updateMember(organizationId, userId, updateData) {
    const member = await organizationRepository.getMember(organizationId, userId);
    if (!member) {
      throw new NotFoundError("Member not found in this organization");
    }

    return organizationRepository.updateMember(organizationId, userId, updateData);
  }

  async removeMember(organizationId, userId, currentUserId) {
    if (String(userId) === String(currentUserId)) {
      throw new BadRequestError("You cannot remove yourself from the organization");
    }

    const member = await organizationRepository.getMember(organizationId, userId);
    if (!member) {
      throw new NotFoundError("Member not found in this organization");
    }

    await organizationRepository.removeMember(organizationId, userId);
    return { message: "Member removed from organization successfully" };
  }

  // SaaS Plans & Subscriptions
  async listPlans() {
    return organizationRepository.listPlans();
  }

  async getSubscription(organizationId) {
    const sub = await organizationRepository.getActiveSubscription(organizationId);
    if (!sub) {
      return { status: "none", message: "No active subscription" };
    }
    return sub;
  }
}

module.exports = new OrganizationService();
