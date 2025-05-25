// src/controllers/marketingController.js
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const UtmLink = require('../models/UtmLink');
const PromoCode = require('../models/PromoCode');
const ApiInstance = require('../models/ApiInstance');
const ApiClick = require('../models/ApiClick');
const Prospect = require('../models/Prospect');

/**
 * @desc    Crear un nuevo enlace UTM
 * @route   POST /api/v1/marketing/utm-links
 * @access  Privado
 */
exports.createUtmLink = asyncHandler(async (req, res, next) => {
  // Asignar el usuario actual como creador
  req.body.createdBy = req.user.id;
  
  // Validar campos obligatorios
  const { name, destinationUrl, utmSource, utmMedium, utmCampaign } = req.body;
  if (!name || !destinationUrl || !utmSource || !utmMedium || !utmCampaign) {
    return next(
      new ErrorResponse('Por favor proporciona nombre, URL de destino y parámetros UTM obligatorios', 400)
    );
  }
  
  // Crear el enlace UTM
  const utmLink = await UtmLink.create(req.body);
  
  res.status(201).json({
    success: true,
    data: {
      ...utmLink._doc,
      trackedUrl: utmLink.generateTrackedUrl(),
      shortUrl: utmLink.getShortenedUrl()
    }
  });
});

/**
 * @desc    Obtener todos los enlaces UTM (filtrados por usuario o todos para admin)
 * @route   GET /api/v1/marketing/utm-links
 * @access  Privado
 */
exports.getUtmLinks = asyncHandler(async (req, res, next) => {
  // Si es admin, puede ver todos; sino, solo los propios
  const query = req.user.role === 'admin' || req.user.role === 'manager'
    ? {}
    : { createdBy: req.user.id };
  
  // Aplicar filtros adicionales
  if (req.query.isActive) {
    query.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.campaign) {
    query.utmCampaign = { $regex: req.query.campaign, $options: 'i' };
  }
  
  if (req.query.source) {
    query.utmSource = { $regex: req.query.source, $options: 'i' };
  }
  
  if (req.query.tags) {
    const tagList = req.query.tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tagList };
  }
  
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Opciones de paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Opciones de ordenamiento
  const sort = {};
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') 
      ? req.query.sort.substring(1) 
      : req.query.sort;
    const sortDirection = req.query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortDirection;
  } else {
    sort.createdAt = -1; // Por defecto, ordenar por fecha descendente
  }
  
  // Ejecutar consulta paginada
  const total = await UtmLink.countDocuments(query);
  const utmLinks = await UtmLink.find(query)
    .sort(sort)
    .skip(startIndex)
    .limit(limit)
    .populate('createdBy', 'name email');
  
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
  
  // Procesar enlaces para incluir URLs completas
  const processedLinks = utmLinks.map(link => ({
    ...link.toObject(),
    trackedUrl: link.generateTrackedUrl(),
    shortUrl: link.getShortenedUrl()
  }));
  
  res.status(200).json({
    success: true,
    count: utmLinks.length,
    pagination: {
      ...pagination,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    },
    data: processedLinks
  });
});

/**
 * @desc    Obtener un enlace UTM específico
 * @route   GET /api/v1/marketing/utm-links/:id
 * @access  Privado
 */
exports.getUtmLink = asyncHandler(async (req, res, next) => {
  const utmLink = await UtmLink.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  if (!utmLink) {
    return next(new ErrorResponse(`No se encontró el enlace UTM con id ${req.params.id}`, 404));
  }
  
  // Verificar propiedad o permisos de administrador
  if (utmLink.createdBy._id.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'manager') {
    return next(new ErrorResponse('No tienes permiso para acceder a este enlace UTM', 403));
  }
  
  // Incluir URLs completas
  const processedLink = {
    ...utmLink.toObject(),
    trackedUrl: utmLink.generateTrackedUrl(),
    shortUrl: utmLink.getShortenedUrl()
  };
  
  res.status(200).json({
    success: true,
    data: processedLink
  });
});

