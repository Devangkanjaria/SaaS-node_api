require("dotenv").config(); // Must be first
const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import Routes
const studentRoutes = require("./routes/invoiceRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

/* ================= MIDDLEWARES ================= */

// 1. Enable CORS (Crucial for Frontend-Backend connection)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Your React App URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 2. Body Parsers (To read JSON and Form Data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static Folder for Images (To view student photos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= API ROUTES ================= */

app.use("/api/students", studentRoutes);
app.use("/api/invoices", invoiceRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("Garage Management API is running...");
});
app.get("/api/products", async (req, res) => {
  try {
    // Knex syntax for "SELECT * FROM products"
    const products = await db("products").select("*");
    res.json(products);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
/* ================= ERROR HANDLING ================= */

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
