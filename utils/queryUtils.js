/**
 * Reusable query parser and pagination builder for Knex
 */

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const getSorting = (query, allowedFields = [], defaultField = "created_at", defaultOrder = "desc") => {
  let sortBy = query.sort_by || query.sortBy || defaultField;
  let sortOrder = (query.sort_order || query.sortOrder || defaultOrder).toLowerCase();

  if (!allowedFields.includes(sortBy)) {
    sortBy = defaultField;
  }

  if (!["asc", "desc"].includes(sortOrder)) {
    sortOrder = defaultOrder;
  }

  return { sortBy, sortOrder };
};

module.exports = {
  getPagination,
  getSorting,
};
