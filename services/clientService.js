const clientRepository = require("../repositories/clientRepository");
const planLimitService = require("./planLimitService");
const { NotFoundError } = require("../errors/errorTypes");

class ClientService {
  async listClients(organizationId, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = query.search || null;
    const status = query.status || null;

    const { clients, total } = await clientRepository.listClients(organizationId, { page, limit, search, status });

    return {
      clients,
      pagination: { page, limit, total },
    };
  }

  async getClientById(organizationId, id) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const addresses = await clientRepository.listAddresses(id);
    const recentInvoices = await clientRepository.getClientInvoices(organizationId, id, { limit: 5 });

    return {
      ...client,
      addresses,
      recentInvoices,
    };
  }

  async createClient(organizationId, clientData, userId) {
    await planLimitService.checkClientLimit(organizationId);

    return clientRepository.create({
      ...clientData,
      organization_id: organizationId,
      created_by: userId,
    });
  }

  async updateClient(organizationId, id, updateData) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return clientRepository.update(organizationId, id, updateData);
  }

  async updateClientStatus(organizationId, id, status) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return clientRepository.update(organizationId, id, { status });
  }

  async deleteClient(organizationId, id) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const invoices = await clientRepository.getClientInvoices(organizationId, id, { limit: 1 });
    if (invoices.length > 0) {
      await clientRepository.update(organizationId, id, { status: "inactive" });
      return { message: "Client has existing invoices. Status marked as inactive instead of deletion." };
    }

    await clientRepository.delete(organizationId, id);
    return { message: "Client deleted successfully" };
  }

  // Address operations
  async listAddresses(organizationId, clientId) {
    const client = await clientRepository.findById(organizationId, clientId);
    if (!client) {
      throw new NotFoundError("Client not found");
    }
    return clientRepository.listAddresses(clientId);
  }

  async createAddress(organizationId, clientId, addressData) {
    const client = await clientRepository.findById(organizationId, clientId);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    if (addressData.is_default) {
      await clientRepository.resetDefaultAddresses(clientId, addressData.address_type);
    }

    return clientRepository.createAddress({
      ...addressData,
      client_id: clientId,
    });
  }

  async updateAddress(organizationId, clientId, addressId, updateData) {
    const client = await clientRepository.findById(organizationId, clientId);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const address = await clientRepository.findAddressById(addressId);
    if (!address || String(address.client_id) !== String(clientId)) {
      throw new NotFoundError("Client address not found");
    }

    if (updateData.is_default) {
      const type = updateData.address_type || address.address_type;
      await clientRepository.resetDefaultAddresses(clientId, type);
    }

    return clientRepository.updateAddress(addressId, updateData);
  }

  async deleteAddress(organizationId, clientId, addressId) {
    const client = await clientRepository.findById(organizationId, clientId);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const address = await clientRepository.findAddressById(addressId);
    if (!address || String(address.client_id) !== String(clientId)) {
      throw new NotFoundError("Client address not found");
    }

    await clientRepository.deleteAddress(addressId);
    return { message: "Address deleted successfully" };
  }
}

module.exports = new ClientService();
