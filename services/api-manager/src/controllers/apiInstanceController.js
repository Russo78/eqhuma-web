// src/controllers/apiInstanceController.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const ApiInstance = require('../models/ApiInstance');
const ApiClick = require('../models/ApiClick');

/**
 * @desc    Crear una nueva instancia de API
 * @route   POST /api/v1/apiinstances
 * @access  Privado
 */
exports.createApiInstance = asyncHandler(async (req, res, next) => {
  // Asignar el usuario actual como propietario
  req.body.user = req.user.id;

  // Verificar cuotas de API por usuario
  const userApiCount = await ApiInstance.countDocuments({ user: req.user.id });
  
  // Limitar la creación según el rol del usuario
  let maxApis = 1; // Valor por defecto para usuarios básicos
  if (req.user.role === 'premium' || req.user.role === 'developer') {
    maxApis = 5;
  } else if (req.user.role === 'admin') {
    maxApis = 50;
  }
  
  if (userApiCount >= maxApis && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`Has alcanzado el límite máximo de ${maxApis} instancias de API`, 400));
  }

  const apiInstance = await ApiInstance.create(req.body);

  // Obtener las llaves generadas (no se incluyen en la respuesta por defecto)
  const fullApiInstance = await ApiInstance.findById(apiInstance._id).select('+apiKey +apiSecret');

  res.status(201).json({
    success: true,
    data: fullApiInstance
  });
});

/**
 * @desc    Obtener todas las instancias de API (filtradas por usuario o todas para admin)
 * @route   GET /api/v1/apiinstances
 * @access  Privado
 */
exports.getApiInstances = asyncHandler(async (req, res, next) => {
  // Si es admin, puede ver todas; sino, solo las propias
  const query = req.user.role === 'admin' || req.user.role === 'manager' 
    ? {} 
    : { user: req.user.id };

  // Aplicar filtros adicionales si se proporcionan
  if (req.query.isActive) {
    query.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: 'i' };
  }

  // Opciones de paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Ejecutar consulta paginada
  const total = await ApiInstance.countDocuments(query);
  const apiInstances = await ApiInstance.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate('user', 'name email');

  // Información de paginación
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: apiInstances.length,
    pagination: {
      ...pagination,
      total,
      pages: Math.ceil(total / limit)
    },
    data: apiInstances
  });
});

/**
 * @desc    Obtener una instancia de API específica
 * @route   GET /api/v1/apiinstances/:id
 * @access  Privado
 */
exports.getApiInstance = asyncHandler(async (req, res, next) => {
  const apiInstance = await ApiInstance.findById(req.params.id).populate('user', 'name email');

  if (!apiInstance) {
    return next(new ErrorResponse(`No se encontró la instancia de API con id ${req.params.id}`, 404));
  }

  // Verificar propiedad o permisos de administrador
  if (apiInstance.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`No tienes permiso para acceder a esta instancia de API`, 403));
  }

  res.status(200).json({
    success: true,
    data: apiInstance
  });
});

/**
 * @desc    Actualizar una instancia de API
 * @route   PUT /api/v1/apiinstances/:id
 * @access  Privado
 */
exports.updateApiInstance = asyncHandler(async (req, res, next) => {
  let apiInstance = await ApiInstance.findById(req.params.id);

  if (!apiInstance) {
    return next(new ErrorResponse(`No se encontró la instancia de API con id ${req.params.id}`, 404));
  }

  // Verificar propiedad o permisos de administrador
  if (apiInstance.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`No tienes permiso para actualizar esta instancia de API`, 403));
  }

  // No permitir cambiar el propietario
  if (req.body.user) {
    delete req.body.user;
  }

  // Actualizar la instancia
  apiInstance = await ApiInstance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: apiInstance
  });
});

/**
 * @desc    Eliminar una instancia de API
 * @route   DELETE /api/v1/apiinstances/:id
 * @access  Privado
 */
exports.deleteApiInstance = asyncHandler(async (req, res, next) => {
  const apiInstance = await ApiInstance.findById(req.params.id);

  if (!apiInstance) {
    return next(new ErrorResponse(`No se encontró la instancia de API con id ${req.params.id}`, 404));
  }

  // Verificar propiedad o permisos de administrador
  if (apiInstance.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`No tienes permiso para eliminar esta instancia de API`, 403));
  }

  // Eliminar también los clicks asociados
  await ApiClick.deleteMany({ apiInstance: apiInstance._id });
  await apiInstance.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Regenerar llaves de API
 * @route   POST /api/v1/apiinstances/:id/regenerate-keys
 * @access  Privado
 */
