const clientService = require("../services/clientService");
const { sendSuccess, sendCreated, sendPaginated } = require("../utils/responseHandler");

class ClientController {
  async listClients(req, res, next) {
    try {
      const { clients, pagination } = await clientService.listClients(req.organizationId, req.query);
      return sendPaginated(res, "Clients fetched successfully", clients, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getClientById(req, res, next) {
    try {
      const client = await clientService.getClientById(req.organizationId, req.params.id);
      return sendSuccess(res, "Client fetched successfully", client);
    } catch (err) {
      next(err);
    }
  }

  async createClient(req, res, next) {
    try {
      const client = await clientService.createClient(req.organizationId, req.body, req.user.id);
      return sendCreated(res, "Client created successfully", client);
    } catch (err) {
      next(err);
    }
  }

  async updateClient(req, res, next) {
    try {
      const client = await clientService.updateClient(req.organizationId, req.params.id, req.body);
      return sendSuccess(res, "Client updated successfully", client);
    } catch (err) {
      next(err);
    }
  }

  async updateClientStatus(req, res, next) {
    try {
      const client = await clientService.updateClientStatus(req.organizationId, req.params.id, req.body.status);
      return sendSuccess(res, "Client status updated successfully", client);
    } catch (err) {
      next(err);
    }
  }

  async deleteClient(req, res, next) {
    try {
      const result = await clientService.deleteClient(req.organizationId, req.params.id);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }

  // Address Controllers
  async listAddresses(req, res, next) {
    try {
      const addresses = await clientService.listAddresses(req.organizationId, req.params.clientId);
      return sendSuccess(res, "Addresses fetched successfully", addresses);
    } catch (err) {
      next(err);
    }
  }

  async createAddress(req, res, next) {
    try {
      const address = await clientService.createAddress(req.organizationId, req.params.clientId, req.body);
      return sendCreated(res, "Address created successfully", address);
    } catch (err) {
      next(err);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const address = await clientService.updateAddress(req.organizationId, req.params.clientId, req.params.addressId, req.body);
      return sendSuccess(res, "Address updated successfully", address);
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const result = await clientService.deleteAddress(req.organizationId, req.params.clientId, req.params.addressId);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ClientController();
