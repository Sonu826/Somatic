/**
 * Standardized response envelope used by every endpoint in the system.
 *
 * Success: { success: true, data: {...} }
 * Failure: { success: false, message: "...", errorCode: "..." }
 *
 * Keeping this in one place means the frontend never has to guess
 * the shape of a response.
 */

function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function sendError(res, message = 'Something went wrong', statusCode = 500, errorCode = 'INTERNAL_ERROR') {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
  });
}

/**
 * Custom error class carrying an HTTP status + machine-readable code,
 * so services can throw ApiError(...) and let the central error
 * middleware format the response consistently.
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

module.exports = { sendSuccess, sendError, ApiError };