exports.regenerateApiKeys = asyncHandler(async (req, res, next) => {
  let apiInstance = await ApiInstance.findById(req.params.id);

  if (!apiInstance) {
    return next(new ErrorResponse(`No se encontró la instancia de API con id ${req.params.id}`, 404));
  }

  // Verificar propiedad o permisos de administrador
  if (apiInstance.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`No tienes permiso para regenerar llaves para esta instancia de API`, 403));
  }

  // Regenerar llaves
  const regenerateSecret = req.body.regenerateSecret === true;
  const newKeys = await apiInstance.regenerateKeys(regenerateSecret);

  res.status(200).json({
    success: true,
    data: {
      apiKey: newKeys.apiKey,
      apiSecret: newKeys.apiSecret,
      message: 'Llaves regeneradas exitosamente'
    }
  });
});

/**
 * @desc    Configurar webhook para una instancia de API
 * @route   POST /api/v1/apiinstances/:id/webhook
 * @access  Privado
 */
exports.configureWebhook = asyncHandler(async (req, res, next) => {
  const apiInstance = await ApiInstance.findById(req.params.id);

  if (!apiInstance) {
    return next(new ErrorResponse(`No se encontró la instancia de API con id ${req.params.id}`, 404));
  }

  // Verificar propiedad o permisos de administrador
  if (apiInstance.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`No tienes permiso para configurar webhooks para esta instancia de API`, 403));
  }

  // Configurar webhook
  const { url, events, secret } = req.body;
  const webhook = await apiInstance.setWebhook(url, events, secret);

  res.status(200).json({
    success: true,
    data: webhook
  });
});

/**
 * @desc    Obtener estadísticas de uso de una instancia de API
 * @route   GET /api/v1/apiinstances/:id/stats
 * @access  Privado
 */
exports.getApiStats = asyncHandler(async (req, res, next) => {
  const apiInstance = await ApiInstance.findById(req.params.id);

  if (!apiInstance) {
    return next(new ErrorResponse(`No se encontró la instancia de API con id ${req.params.id}`, 404));
  }

  // Verificar propiedad o permisos de administrador
  if (apiInstance.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(new ErrorResponse(`No tienes permiso para ver estadísticas de esta instancia de API`, 403));
  }

  // Filtrar por rango de fechas si se proporciona
  const dateRange = {};
  if (req.query.startDate) {
    dateRange.start = req.query.startDate;
  }
  if (req.query.endDate) {
    dateRange.end = req.query.endDate;
  }

  // Obtener estadísticas de clics
  const statsData = await ApiClick.getClickStats(apiInstance._id, dateRange);
  
  // Preparar respuesta
  const stats = statsData.length > 0 ? statsData[0] : {
    totalClicks: 0,
    successCount: 0,
    errorCount: 0,
    conversions: 0,
    totalValue: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    successRate: 100
  };

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      usageCount: apiInstance.usageCount,
      usageLimit: apiInstance.usageLimit,
      usagePercentage: apiInstance.usagePercentage,
      lastUsed: apiInstance.lastUsed
    }
  });
});

/**
 * @desc    Verificar si una clave de API es válida
 * @route   POST /api/v1/apiinstances/verify
 * @access  Público
 */
exports.verifyApiKey = asyncHandler(async (req, res, next) => {
  const { apiKey, apiSecret } = req.body;

  if (!apiKey) {
    return next(new ErrorResponse('Se requiere una clave API', 400));
  }

  // Buscar la instancia de API
  const apiInstance = await ApiInstance.findOne({ apiKey }).select('+apiSecret');

  if (!apiInstance) {
    return next(new ErrorResponse('Clave API inválida', 401));
  }

  // Verificar si requiere secret y si coincide
  if (apiInstance.requiresSecret && !apiSecret) {
    return next(new ErrorResponse('Se requiere API Secret para esta operación', 401));
  }

  if (apiInstance.requiresSecret && apiSecret !== apiInstance.apiSecret) {
    return next(new ErrorResponse('API Secret inválido', 401));
  }

  // Verificar si la API está activa y no excede límites
  if (!apiInstance.canBeUsed()) {
    return next(new ErrorResponse('Esta API no está disponible o ha excedido su límite de uso', 403));
  }

  // Todo está bien
  res.status(200).json({
    success: true,
    data: {
      valid: true,
      message: 'Clave API válida'
    }
  });
});