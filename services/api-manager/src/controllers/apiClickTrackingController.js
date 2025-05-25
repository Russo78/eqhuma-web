// src/controllers/apiClickTrackingController.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const ApiClick = require('../models/ApiClick');
const ApiInstance = require('../models/ApiInstance');

/**
 * @desc    Registrar un nuevo clic en una API
 * @route   POST /api/v1/apiclicks
 * @access  Público (con API key)
 */
exports.recordClick = asyncHandler(async (req, res, next) => {
  const { apiInstanceId, endpoint, method, statusCode, responseTime } = req.body;
  
  if (!apiInstanceId || !endpoint) {
    return next(new ErrorResponse('Se requiere ID de instancia de API y endpoint', 400));
  }

  // Verificar si la API existe
  const apiInstance = await ApiInstance.findById(apiInstanceId);
  if (!apiInstance) {
    return next(new ErrorResponse('Instancia de API no encontrada', 404));
  }

  // Obtener información del cliente
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  
  // Extraer parámetros UTM si existen
  const { 
    utm_source: utmSource,
    utm_medium: utmMedium, 
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent
  } = req.query;

  // Crear nuevo registro de clic
  const apiClick = await ApiClick.create({
    apiInstance: apiInstanceId,
    clientIp,
    userAgent,
    endpoint,
    method: method || 'GET',
    statusCode: statusCode || 200,
    responseTime: responseTime || 0,
    isSuccess: statusCode ? statusCode < 400 : true,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    // Cualquier metadato adicional
    metaData: req.body.metaData || {}
  });

  // Actualizar contador de uso en la instancia de API
  await apiInstance.logUsage();

  res.status(201).json({
    success: true,
    data: apiClick
  });
});

/**
 * @desc    Registrar una conversión para un clic previamente rastreado
 * @route   POST /api/v1/apiclicks/:id/convert
 * @access  Público (con API key)
 */
exports.recordConversion = asyncHandler(async (req, res, next) => {
  const { conversionType, conversionValue } = req.body;
  
  if (!conversionType) {
    return next(new ErrorResponse('Se requiere el tipo de conversión', 400));
  }

  let apiClick = await ApiClick.findById(req.params.id);
  if (!apiClick) {
    return next(new ErrorResponse('Registro de clic no encontrado', 404));
  }

  // Si ya está convertido, no hacer nada
  if (apiClick.isConverted) {
    return res.status(200).json({
      success: true,
      message: 'Este clic ya fue convertido anteriormente',
      data: apiClick
    });
  }

  // Registrar la conversión
  apiClick = await apiClick.markAsConverted(conversionType, conversionValue || 0);

  res.status(200).json({
    success: true,
    data: apiClick
  });
});

/**
 * @desc    Obtener estadísticas de clics por filtros
 * @route   GET /api/v1/apiclicks/stats
 * @access  Privado
 */
