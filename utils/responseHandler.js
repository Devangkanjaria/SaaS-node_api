/**
 * Standard API Response envelope handlers
 */

const sendSuccess = (res, message = "Success", data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendCreated = (res, message = "Created successfully", data = {}) => {
  return sendSuccess(res, message, data, 201);
};

const sendPaginated = (res, message = "Fetched successfully", data = [], pagination = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(pagination.page) || 1,
      limit: Number(pagination.limit) || 10,
      total: Number(pagination.total) || 0,
      totalPages: Math.ceil((Number(pagination.total) || 0) / (Number(pagination.limit) || 10)),
    },
  });
};

const sendError = (res, message = "An error occurred", errorCode = "INTERNAL_SERVER_ERROR", statusCode = 500, details = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details,
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
};