/**
 * @desc    Actualizar un enlace UTM
 * @route   PUT /api/v1/marketing/utm-links/:id
 * @access  Privado
 */
exports.updateUtmLink = asyncHandler(async (req, res, next) => {
  let utmLink = await UtmLink.findById(req.params.id);
  
  if (!utmLink) {
    return next(new ErrorResponse(`No se encontró el enlace UTM con id ${req.params.id}`, 404));
  }
  
  // Verificar propiedad o permisos de administrador
  if (utmLink.createdBy.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'manager') {
    return next(new ErrorResponse('No tienes permiso para actualizar este enlace UTM', 403));
  }
  
  // No permitir cambiar el creador
  if (req.body.createdBy) {
    delete req.body.createdBy;
  }
  
  // Actualizar el enlace
  utmLink = await UtmLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Incluir URLs completas
  const processedLink = {
    ...utmLink.toObject(),
    trackedUrl: utmLink.generateTrackedUrl(),
    shortUrl: utmLink.getShortenedUrl()
  };
  
  res.status(200).json({
    success: true,
    data: processedLink
  });
});

/**
 * @desc    Eliminar un enlace UTM
 * @route   DELETE /api/v1/marketing/utm-links/:id
 * @access  Privado
 */
exports.deleteUtmLink = asyncHandler(async (req, res, next) => {
  const utmLink = await UtmLink.findById(req.params.id);
  
  if (!utmLink) {
    return next(new ErrorResponse(`No se encontró el enlace UTM con id ${req.params.id}`, 404));
  }
  
  // Verificar propiedad o permisos de administrador
  if (utmLink.createdBy.toString() !== req.user.id && 
      req.user.role !== 'admin' && 
      req.user.role !== 'manager') {
    return next(new ErrorResponse('No tienes permiso para eliminar este enlace UTM', 403));
  }
  
  await utmLink.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Registrar clic en un enlace UTM acortado
 * @route   GET /api/v1/marketing/l/:shortCode
 * @access  Público
 */
exports.trackUtmClick = asyncHandler(async (req, res, next) => {
  const { shortCode } = req.params;
  
  // Buscar el enlace por su código corto
  const utmLink = await UtmLink.findOne({ shortCode });
  
  if (!utmLink) {
    return next(new ErrorResponse('Enlace no encontrado', 404));
  }
  
  // Verificar si el enlace está activo y no expirado
  if (!utmLink.isActive || (utmLink.expiresAt && utmLink.expiresAt < Date.now())) {
    return next(new ErrorResponse('Este enlace ya no está disponible', 410));
  }
  
  // Recopilar información del visitante
  const visitorData = {
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer || ''
  };
  
  // Registrar el clic
  await utmLink.recordClick(visitorData);
  
  // Redirigir al usuario a la URL de destino con los parámetros UTM
  res.redirect(utmLink.generateTrackedUrl());
});

/**
 * @desc    Obtener estadísticas de enlaces UTM
 * @route   GET /api/v1/marketing/utm-links/stats
 * @access  Privado
 */
exports.getUtmStats = asyncHandler(async (req, res, next) => {
  // Si es admin y se proporciona un usuario específico, filtrar por ese usuario
  const userId = req.user.role === 'admin' && req.query.userId 
    ? req.query.userId 
    : req.user.id;
  
  // Obtener estadísticas agrupadas por fuente
  const sourceStats = await UtmLink.getStatsBySource(userId);
  
  // Obtener estadísticas agrupadas por campaña
  const campaignStats = await UtmLink.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: "$utmCampaign",
      totalLinks: { $sum: 1 },
      totalClicks: { $sum: "$clicks" },
      totalConversions: { $sum: "$conversions" },
      averageConversionRate: { 
        $avg: { 
          $cond: [
            { $gt: ["$clicks", 0] },
            { $multiply: [{ $divide: ["$conversions", "$clicks"] }, 100] },
            0
          ]
        }
      }
    }},
    { $sort: { totalClicks: -1 } }
  ]);
  
  // Obtener estadísticas generales
  const overallStats = await UtmLink.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
    { $group: {
      _id: null,
      totalLinks: { $sum: 1 },
      activeLinks: { $sum: { $cond: ["$isActive", 1, 0] } },
      totalClicks: { $sum: "$clicks" },
      uniqueClicks: { $sum: "$uniqueClicks" },
      totalConversions: { $sum: "$conversions" },
      averageConversionRate: { 
        $avg: { 
          $cond: [
            { $gt: ["$clicks", 0] },
            { $multiply: [{ $divide: ["$conversions", "$clicks"] }, 100] },
            0
          ]
        }
      }
    }},
    { $project: {
      _id: 0,
      totalLinks: 1,
      activeLinks: 1,
      totalClicks: 1,
      uniqueClicks: 1,
      totalConversions: 1,
      averageConversionRate: 1
    }}
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      overall: overallStats.length > 0 ? overallStats[0] : {
        totalLinks: 0,
        activeLinks: 0,
        totalClicks: 0,
        uniqueClicks: 0,
        totalConversions: 0,
        averageConversionRate: 0
      },
      bySource: sourceStats,
      byCampaign: campaignStats
    }
  });
});

