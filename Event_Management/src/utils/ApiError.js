/**
 * Custom error carrying an HTTP status code. Throw it anywhere in a
 * controller and the central error handler will format the response.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ApiError;
