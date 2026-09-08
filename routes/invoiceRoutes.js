const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");

// Matches API.get("/invoices")
router.get("/", invoiceController.getAllInvoices); 

// Matches API.get("/invoices/:id")
router.get("/:id", invoiceController.getInvoiceById); 

// Matches API.post("/invoices")
router.post("/", invoiceController.createInvoice); 

// IMPORTANT: Add this line for the delete functionality
router.delete("/:id", invoiceController.deleteInvoice);

// backend/routes/invoiceRoutes.js
router.put("/:id", invoiceController.updateInvoice);

module.exports = router;