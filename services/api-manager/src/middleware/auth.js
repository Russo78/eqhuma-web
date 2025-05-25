// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Proteger rutas - verifica que el usuario esté autenticado
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verificar si existe token en headers o cookies
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obtener token de header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Obtener token de cookie
    token = req.cookies.token;
  }

  // Verificar que el token exista
  if (!token) {
    return next(new ErrorResponse('No estás autorizado para acceder a este recurso', 401));
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario del token
    req.user = await User.findById(decoded.id);

    // Verificar si el usuario existe
    if (!req.user) {
      return next(new ErrorResponse('Usuario no encontrado', 404));
    }

    // Verificar si la cuenta está activa
    if (!req.user.isActive) {
      return next(new ErrorResponse('Esta cuenta ha sido desactivada', 403));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('No estás autorizado para acceder a este recurso', 401));
  }
});

// Verificar roles de usuario
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('No estás autorizado para acceder a este recurso', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `El rol ${req.user.role} no está autorizado para acceder a este recurso`,
          403
        )
      );
    }
    next();
  };
};

// Verificar API key para consumo público de APIs
exports.apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];
  
  if (!apiKey) {
    return next(new ErrorResponse('API Key es requerida', 401));
  }

  try {
    // Buscar la instancia API por la key
    const apiInstance = await ApiInstance.findOne({ apiKey }).select('+apiSecret');
    
    if (!apiInstance) {
      return next(new ErrorResponse('API Key inválida', 401));
    }

    // Si se requiere apiSecret (para operaciones sensibles)
    if (apiInstance.requiresSecret && !apiSecret) {
      return next(new ErrorResponse('API Secret es requerida para esta operación', 401));
    }

    if (apiInstance.requiresSecret && apiSecret !== apiInstance.apiSecret) {
      return next(new ErrorResponse('API Secret inválida', 401));
    }

    // Verificar si la API está activa
    if (!apiInstance.isActive) {
      return next(new ErrorResponse('Esta API ha sido desactivada', 403));
    }

    // Verificar límites de uso
    if (apiInstance.usageLimit && apiInstance.usageCount >= apiInstance.usageLimit) {
      return next(new ErrorResponse('Límite de uso de API excedido', 429));
    }

    // Guardar la instancia de API en la solicitud para uso posterior
    req.apiInstance = apiInstance;
    
    next();
  } catch (err) {
    return next(new ErrorResponse('Error de autenticación', 500));
  }
});