exports.getClickStats = asyncHandler(async (req, res, next) => {
  // Verificar permiso para ver estadísticas
  const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
  
  // Construir filtros
  let filter = {};
  
  // Si no es admin, filtrar por APIs del usuario
  if (!isAdmin) {
    // Obtener las IDs de APIs que pertenecen al usuario
    const userApis = await ApiInstance.find({ user: req.user.id }).select('_id');
    const userApiIds = userApis.map(api => api._id);
    
    filter.apiInstance = { $in: userApiIds };
  } 
  // Si es admin y se proporciona un usuario específico
  else if (req.query.userId) {
    const userApis = await ApiInstance.find({ user: req.query.userId }).select('_id');
    const userApiIds = userApis.map(api => api._id);
    filter.apiInstance = { $in: userApiIds };
  }
  
  // Filtrar por API específica
  if (req.query.apiInstanceId) {
    // Verificar si el usuario tiene permiso para ver esta API
    const apiInstance = await ApiInstance.findById(req.query.apiInstanceId);
    if (!apiInstance) {
      return next(new ErrorResponse('Instancia de API no encontrada', 404));
    }
    
    // Si no es admin y no es dueño de la API
    if (!isAdmin && apiInstance.user.toString() !== req.user.id) {
      return next(new ErrorResponse('No tienes permiso para ver esta API', 403));
    }
    
    filter.apiInstance = req.query.apiInstanceId;
  }
  
  // Filtrar por rango de fechas
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }
  
  // Filtrar por UTM
  if (req.query.utmSource) filter.utmSource = req.query.utmSource;
  if (req.query.utmMedium) filter.utmMedium = req.query.utmMedium;
  if (req.query.utmCampaign) filter.utmCampaign = req.query.utmCampaign;
  
  // Realizar agregación para obtener estadísticas
  const stats = await ApiClick.aggregate([
    { $match: filter },
    { $group: {
      _id: null,
      totalClicks: { $sum: 1 },
      successCount: { $sum: { $cond: ['$isSuccess', 1, 0] } },
      errorCount: { $sum: { $cond: ['$isSuccess', 0, 1] } },
      conversions: { $sum: { $cond: ['$isConverted', 1, 0] } },
      totalValue: { $sum: '$conversionValue' },
      avgResponseTime: { $avg: '$responseTime' }
    }},
    { $project: {
      _id: 0,
      totalClicks: 1,
      successCount: 1,
      errorCount: 1,
      conversions: 1,
      totalValue: 1,
      avgResponseTime: 1,
      conversionRate: {
        $cond: [
          { $eq: ['$totalClicks', 0] },
          0,
          { $multiply: [{ $divide: ['$conversions', '$totalClicks'] }, 100] }
        ]
      },
      successRate: {
        $cond: [
          { $eq: ['$totalClicks', 0] },
          0,
          { $multiply: [{ $divide: ['$successCount', '$totalClicks'] }, 100] }
        ]
      }
    }}
  ]);

  // Preparar respuesta
  const statsData = stats.length > 0 ? stats[0] : {
    totalClicks: 0,
    successCount: 0,
    errorCount: 0,
    conversions: 0,
    totalValue: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    successRate: 0
  };

  res.status(200).json({
    success: true,
    data: statsData
  });
});

/**
 * @desc    Obtener tendencias de clics por periodo de tiempo
 * @route   GET /api/v1/apiclicks/trends
 * @access  Privado
 */
