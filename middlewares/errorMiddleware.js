const AppError = require("../errors/AppError");
const env = require("../config/env");

/**
 * Centralized Error Handling Middleware
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Handle Knex/MySQL database errors gracefully
  if (err.code === "ER_DUP_ENTRY") {
    error = new AppError("Duplicate entry detected. Resource already exists.", 409, "DUPLICATE_ENTRY");
  } else if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
    error = new AppError("Cannot delete or modify record because it is referenced by other records.", 409, "FOREIGN_KEY_CONSTRAINT");
  } else if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
    error = new AppError("Referenced record does not exist.", 400, "INVALID_REFERENCE");
  } else if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token.", 401, "INVALID_TOKEN");
  } else if (err.name === "TokenExpiredError") {
    error = new AppError("Authentication token expired.", 401, "TOKEN_EXPIRED");
  }

  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || "INTERNAL_SERVER_ERROR";
  const message = error.message || "An unexpected error occurred on the server.";
  const details = error.details || {};

  if (statusCode >= 500) {
    console.error("[SERVER ERROR]", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details: Object.keys(details).length > 0 ? details : undefined,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