// ---------- CÓDIGOS PROMOCIONALES ----------

/**
 * @desc    Crear un nuevo código promocional
 * @route   POST /api/v1/marketing/promo-codes
 * @access  Privado
 */
exports.createPromoCode = asyncHandler(async (req, res, next) => {
  // Asignar el usuario actual como creador
  req.body.createdBy = req.user.id;
  
  // Verificar permisos para crear códigos promocionales
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(
      new ErrorResponse('No tienes permiso para crear códigos promocionales', 403)
    );
  }
  
  // Validar campos obligatorios
  const { name, type, value } = req.body;
  if (!name || !type || value === undefined) {
    return next(
      new ErrorResponse('Por favor proporciona nombre, tipo y valor para el código promocional', 400)
    );
  }
  
  // Crear el código promocional
  const promoCode = await PromoCode.create(req.body);
  
  res.status(201).json({
    success: true,
    data: promoCode
  });
});

/**
 * @desc    Obtener todos los códigos promocionales
 * @route   GET /api/v1/marketing/promo-codes
 * @access  Privado
 */
exports.getPromoCodes = asyncHandler(async (req, res, next) => {
  // Solo admin o manager pueden ver códigos promocionales
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(
      new ErrorResponse('No tienes permiso para ver códigos promocionales', 403)
    );
  }
  
  // Construir filtros
  const query = {};
  
  if (req.query.isActive) {
    query.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.type) {
    query.type = req.query.type;
  }
  
  if (req.query.code) {
    query.code = { $regex: req.query.code, $options: 'i' };
  }
  
  // Filtro de validez temporal
  if (req.query.valid === 'true') {
    const now = new Date();
    query.startDate = { $lte: now };
    query.$or = [
      { endDate: { $exists: false } },
      { endDate: { $gt: now } }
    ];
  } else if (req.query.valid === 'false') {
    const now = new Date();
    query.$or = [
      { startDate: { $gt: now } },
      { endDate: { $exists: true, $lte: now } }
    ];
  }
  
  // Opciones de paginación
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Opciones de ordenamiento
  const sort = {};
  if (req.query.sort) {
    const sortField = req.query.sort.startsWith('-') 
      ? req.query.sort.substring(1) 
      : req.query.sort;
    const sortDirection = req.query.sort.startsWith('-') ? -1 : 1;
    sort[sortField] = sortDirection;
  } else {
    sort.createdAt = -1; // Por defecto, ordenar por fecha descendente
  }
  
  // Ejecutar consulta paginada
  const total = await PromoCode.countDocuments(query);
  const promoCodes = await PromoCode.find(query)
    .sort(sort)
    .skip(startIndex)
    .limit(limit)
    .populate('createdBy', 'name email');
  
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
    count: promoCodes.length,
    pagination: {
      ...pagination,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    },
    data: promoCodes
  });
});

