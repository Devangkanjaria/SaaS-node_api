const organizationService = require("../services/organizationService");
const { sendSuccess, sendCreated } = require("../utils/responseHandler");

class OrganizationController {
  async getUserOrganizations(req, res, next) {
    try {
      const orgs = await organizationService.getUserOrganizations(req.user.id);
      return sendSuccess(res, "User organizations fetched successfully", orgs);
    } catch (err) {
      next(err);
    }
  }

  async getCurrentOrganization(req, res, next) {
    try {
      const org = await organizationService.getCurrentOrganization(req.organizationId);
      return sendSuccess(res, "Current organization fetched successfully", org);
    } catch (err) {
      next(err);
    }
  }

  async createOrganization(req, res, next) {
    try {
      const org = await organizationService.createOrganization(req.user.id, req.body);
      return sendCreated(res, "Organization created successfully", org);
    } catch (err) {
      next(err);
    }
  }

  async updateCurrentOrganization(req, res, next) {
    try {
      const org = await organizationService.updateOrganization(req.organizationId, req.body);
      return sendSuccess(res, "Organization updated successfully", org);
    } catch (err) {
      next(err);
    }
  }

  // Members
  async listMembers(req, res, next) {
    try {
      const members = await organizationService.listMembers(req.organizationId);
      return sendSuccess(res, "Organization members fetched successfully", members);
    } catch (err) {
      next(err);
    }
  }

  async addMember(req, res, next) {
    try {
      const member = await organizationService.addMember(req.organizationId, req.body);
      return sendCreated(res, "Member added to organization successfully", member);
    } catch (err) {
      next(err);
    }
  }

  async updateMember(req, res, next) {
    try {
      const member = await organizationService.updateMember(req.organizationId, req.params.userId, req.body);
      return sendSuccess(res, "Member updated successfully", member);
    } catch (err) {
      next(err);
    }
  }

  async removeMember(req, res, next) {
    try {
      const result = await organizationService.removeMember(req.organizationId, req.params.userId, req.user.id);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }

  // Plans & Subscriptions
  async listPlans(req, res, next) {
    try {
      const plans = await organizationService.listPlans();
      return sendSuccess(res, "Plans fetched successfully", plans);
    } catch (err) {
      next(err);
    }
  }

  async getSubscription(req, res, next) {
    try {
      const sub = await organizationService.getSubscription(req.organizationId);
      return sendSuccess(res, "Active subscription fetched successfully", sub);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrganizationController();
