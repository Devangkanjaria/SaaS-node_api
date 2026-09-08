const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const { NotFoundError } = require("./errors/errorTypes");

const app = express();

/* ================= MIDDLEWARES ================= */

// 1. CORS Setup
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// 2. Request Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Static Uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= API ROUTES ================= */

// Root healthcheck
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Invoice Management SaaS API is running smoothly",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount Main Master Router
app.use("/api", routes);

/* ================= 404 & ERROR HANDLING ================= */

// Catch-all 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route '${req.method} ${req.originalUrl}' not found`));
});

// Centralized Error Middleware
app.use(errorMiddleware);

module.exports = app;
