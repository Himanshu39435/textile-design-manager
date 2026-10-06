export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.status || 500;
  const message = error.message || 'Server error';

  console.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}
