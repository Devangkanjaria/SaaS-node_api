const productRepository = require("../repositories/productRepository");
const planLimitService = require("./planLimitService");
const { NotFoundError, ConflictError } = require("../errors/errorTypes");

class ProductService {
  async listProducts(organizationId, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = query.search || null;
    const categoryId = query.categoryId ? parseInt(query.categoryId, 10) : null;
    const status = query.status || null;

    const { products, total } = await productRepository.listProducts(organizationId, { page, limit, search, categoryId, status });

    return {
      products,
      pagination: { page, limit, total },
    };
  }

  async getProductById(organizationId, id) {
    const product = await productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return product;
  }

  async createProduct(organizationId, productData, userId) {
    await planLimitService.checkProductLimit(organizationId);

    if (productData.sku) {
      const existing = await productRepository.findBySku(organizationId, productData.sku);
      if (existing) {
        throw new ConflictError("A product with this SKU already exists in your organization");
      }
    }

    const product = await productRepository.create({
      ...productData,
      organization_id: organizationId,
      created_by: userId,
    });

    // Initialize inventory record
    await productRepository.upsertInventory(product.id, {
      quantity: productData.initial_stock || 0,
      reserved_quantity: 0,
      reorder_level: productData.reorder_level || 0,
    });

    return productRepository.findById(organizationId, product.id);
  }

  async updateProduct(organizationId, id, updateData) {
    const product = await productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (updateData.sku && updateData.sku !== product.sku) {
      const existing = await productRepository.findBySku(organizationId, updateData.sku);
      if (existing) {
        throw new ConflictError("A product with this SKU already exists in your organization");
      }
    }

    return productRepository.update(organizationId, id, updateData);
  }

  async updateProductStatus(organizationId, id, status) {
    const product = await productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return productRepository.update(organizationId, id, { status });
  }

  async deleteProduct(organizationId, id) {
    const product = await productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await productRepository.update(organizationId, id, { status: "inactive" });
    return { message: "Product status set to inactive" };
  }

  // Categories
  async listCategories(organizationId) {
    return productRepository.listCategories(organizationId);
  }

  async createCategory(organizationId, categoryData) {
    const existing = await productRepository.findCategoryByName(organizationId, categoryData.name);
    if (existing) {
      throw new ConflictError("A category with this name already exists in your organization");
    }
    return productRepository.createCategory({
      ...categoryData,
      organization_id: organizationId,
    });
  }

  async updateCategory(organizationId, id, updateData) {
    const category = await productRepository.findCategoryById(organizationId, id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return productRepository.updateCategory(organizationId, id, updateData);
  }

  // Inventory
  async getInventory(organizationId, productId) {
    const product = await productRepository.findById(organizationId, productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const inventory = await productRepository.getInventory(productId);
    return inventory || { product_id: productId, quantity: 0, reserved_quantity: 0, reorder_level: 0 };
  }

  async updateInventory(organizationId, productId, inventoryData) {
    const product = await productRepository.findById(organizationId, productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return productRepository.upsertInventory(productId, inventoryData);
  }
}

module.exports = new ProductService();
