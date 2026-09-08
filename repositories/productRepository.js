const db = require("../config/db");

class ProductRepository {
  async listProducts(organizationId, { page = 1, limit = 10, search, categoryId, status }) {
    const offset = (page - 1) * limit;

    let baseQuery = db("products")
      .leftJoin("product_categories", "products.category_id", "product_categories.id")
      .leftJoin("product_inventory", "products.id", "product_inventory.product_id")
      .where("products.organization_id", organizationId);

    if (search) {
      baseQuery = baseQuery.where(function () {
        this.where("products.name", "like", `%${search}%`)
          .orWhere("products.sku", "like", `%${search}%`)
          .orWhere("products.description", "like", `%${search}%`);
      });
    }

    if (categoryId) {
      baseQuery = baseQuery.where("products.category_id", categoryId);
    }

    if (status) {
      baseQuery = baseQuery.where("products.status", status);
    }

    const countResult = await baseQuery.clone().count({ total: "products.id" }).first();
    const total = countResult ? parseInt(countResult.total, 10) : 0;

    const products = await baseQuery
      .clone()
      .select(
        "products.*",
        "product_categories.name as category_name",
        "product_inventory.quantity as stock_quantity",
        "product_inventory.reserved_quantity",
        "product_inventory.reorder_level"
      )
      .orderBy("products.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return { products, total };
  }

  async findById(organizationId, id) {
    return db("products")
      .leftJoin("product_categories", "products.category_id", "product_categories.id")
      .leftJoin("product_inventory", "products.id", "product_inventory.product_id")
      .where({ "products.id": id, "products.organization_id": organizationId })
      .select(
        "products.*",
        "product_categories.name as category_name",
        "product_inventory.quantity as stock_quantity",
        "product_inventory.reserved_quantity",
        "product_inventory.reorder_level"
      )
      .first();
  }

  async findBySku(organizationId, sku) {
    return db("products").where({ sku, organization_id: organizationId }).first();
  }

  async create(productData, trx = null) {
    const query = (trx || db)("products");
    const [id] = await query.insert({
      organization_id: productData.organization_id,
      category_id: productData.category_id || null,
      name: productData.name,
      sku: productData.sku || null,
      description: productData.description || null,
      unit: productData.unit || "unit",
      unit_price: productData.unit_price || 0.0,
      tax_rate: productData.tax_rate || 0.0,
      status: productData.status || "active",
      created_by: productData.created_by || null,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findById(productData.organization_id, id);
  }

  async update(organizationId, id, updateData, trx = null) {
    const query = (trx || db)("products");
    await query.where({ id, organization_id: organizationId }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findById(organizationId, id);
  }

  async delete(organizationId, id, trx = null) {
    const query = (trx || db)("products");
    return query.where({ id, organization_id: organizationId }).del();
  }

  // Categories
  async listCategories(organizationId) {
    return db("product_categories").where({ organization_id: organizationId }).orderBy("name", "asc");
  }

  async findCategoryById(organizationId, id) {
    return db("product_categories").where({ id, organization_id: organizationId }).first();
  }

  async findCategoryByName(organizationId, name) {
    return db("product_categories").where({ name, organization_id: organizationId }).first();
  }

  async createCategory(categoryData) {
    const [id] = await db("product_categories").insert({
      organization_id: categoryData.organization_id,
      name: categoryData.name,
      description: categoryData.description || null,
      status: categoryData.status || "active",
      created_at: new Date(),
      updated_at: new Date(),
    });
    return this.findCategoryById(categoryData.organization_id, id);
  }

  async updateCategory(organizationId, id, updateData) {
    await db("product_categories").where({ id, organization_id: organizationId }).update({
      ...updateData,
      updated_at: new Date(),
    });
    return this.findCategoryById(organizationId, id);
  }

  // Inventory
  async getInventory(productId) {
    return db("product_inventory").where({ product_id: productId }).first();
  }

  async upsertInventory(productId, inventoryData, trx = null) {
    const query = (trx || db)("product_inventory");
    const existing = await query.where({ product_id: productId }).first();

    if (existing) {
      await (trx || db)("product_inventory").where({ product_id: productId }).update({
        ...inventoryData,
        updated_at: new Date(),
      });
    } else {
      await (trx || db)("product_inventory").insert({
        product_id: productId,
        quantity: inventoryData.quantity || 0,
        reserved_quantity: inventoryData.reserved_quantity || 0,
        reorder_level: inventoryData.reorder_level || 0,
        updated_at: new Date(),
      });
    }
    return this.getInventory(productId);
  }

  async adjustInventoryQuantity(productId, deltaQuantity, trx = null) {
    const query = (trx || db)("product_inventory");
    const inventory = await query.where({ product_id: productId }).first();

    if (inventory) {
      const newQty = Number(inventory.quantity) + Number(deltaQuantity);
      await (trx || db)("product_inventory").where({ product_id: productId }).update({
        quantity: newQty,
        updated_at: new Date(),
      });
    }
  }
}

module.exports = new ProductRepository();