/**
 * @desc    Obtener un código promocional específico
 * @route   GET /api/v1/marketing/promo-codes/:id
 * @access  Privado
 */
exports.getPromoCode = asyncHandler(async (req, res, next) => {
  // Solo admin o manager pueden ver códigos promocionales
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(
      new ErrorResponse('No tienes permiso para ver códigos promocionales', 403)
    );
  }
  
  const promoCode = await PromoCode.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  if (!promoCode) {
    return next(new ErrorResponse(`No se encontró el código promocional con id ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: promoCode
  });
});

/**
 * @desc    Actualizar un código promocional
 * @route   PUT /api/v1/marketing/promo-codes/:id
 * @access  Privado
 */
exports.updatePromoCode = asyncHandler(async (req, res, next) => {
  // Solo admin o manager pueden actualizar códigos promocionales
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(
      new ErrorResponse('No tienes permiso para actualizar códigos promocionales', 403)
    );
  }
  
  // No permitir cambiar el creador
  if (req.body.createdBy) {
    delete req.body.createdBy;
  }
  
  let promoCode = await PromoCode.findById(req.params.id);
  
  if (!promoCode) {
    return next(new ErrorResponse(`No se encontró el código promocional con id ${req.params.id}`, 404));
  }
  
  // Actualizar el código promocional
  promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: promoCode
  });
});

/**
 * @desc    Eliminar un código promocional
 * @route   DELETE /api/v1/marketing/promo-codes/:id
 * @access  Privado
 */
exports.deletePromoCode = asyncHandler(async (req, res, next) => {
  // Solo admin o manager pueden eliminar códigos promocionales
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(
      new ErrorResponse('No tienes permiso para eliminar códigos promocionales', 403)
    );
  }
  
  const promoCode = await PromoCode.findById(req.params.id);
  
  if (!promoCode) {
    return next(new ErrorResponse(`No se encontró el código promocional con id ${req.params.id}`, 404));
  }
  
  await promoCode.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Verificar validez de un código promocional
 * @route   POST /api/v1/marketing/promo-codes/verify
 * @access  Público
 */
exports.verifyPromoCode = asyncHandler(async (req, res, next) => {
  const { code, amount, productId, productType } = req.body;
  
  if (!code) {
    return next(new ErrorResponse('Se requiere el código promocional', 400));
  }
  
  // Buscar el código promocional (case-insensitive)
  const promoCode = await PromoCode.findOne({ 
    code: { $regex: new RegExp(`^${code}$`, 'i') } 
  });
  
  if (!promoCode) {
    return res.status(200).json({
      success: true,
      data: {
        valid: false,
        message: 'Código promocional no encontrado'
      }
    });
  }
  
  // Verificar validez del código para el monto y usuario proporcionados
  const userId = req.user ? req.user.id : null;
  const isValid = promoCode.isValidForUse(userId, amount);
  
  if (!isValid) {
    // Determinar razón de invalidez
    let reason = 'El código promocional no es válido';
    
    if (!promoCode.isActive) {
      reason = 'Este código promocional está desactivado';
    } else if (promoCode.isExpired) {
      reason = 'Este código promocional ha expirado';
    } else if (promoCode.usageLimit && promoCode.usageLimit.total && promoCode.currentUsage >= promoCode.usageLimit.total) {
      reason = 'Este código promocional ha alcanzado su límite de uso';
    } else if (amount && promoCode.minimumAmount && amount < promoCode.minimumAmount) {
      reason = `Se requiere un monto mínimo de ${promoCode.minimumAmount} ${promoCode.currency}`;
    }
    
    return res.status(200).json({
      success: true,
      data: {
        valid: false,
        message: reason
      }
    });
  }
  
  // Si hay un producto específico, verificar si aplica
  if (productId && promoCode.applicableTo && promoCode.applicableTo.productIds && promoCode.applicableTo.productIds.length > 0) {
    if (!promoCode.applicableTo.productIds.includes(productId)) {
      return res.status(200).json({
        success: true,
        data: {
          valid: false,
          message: 'Este código no aplica para el producto seleccionado'
        }
      });
    }
  }
  
  // Si hay un tipo de producto, verificar si aplica
  if (productType && promoCode.applicableTo && promoCode.applicableTo.productTypes && promoCode.applicableTo.productTypes.length > 0) {
    if (!promoCode.applicableTo.productTypes.includes('all') && !promoCode.applicableTo.productTypes.includes(productType)) {
      return res.status(200).json({
        success: true,
        data: {
          valid: false,
          message: 'Este código no aplica para este tipo de producto'
        }
      });
    }
  }
  
  // Calcular el descuento si se proporciona un monto
  let discountInfo = null;
  if (amount) {
    const options = {
      userId,
      productId,
      productType,
    };
    
    discountInfo = promoCode.calculateDiscount(amount, options);
  }
  
  res.status(200).json({
    success: true,
    data: {
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      description: promoCode.description,
      discount: discountInfo
    }
  });
});

/**
 * @desc    Registrar uso de un código promocional
 * @route   POST /api/v1/marketing/promo-codes/:id/use
 * @access  Privado
 */
exports.usePromoCode = asyncHandler(async (req, res, next) => {
  const { orderId, discountAmount } = req.body;
  
  if (!orderId || discountAmount === undefined) {
    return next(new ErrorResponse('Se requiere ID de orden y monto de descuento', 400));
  }
  
  const promoCode = await PromoCode.findById(req.params.id);
  
  if (!promoCode) {
    return next(new ErrorResponse(`No se encontró el código promocional con id ${req.params.id}`, 404));
  }
  
  // Verificar si el código es válido para usar
  const isValid = promoCode.isValidForUse(req.user.id);
  if (!isValid) {
    return next(new ErrorResponse('Este código promocional no es válido o ha expirado', 400));
  }
  
  // Registrar el uso
  await promoCode.recordUsage(req.user.id, orderId, discountAmount);
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Código promocional utilizado exitosamente',
      promoCode
    }
  });
});

/**
 * @desc    Obtener estadísticas de códigos promocionales
 * @route   GET /api/v1/marketing/promo-codes/stats
 * @access  Privado (admin/manager)
 */
exports.getPromoCodeStats = asyncHandler(async (req, res, next) => {
  // Solo admin o manager pueden ver estadísticas
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return next(
      new ErrorResponse('No tienes permiso para ver estadísticas de códigos promocionales', 403)
    );
  }
  
  // Estadísticas generales
  const generalStats = await PromoCode.aggregate([
    { $group: {
      _id: null,
      totalCodes: { $sum: 1 },
      activeCodes: { $sum: { $cond: ["$isActive", 1, 0] } },
      totalUses: { $sum: "$currentUsage" },
      averageDiscount: { $avg: "$value" }
    }}
  ]);
  
  // Estadísticas por tipo de descuento
  const typeStats = await PromoCode.aggregate([
    { $group: {
      _id: "$type",
      count: { $sum: 1 },
      avgValue: { $avg: "$value" },
      totalUses: { $sum: "$currentUsage" }
    }},
    { $sort: { count: -1 } }
  ]);
  
  // Top códigos más utilizados
  const topCodes = await PromoCode.aggregate([
    { $sort: { currentUsage: -1 } },
    { $limit: 10 },
    { $project: {
      code: 1,
      name: 1,
      type: 1,
      value: 1,
      currentUsage: 1,
      usageLimit: 1,
      usagePercentage: { 
        $cond: [
          { $gt: ["$usageLimit.total", 0] },
          { $multiply: [{ $divide: ["$currentUsage", "$usageLimit.total"] }, 100] },
          null
        ]
      }
    }}
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      general: generalStats.length > 0 ? generalStats[0] : {
        totalCodes: 0,
        activeCodes: 0,
        totalUses: 0,
        averageDiscount: 0
      },
      byType: typeStats,
      topCodes
    }
  });
});