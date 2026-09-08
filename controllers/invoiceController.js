const Invoice = require("../models/invoiceModel");
const db= require("../config/db");
exports.createInvoice = async (req, res) => {
  try {
    const id = await Invoice.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const data = await Invoice.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get the main invoice details
    const invoice = await db("invoices").where({ id }).first();
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // 2. Get the items AND the product names using a JOIN
    const items = await db("invoice_items")
      .join("products", "invoice_items.productId", "=", "products.id")
      .select(
        "invoice_items.*", 
        "products.name as productName" // This creates the productName field
      )
      .where("invoice_items.invoice_id", id);

    // 3. Send back the combined data
    res.json({ ...invoice, items });
  } catch (err) {
    console.error("SQL Error:", err.message);
    res.status(500).json({ error: "Database lookup failed: " + err.message });
  }
};
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    await Invoice.update(id, updateData);

    res.status(200).json({ message: "Invoice updated successfully" });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    // Call the model function to delete from MySQL
    const result = await Invoice.delete(id);

    if (result === 0) {
      return res.status(404).json({ error: "Invoice not found in database" });
    }

    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
