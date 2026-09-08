require("dotenv").config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  DB: {
    HOST: process.env.DB_HOST || "127.0.0.1",
    PORT: process.env.DB_PORT || 3306,
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "",
    NAME: process.env.DB_NAME || "invoice_managment",
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || "default_super_secret_jwt_key_saas_invoice_2026",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "default_super_secret_refresh_jwt_key_saas_2026",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
};
