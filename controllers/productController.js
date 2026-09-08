const productService = require("../services/productService");
const { sendSuccess, sendCreated, sendPaginated } = require("../utils/responseHandler");

class ProductController {
  async listProducts(req, res, next) {
    try {
      const { products, pagination } = await productService.listProducts(req.query);
      return sendPaginated(res, "Products fetched successfully", products, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return sendSuccess(res, "Product fetched successfully", product);
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user.id);
      return sendCreated(res, "Product created successfully", product);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      return sendSuccess(res, "Product updated successfully", product);
    } catch (err) {
      next(err);
    }
  }

  async updateProductStatus(req, res, next) {
    try {
      const product = await productService.updateProductStatus(req.params.id, req.body.status);
      return sendSuccess(res, "Product status updated successfully", product);
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const result = await productService.deleteProduct(req.params.id);
      return sendSuccess(res, result.message);
    } catch (err) {
      next(err);
    }
  }

  // Categories
  async listCategories(req, res, next) {
    try {
      const categories = await productService.listCategories();
      return sendSuccess(res, "Categories fetched successfully", categories);
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await productService.createCategory(req.body);
      return sendCreated(res, "Category created successfully", category);
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await productService.updateCategory(req.params.id, req.body);
      return sendSuccess(res, "Category updated successfully", category);
    } catch (err) {
      next(err);
    }
  }

  // Inventory
  async getInventory(req, res, next) {
    try {
      const inventory = await productService.getInventory(req.params.id);
      return sendSuccess(res, "Inventory fetched successfully", inventory);
    } catch (err) {
      next(err);
    }
  }

  async updateInventory(req, res, next) {
    try {
      const inventory = await productService.updateInventory(req.params.id, req.body);
      return sendSuccess(res, "Inventory updated successfully", inventory);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
