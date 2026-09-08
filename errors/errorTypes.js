const AppError = require("./AppError");

class BadRequestError extends AppError {
  constructor(message = "Bad request", details = {}, errorCode = "BAD_REQUEST") {
    super(message, 400, errorCode, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access", details = {}, errorCode = "UNAUTHORIZED") {
    super(message, 401, errorCode, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden: Insufficient permissions", details = {}, errorCode = "FORBIDDEN") {
    super(message, 403, errorCode, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found", details = {}, errorCode = "NOT_FOUND") {
    super(message, 404, errorCode, details);
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflict with existing resource", details = {}, errorCode = "CONFLICT") {
    super(message, 409, errorCode, details);
  }
}

class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity / Business rule violation", details = {}, errorCode = "UNPROCESSABLE_ENTITY") {
    super(message, 422, errorCode, details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
};
