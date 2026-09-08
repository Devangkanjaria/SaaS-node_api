const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const validate = require("../middlewares/validateMiddleware");
const authenticateJWT = require("../middlewares/authMiddleware");
const tenantMiddleware = require("../middlewares/tenantMiddleware");
const { requirePermission } = require("../middlewares/rbacMiddleware");
const { PERMISSIONS } = require("../constants/roles");
const {
  createClientSchema,
  updateClientSchema,
  updateClientStatusSchema,
  getClientByIdSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} = require("../validators/clientValidator");

router.use(authenticateJWT);
router.use(tenantMiddleware);

// Client CRUD
router.get("/", requirePermission(PERMISSIONS.CLIENT_VIEW), clientController.listClients);
router.get("/:id", requirePermission(PERMISSIONS.CLIENT_VIEW), validate(getClientByIdSchema), clientController.getClientById);
router.post("/", requirePermission(PERMISSIONS.CLIENT_CREATE), validate(createClientSchema), clientController.createClient);
router.put("/:id", requirePermission(PERMISSIONS.CLIENT_UPDATE), validate(updateClientSchema), clientController.updateClient);
router.patch("/:id/status", requirePermission(PERMISSIONS.CLIENT_UPDATE), validate(updateClientStatusSchema), clientController.updateClientStatus);
router.delete("/:id", requirePermission(PERMISSIONS.CLIENT_DELETE), validate(getClientByIdSchema), clientController.deleteClient);

// Client Addresses Sub-routes
router.get("/:clientId/addresses", requirePermission(PERMISSIONS.CLIENT_VIEW), clientController.listAddresses);
router.post("/:clientId/addresses", requirePermission(PERMISSIONS.CLIENT_UPDATE), validate(createAddressSchema), clientController.createAddress);
router.put("/:clientId/addresses/:addressId", requirePermission(PERMISSIONS.CLIENT_UPDATE), validate(updateAddressSchema), clientController.updateAddress);
router.delete("/:clientId/addresses/:addressId", requirePermission(PERMISSIONS.CLIENT_UPDATE), validate(addressIdParamSchema), clientController.deleteAddress);

module.exports = router;
