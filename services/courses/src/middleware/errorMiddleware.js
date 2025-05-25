// eqhuma-courses-service/src/middleware/errorMiddleware.js
/**
 * Handle 404 errors - Resource not found
 */
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
exports.errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  console.error('Error:', err);

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Prepare error response
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

/**
 * Handle validation errors
 */
exports.validationError = (err, req, res, next) => {
  // Check if error is a validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Pass to next error handler if not a validation error
  next(err);
};

/**
 * Handle duplicate key errors from MongoDB
 */
exports.duplicateKeyError = (err, req, res, next) => {
  // Check for duplicate key error code
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    
    return res.status(400).json({
      success: false,
      message: `Duplicate field value: ${field}. Please use another value.`
    });
  }
  
  // Pass to next error handler
  next(err);
};

/**
 * Rate limiter error handler
 */
exports.rateLimitError = (err, req, res, next) => {
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
  
  next(err);
};