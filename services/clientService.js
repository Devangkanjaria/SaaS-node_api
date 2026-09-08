const clientRepository = require("../repositories/clientRepository");
const { NotFoundError, BadRequestError } = require("../errors/errorTypes");

class ClientService {
  async listClients(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = query.search || null;
    const status = query.status || null;

    const { clients, total } = await clientRepository.listClients({ page, limit, search, status });

    return {
      clients,
      pagination: { page, limit, total },
    };
  }

  async getClientById(id) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    const addresses = await clientRepository.listAddresses(id);
    const recentInvoices = await clientRepository.getClientInvoices(id, { limit: 5 });

    return {
      ...client,
      addresses,
      recentInvoices,
    };
  }

  async createClient(clientData, userId) {
    return clientRepository.create({
      ...clientData,
      created_by: userId,
    });
  }

  async updateClient(id, updateData) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return clientRepository.update(id, updateData);
  }

  async updateClientStatus(id, status) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    return clientRepository.update(id, { status });
  }

  async deleteClient(id) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw new NotFoundError("Client not found");
    }

    // Check if client has invoices
    const invoices = await clientRepository.getClientInvoices(id, { limit: 1 });
    if (invoices.length > 0) {
      // Soft deactivate instead of hard delete
      await clientRepository.update(id, { status: "inactive" });
      return { message: "Client has existing invoices. Status marked as inactive instead of deletion." };
    }

    await clientRepository.delete(id);
    return { message: "Client deleted successfully" };
  }

  // Address operations
  async listAddresses(clientId) {
    const client = await clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError("Client not found");
    }
    return clientRepository.listAddresses(clientId);
  }

  async createAddress(clientId, addressData) {
    const client = await clientRepository.findById(clientId);
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

  async updateAddress(clientId, addressId, updateData) {
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

  async deleteAddress(clientId, addressId) {
    const address = await clientRepository.findAddressById(addressId);
    if (!address || String(address.client_id) !== String(clientId)) {
      throw new NotFoundError("Client address not found");
    }

    await clientRepository.deleteAddress(addressId);
    return { message: "Address deleted successfully" };
  }
}

module.exports = new ClientService();
