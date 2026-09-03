const env = require('../config/env');

/** Thrown intentionally from controllers/services for expected error conditions. */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  // Never leak stack traces, SQL, or internal details to the client.
  const isServerError = statusCode >= 500;
  const message = isServerError && env.nodeEnv === 'production' ? 'Internal server error' : err.message;

  if (isServerError) {
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}]`, err);
  }

  res.status(statusCode).json({
    error: message,
    ...(env.nodeEnv !== 'production' && isServerError ? { stack: err.stack } : {}),
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };
