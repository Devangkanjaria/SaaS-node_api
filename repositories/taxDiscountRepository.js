const db = require("../config/db");

class TaxRepository {
  async listTaxes(organizationId) {
    return db("taxes").where({ organization_id: organizationId }).orderBy("rate", "asc");
  }

  async findById(organizationId, id) {
    return db("taxes").where({ id, organization_id: organizationId }).first();
  }

  async findByCode(organizationId, code) {
    return db("taxes").where({ code, organization_id: organizationId }).first();
  }

  async create(taxData) {
    const [id] = await db("taxes").insert({
      organization_id: taxData.organization_id,
      name: taxData.name,
      code: taxData.code.toUpperCase(),
      rate: taxData.rate,
      description: taxData.description || null,
      status: taxData.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(taxData.organization_id, id);
  }

  async update(organizationId, id, updateData) {
    await db("taxes").where({ id, organization_id: organizationId }).update({
      ...updateData,
      ...(updateData.code && { code: updateData.code.toUpperCase() }),
      updated_at: new Date(),
    });
    return this.findById(organizationId, id);
  }
}

class DiscountRepository {
  async listDiscounts(organizationId) {
    return db("discounts").where({ organization_id: organizationId }).orderBy("id", "asc");
  }

  async findById(organizationId, id) {
    return db("discounts").where({ id, organization_id: organizationId }).first();
  }

  async create(discountData) {
    const [id] = await db("discounts").insert({
      organization_id: discountData.organization_id,
      name: discountData.name,
      type: discountData.type,
      value: discountData.value,
      status: discountData.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(discountData.organization_id, id);
  }

  async update(organizationId, id, updateData) {
    await db("discounts").where({ id, organization_id: organizationId }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(organizationId, id);
  }
}

module.exports = {
  taxRepository: new TaxRepository(),
  discountRepository: new DiscountRepository(),
};
