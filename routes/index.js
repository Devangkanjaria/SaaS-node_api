const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const roleRoutes = require("./roleRoutes");
const clientRoutes = require("./clientRoutes");
const productRoutes = require("./productRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const paymentRoutes = require("./paymentRoutes");
const taxRoutes = require("./taxRoutes");
const discountRoutes = require("./discountRoutes");
const dashboardRoutes = require("./dashboardRoutes");

// Mount sub-routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/clients", clientRoutes);
router.use("/products", productRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/payments", paymentRoutes);
router.use("/taxes", taxRoutes);
router.use("/discounts", discountRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
