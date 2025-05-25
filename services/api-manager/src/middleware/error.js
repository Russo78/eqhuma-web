// src/middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware centralizado para manejo de errores
 * @param {Error} err - El error capturado
 * @param {Object} req - La solicitud HTTP
 * @param {Object} res - La respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  // Error de Mongoose - ID no válido
  if (err.name === 'CastError') {
    const message = `Recurso no encontrado con ID: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Error de Mongoose - Campos duplicados
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Ya existe un registro con este ${field}: ${value}`;
    error = new ErrorResponse(message, 400);
  }

  // Error de Mongoose - Validación
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // Error de JWT - Token expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'El token de autenticación ha expirado';
    error = new ErrorResponse(message, 401);
  }

  // Error de JWT - Token inválido
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token de autenticación no válido';
    error = new ErrorResponse(message, 401);
  }

  // Respuesta estandarizada de error
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Error interno del servidor',
      code: error.statusCode || 500,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;