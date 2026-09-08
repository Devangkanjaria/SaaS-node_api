const { BadRequestError } = require("../errors/errorTypes");

/**
 * Zod validation middleware for body, query, and params
 * @param {Object} schemas - { body, query, params }
 */
const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      return next();
    } catch (error) {
      if (error.errors || error.issues) {
        const issues = error.issues || error.errors;
        const formattedErrors = issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return next(new BadRequestError("Validation failed", formattedErrors, "VALIDATION_ERROR"));
      }
      return next(error);
    }
  };
};

module.exports = validate;
