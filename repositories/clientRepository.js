const db = require("../config/db");

class ClientRepository {
  async listClients({ page = 1, limit = 10, search, status }) {
    const offset = (page - 1) * limit;

    let baseQuery = db("clients");

    if (search) {
      baseQuery = baseQuery.where(function () {
        this.where("name", "like", `%${search}%`)
          .orWhere("email", "like", `%${search}%`)
          .orWhere("phone", "like", `%${search}%`)
          .orWhere("company_name", "like", `%${search}%`);
      });
    }

    if (status) {
      baseQuery = baseQuery.where("status", status);
    }

    const countResult = await baseQuery.clone().count({ total: "id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const clients = await baseQuery
      .clone()
      .select("*")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    return { clients, total };
  }

  async findById(id) {
    return db("clients").where({ id }).first();
  }

  async create(clientData, trx = null) {
    const query = (trx || db)("clients");
    const [id] = await query.insert({
      name: clientData.name,
      email: clientData.email || null,
      phone: clientData.phone || null,
      company_name: clientData.company_name || null,
      tax_number: clientData.tax_number || null,
      status: clientData.status || "active",
      notes: clientData.notes || null,
      created_by: clientData.created_by || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async update(id, updateData, trx = null) {
    const query = (trx || db)("clients");
    await query.where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async delete(id, trx = null) {
    const query = (trx || db)("clients");
    return query.where({ id }).del();
  }

  // Client Addresses
  async listAddresses(clientId) {
    return db("client_addresses").where({ client_id: clientId }).orderBy("is_default", "desc");
  }

  async findAddressById(addressId) {
    return db("client_addresses").where({ id: addressId }).first();
  }

  async createAddress(addressData, trx = null) {
    const query = (trx || db)("client_addresses");
    const [id] = await query.insert({
      client_id: addressData.client_id,
      address_type: addressData.address_type,
      address_line1: addressData.address_line1,
      address_line2: addressData.address_line2 || null,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country || "India",
      is_default: addressData.is_default || false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findAddressById(id);
  }

  async updateAddress(addressId, updateData, trx = null) {
    const query = (trx || db)("client_addresses");
    await query.where({ id: addressId }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findAddressById(addressId);
  }

  async deleteAddress(addressId, trx = null) {
    const query = (trx || db)("client_addresses");
    return query.where({ id: addressId }).del();
  }

  async resetDefaultAddresses(clientId, addressType, trx = null) {
    const query = (trx || db)("client_addresses");
    return query.where({ client_id: clientId, address_type: addressType }).update({ is_default: false });
  }

  async getClientInvoices(clientId, { limit = 10 } = {}) {
    return db("invoices")
      .where({ client_id: clientId })
      .select("id", "invoice_number", "status", "issue_date", "due_date", "total_amount", "paid_amount", "balance_amount")
      .orderBy("created_at", "desc")
      .limit(limit);
  }
}

module.exports = new ClientRepository();
