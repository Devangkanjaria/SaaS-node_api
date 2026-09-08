const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const tenantMiddleware = require("../middlewares/tenantMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  getProductByIdSchema,
  createCategorySchema,
  updateCategorySchema,
  updateInventorySchema,
} = require("../validators/productValidator");

router.use(authenticateJWT);
router.use(tenantMiddleware);

// Categories
router.get("/categories", requirePermission(PERMISSIONS.PRODUCT_VIEW), productController.listCategories);
router.post("/categories", requirePermission(PERMISSIONS.PRODUCT_CREATE), validate(createCategorySchema), productController.createCategory);
router.put("/categories/:id", requirePermission(PERMISSIONS.PRODUCT_UPDATE), validate(updateCategorySchema), productController.updateCategory);

// Products CRUD
router.get("/", requirePermission(PERMISSIONS.PRODUCT_VIEW), productController.listProducts);
router.get("/:id", requirePermission(PERMISSIONS.PRODUCT_VIEW), validate(getProductByIdSchema), productController.getProductById);
router.post("/", requirePermission(PERMISSIONS.PRODUCT_CREATE), validate(createProductSchema), productController.createProduct);
router.put("/:id", requirePermission(PERMISSIONS.PRODUCT_UPDATE), validate(updateProductSchema), productController.updateProduct);
router.patch("/:id/status", requirePermission(PERMISSIONS.PRODUCT_UPDATE), validate(updateProductStatusSchema), productController.updateProductStatus);
router.delete("/:id", requirePermission(PERMISSIONS.PRODUCT_DELETE), validate(getProductByIdSchema), productController.deleteProduct);

// Inventory
router.get("/:id/inventory", requirePermission(PERMISSIONS.PRODUCT_VIEW), validate(getProductByIdSchema), productController.getInventory);
router.put("/:id/inventory", requirePermission(PERMISSIONS.INVENTORY_MANAGE), validate(updateInventorySchema), productController.updateInventory);

module.exports = router;
