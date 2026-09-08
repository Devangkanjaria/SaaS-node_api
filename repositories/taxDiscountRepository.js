const db = require("../config/db");

class TaxRepository {
  async listTaxes() {
    return db("taxes").select("*").orderBy("rate", "asc");
  }

  async findById(id) {
    return db("taxes").where({ id }).first();
  }

  async findByCode(code) {
    return db("taxes").where({ code }).first();
  }

  async create(taxData) {
    const [id] = await db("taxes").insert({
      name: taxData.name,
      code: taxData.code.toUpperCase(),
      rate: taxData.rate,
      description: taxData.description || null,
      status: taxData.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async update(id, updateData) {
    await db("taxes").where({ id }).update({
      ...updateData,
      ...(updateData.code && { code: updateData.code.toUpperCase() }),
      updated_at: new Date(),
    });
    return this.findById(id);
  }
}

class DiscountRepository {
  async listDiscounts() {
    return db("discounts").select("*").orderBy("id", "asc");
  }

  async findById(id) {
    return db("discounts").where({ id }).first();
  }

  async create(discountData) {
    const [id] = await db("discounts").insert({
      name: discountData.name,
      type: discountData.type,
      value: discountData.value,
      status: discountData.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(id);
  }

  async update(id, updateData) {
    await db("discounts").where({ id }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(id);
  }
}

module.exports = {
  taxRepository: new TaxRepository(),
  discountRepository: new DiscountRepository(),
};
