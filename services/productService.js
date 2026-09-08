const productRepository = require("../repositories/productRepository");
const { NotFoundError, ConflictError, BadRequestError } = require("../errors/errorTypes");

class ProductService {
  async listProducts(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const search = query.search || null;
    const categoryId = query.categoryId ? parseInt(query.categoryId, 10) : null;
    const status = query.status || null;

    const { products, total } = await productRepository.listProducts({ page, limit, search, categoryId, status });

    return {
      products,
      pagination: { page, limit, total },
    };
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return product;
  }

  async createProduct(productData, userId) {
    if (productData.sku) {
      const existing = await productRepository.findBySku(productData.sku);
      if (existing) {
        throw new ConflictError("A product with this SKU already exists");
      }
    }

    const product = await productRepository.create({
      ...productData,
      created_by: userId,
    });

    // Initialize inventory record
    await productRepository.upsertInventory(product.id, {
      quantity: productData.initial_stock || 0,
      reserved_quantity: 0,
      reorder_level: productData.reorder_level || 0,
    });

    return productRepository.findById(product.id);
  }

  async updateProduct(id, updateData) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (updateData.sku && updateData.sku !== product.sku) {
      const existing = await productRepository.findBySku(updateData.sku);
      if (existing) {
        throw new ConflictError("A product with this SKU already exists");
      }
    }

    return productRepository.update(id, updateData);
  }

  async updateProductStatus(id, status) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return productRepository.update(id, { status });
  }

  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Soft delete/deactivate to avoid foreign key failures
    await productRepository.update(id, { status: "inactive" });
    return { message: "Product status set to inactive" };
  }

  // Categories
  async listCategories() {
    return productRepository.listCategories();
  }

  async createCategory(categoryData) {
    const existing = await productRepository.findCategoryByName(categoryData.name);
    if (existing) {
      throw new ConflictError("A category with this name already exists");
    }
    return productRepository.createCategory(categoryData);
  }

  async updateCategory(id, updateData) {
    const category = await productRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return productRepository.updateCategory(id, updateData);
  }

  // Inventory
  async getInventory(productId) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const inventory = await productRepository.getInventory(productId);
    return inventory || { product_id: productId, quantity: 0, reserved_quantity: 0, reorder_level: 0 };
  }

  async updateInventory(productId, inventoryData) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return productRepository.upsertInventory(productId, inventoryData);
  }
}

module.exports = new ProductService();