exports.getClickTrends = asyncHandler(async (req, res, next) => {
  // Verificar permiso
  const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
  
  // Construir filtros
  let filter = {};
  
  // Si no es admin, filtrar por APIs del usuario
  if (!isAdmin) {
    const userApis = await ApiInstance.find({ user: req.user.id }).select('_id');
    const userApiIds = userApis.map(api => api._id);
    filter.apiInstance = { $in: userApiIds };
  } else if (req.query.userId) {
    const userApis = await ApiInstance.find({ user: req.query.userId }).select('_id');
    const userApiIds = userApis.map(api => api._id);
    filter.apiInstance = { $in: userApiIds };
  }
  
  // Filtrar por API específica
  if (req.query.apiInstanceId) {
    filter.apiInstance = req.query.apiInstanceId;
  }
  
  // Determinar la granularidad de tiempo
  const granularity = req.query.granularity || 'day';
  let dateFormat;
  
  switch(granularity) {
    case 'hour':
      dateFormat = { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" } };
      break;
    case 'day':
      dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case 'week':
      dateFormat = { 
        $dateToString: { 
          format: "%Y-%U", // Formato de año-semana
          date: "$createdAt" 
        } 
      };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
      break;
    default:
      dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
  
  // Filtrar por rango de fechas
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  } else {
    // Por defecto, mostrar últimos 30 días
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    filter.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  // Realizar agregación por período de tiempo
  const trends = await ApiClick.aggregate([
    { $match: filter },
    { $group: {
      _id: dateFormat,
      clicks: { $sum: 1 },
      successCount: { $sum: { $cond: ['$isSuccess', 1, 0] } },
      conversions: { $sum: { $cond: ['$isConverted', 1, 0] } },
      totalValue: { $sum: '$conversionValue' }
    }},
    { $sort: { _id: 1 } },
    { $project: {
      _id: 0,
      period: '$_id',
      clicks: 1,
      successCount: 1,
      conversions: 1,
      totalValue: 1,
      conversionRate: {
        $cond: [
          { $eq: ['$clicks', 0] },
          0,
          { $multiply: [{ $divide: ['$conversions', '$clicks'] }, 100] }
        ]
      }
    }}
  ]);

  res.status(200).json({
    success: true,
    count: trends.length,
    data: trends
  });
});

/**
 * @desc    Obtener detalles de clics
 * @route   GET /api/v1/apiclicks
 * @access  Privado
 */
exports.getApiClicks = asyncHandler(async (req, res, next) => {
  // Verificar permiso
  const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
  
  // Construir filtros
  let filter = {};
  
  // Si no es admin, filtrar por APIs del usuario
  if (!isAdmin) {
    const userApis = await ApiInstance.find({ user: req.user.id }).select('_id');
    const userApiIds = userApis.map(api => api._id);
    filter.apiInstance = { $in: userApiIds };
  } else if (req.query.userId) {
    const userApis = await ApiInstance.find({ user: req.query.userId }).select('_id');
    const userApiIds = userApis.map(api => api._id);
    filter.apiInstance = { $in: userApiIds };
  }
  
  // Filtros adicionales
  if (req.query.apiInstanceId) filter.apiInstance = req.query.apiInstanceId;
  if (req.query.isSuccess !== undefined) filter.isSuccess = req.query.isSuccess === 'true';
  if (req.query.isConverted !== undefined) filter.isConverted = req.query.isConverted === 'true';
  if (req.query.endpoint) filter.endpoint = { $regex: req.query.endpoint, $options: 'i' };
  if (req.query.method) filter.method = req.query.method;
  
  // Filtrar por UTM
  if (req.query.utmSource) filter.utmSource = req.query.utmSource;
  if (req.query.utmMedium) filter.utmMedium = req.query.utmMedium;
  if (req.query.utmCampaign) filter.utmCampaign = req.query.utmCampaign;
  
  // Filtrar por rango de fechas
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }
  
  // Opciones de paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  
  // Opciones de ordenamiento
  const sort = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy.startsWith('-') ? 
                      req.query.sortBy.substring(1) : 
                      req.query.sortBy;
    const sortOrder = req.query.sortBy.startsWith('-') ? -1 : 1;
    sort[sortField] = sortOrder;
  } else {
    sort.createdAt = -1; // Por defecto, ordenar por fecha descendente
  }
  
  // Ejecutar consulta
  const total = await ApiClick.countDocuments(filter);
  
  const clicks = await ApiClick.find(filter)
    .sort(sort)
    .skip(startIndex)
    .limit(limit)
    .populate({
      path: 'apiInstance',
      select: 'name description',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
  
  // Información de paginación
  const pagination = {};
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }
  if (startIndex + limit < total) {
    pagination.next = { page: page + 1, limit };
  }
  
  res.status(200).json({
    success: true,
    count: clicks.length,
    pagination: {
      ...pagination,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    },
    data: clicks
  });
});

/**
 * @desc    Obtener detalle de un clic específico
 * @route   GET /api/v1/apiclicks/:id
 * @access  Privado
 */
exports.getApiClick = asyncHandler(async (req, res, next) => {
  const apiClick = await ApiClick.findById(req.params.id).populate({
    path: 'apiInstance',
    select: 'name description user',
    populate: {
      path: 'user',
      select: 'name email'
    }
  });
  
  if (!apiClick) {
    return next(new ErrorResponse('Registro de clic no encontrado', 404));
  }
  
  // Verificar permisos
  const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
  const isOwner = apiClick.apiInstance.user._id.toString() === req.user.id;
  
  if (!isAdmin && !isOwner) {
    return next(new ErrorResponse('No tienes permiso para ver este registro', 403));
  }
  
  res.status(200).json({
    success: true,
    data: apiClick
  });
});

/**
 * @desc    Eliminar un registro de clic
 * @route   DELETE /api/v1/apiclicks/:id
 * @access  Privado (admin)
 */
exports.deleteApiClick = asyncHandler(async (req, res, next) => {
  const apiClick = await ApiClick.findById(req.params.id).populate({
    path: 'apiInstance',
    select: 'user'
  });
  
  if (!apiClick) {
    return next(new ErrorResponse('Registro de clic no encontrado', 404));
  }
  
  // Solo admin o propietario puede eliminar
  const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
  const isOwner = apiClick.apiInstance.user.toString() === req.user.id;
  
  if (!isAdmin && !isOwner) {
    return next(new ErrorResponse('No tienes permiso para eliminar este registro', 403));
  }
  
  await apiClick.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});