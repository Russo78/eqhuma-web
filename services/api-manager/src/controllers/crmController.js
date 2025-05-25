// src/controllers/crmController.js
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("express-async-handler");
const Prospect = require("../models/Prospect");
const ProspectSegment = require("../models/ProspectSegment");
const mongoose = require("mongoose");

// CRM Prospects Controllers
exports.createProspect = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;
  const prospect = await Prospect.create(req.body);
  res.status(201).json({ success: true, data: prospect });
});

exports.getProspects = asyncHandler(async (req, res, next) => {
  let query = {};
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    query = { $or: [{ owner: req.user.id }, { assignedTo: req.user.id }, { "sharedWith.user": req.user.id }] };
  }
  
  // Aplicar filtros adicionales
  if (req.query.status) query.status = req.query.status;
  if (req.query.source) query.source = req.query.source;
  if (req.query.segment) query.segment = req.query.segment;
  
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
      { phone: searchRegex }
    ];
  }
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await Prospect.countDocuments(query);
  const prospects = await Prospect.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("sharedWith.user", "name email");
    
  res.status(200).json({
    success: true,
    count: prospects.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    },
    data: prospects
  });
});

exports.getProspect = asyncHandler(async (req, res, next) => {
  const prospect = await Prospect.findById(req.params.id)
    .populate("owner", "name email")
    .populate("assignedTo", "name email")
    .populate("sharedWith.user", "name email")
    .populate("notes.user", "name email");
    
  if (!prospect) {
    return next(new ErrorResponse(`Prospecto no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de acceso
  const canAccess = 
    prospect.owner.toString() === req.user.id || 
    (prospect.assignedTo && prospect.assignedTo.toString() === req.user.id) ||
    prospect.sharedWith.some(s => s.user.toString() === req.user.id) ||
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canAccess) {
    return next(new ErrorResponse(`No tienes permiso para acceder a este prospecto`, 403));
  }
  
  res.status(200).json({ success: true, data: prospect });
});

exports.updateProspect = asyncHandler(async (req, res, next) => {
  let prospect = await Prospect.findById(req.params.id);
  if (!prospect) {
    return next(new ErrorResponse(`Prospecto no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de edición
  const canEdit = 
    prospect.owner.toString() === req.user.id || 
    (prospect.assignedTo && prospect.assignedTo.toString() === req.user.id) ||
    prospect.sharedWith.some(s => s.user.toString() === req.user.id && s.permission === 'write') ||
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canEdit) {
    return next(new ErrorResponse(`No tienes permiso para editar este prospecto`, 403));
  }
  
  // Registrar la actualización en el historial
  const fieldsChanged = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (prospect[key] !== value && key !== 'history' && key !== 'updatedAt') {
      fieldsChanged[key] = {
        oldValue: prospect[key],
        newValue: value
      };
    }
  }
  
  if (Object.keys(fieldsChanged).length > 0) {
    prospect.history = prospect.history || [];
    prospect.history.unshift({
      user: req.user.id,
      timestamp: Date.now(),
      changes: fieldsChanged
    });
  }
  
  prospect = await Prospect.findByIdAndUpdate(
    req.params.id, 
    { ...req.body, history: prospect.history },
    {
      new: true,
      runValidators: true
    }
  )
  .populate("owner", "name email")
  .populate("assignedTo", "name email")
  .populate("sharedWith.user", "name email");
  
  res.status(200).json({ success: true, data: prospect });
});

exports.deleteProspect = asyncHandler(async (req, res, next) => {
  const prospect = await Prospect.findById(req.params.id);
  if (!prospect) {
    return next(new ErrorResponse(`Prospecto no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de eliminación (solo propietario o admin)
  const canDelete = 
    prospect.owner.toString() === req.user.id || 
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canDelete) {
    return next(new ErrorResponse(`No tienes permiso para eliminar este prospecto`, 403));
  }
  
  await prospect.remove();
  res.status(200).json({ success: true, data: {} });
});

// Compartir prospecto
exports.shareProspect = asyncHandler(async (req, res, next) => {
  const { userId, permission } = req.body;
  
  if (!userId) {
    return next(new ErrorResponse('Se requiere un ID de usuario', 400));
  }
  
  let prospect = await Prospect.findById(req.params.id);
  
  if (!prospect) {
    return next(new ErrorResponse(`No se encontró el prospecto con id ${req.params.id}`, 404));
  }
  
  // Verificar si el usuario es propietario o administrador
  const isOwnerOrAdmin = 
    prospect.owner.toString() === req.user.id || 
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!isOwnerOrAdmin) {
    return next(new ErrorResponse(`No tienes permiso para compartir este prospecto`, 403));
  }
  
  // Verificar si ya está compartido con este usuario
  const existingShare = prospect.sharedWith.find(
    share => share.user.toString() === userId
  );
  
  if (existingShare) {
    // Actualizar permisos existentes
    existingShare.permission = permission || 'read';
  } else {
    // Agregar nuevo usuario compartido
    prospect.sharedWith.push({
      user: userId,
      permission: permission || 'read'
    });
  }
  
  await prospect.save();
  
  // Obtener prospecto actualizado con datos de usuario populados
  prospect = await Prospect.findById(prospect._id)
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email')
    .populate('sharedWith.user', 'name email');
  
  res.status(200).json({
    success: true,
    data: prospect
  });
});

// Dejar de compartir prospecto
exports.unshareProspect = asyncHandler(async (req, res, next) => {
  let prospect = await Prospect.findById(req.params.id);
  
  if (!prospect) {
    return next(new ErrorResponse(`No se encontró el prospecto con id ${req.params.id}`, 404));
  }
  
  // Verificar si el usuario es propietario o administrador
  const isOwnerOrAdmin = 
    prospect.owner.toString() === req.user.id || 
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!isOwnerOrAdmin) {
    return next(new ErrorResponse(`No tienes permiso para modificar los permisos de este prospecto`, 403));
  }
  
  // Filtrar el usuario especificado
  prospect.sharedWith = prospect.sharedWith.filter(
    share => share.user.toString() !== req.params.userId
  );
  
  await prospect.save();
  
  // Obtener prospecto actualizado con datos de usuario populados
  prospect = await Prospect.findById(prospect._id)
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email')
    .populate('sharedWith.user', 'name email');
  
  res.status(200).json({
    success: true,
    data: prospect
  });
});

// Asignar prospecto
exports.assignProspect = asyncHandler(async (req, res, next) => {
  const { assignedTo } = req.body;
  
  if (!assignedTo) {
    return next(new ErrorResponse('Se requiere un ID de usuario para la asignación', 400));
  }
  
  let prospect = await Prospect.findById(req.params.id);
  
  if (!prospect) {
    return next(new ErrorResponse(`No se encontró el prospecto con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos (solo propietario o admin puede asignar)
  const canAssign = 
    prospect.owner.toString() === req.user.id || 
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canAssign) {
    return next(new ErrorResponse(`No tienes permiso para asignar este prospecto`, 403));
  }
  
  // Actualizar asignación
  prospect.assignedTo = assignedTo;
  prospect.assignedAt = Date.now();
  
  // Registrar cambio en historial
  prospect.history = prospect.history || [];
  prospect.history.unshift({
    user: req.user.id,
    timestamp: Date.now(),
    changes: {
      assignedTo: {
        oldValue: prospect.assignedTo || null,
        newValue: assignedTo
      }
    }
  });
  
  await prospect.save();
  
  // Obtener prospecto actualizado con datos de usuario populados
  prospect = await Prospect.findById(prospect._id)
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email')
    .populate('sharedWith.user', 'name email');
  
  res.status(200).json({
    success: true,
    data: prospect
  });
});

// Agregar nota
exports.addProspectNote = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  
  if (!content) {
    return next(new ErrorResponse('Se requiere contenido para la nota', 400));
  }
  
  let prospect = await Prospect.findById(req.params.id);
  
  if (!prospect) {
    return next(new ErrorResponse(`No se encontró el prospecto con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de acceso
  const canAccess = 
    prospect.owner.toString() === req.user.id || 
    (prospect.assignedTo && prospect.assignedTo.toString() === req.user.id) ||
    prospect.sharedWith.some(s => s.user.toString() === req.user.id) ||
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canAccess) {
    return next(new ErrorResponse(`No tienes permiso para acceder a este prospecto`, 403));
  }
  
  // Agregar nota
  prospect.notes = prospect.notes || [];
  prospect.notes.unshift({
    content,
    user: req.user.id,
    createdAt: Date.now()
  });
  
  await prospect.save();
  
  // Obtener prospecto actualizado con datos de usuario populados
  prospect = await Prospect.findById(prospect._id)
    .populate('owner', 'name email')
    .populate('assignedTo', 'name email')
    .populate('sharedWith.user', 'name email')
    .populate('notes.user', 'name email');
  
  res.status(200).json({
    success: true,
    data: prospect
  });
});

// CRM Segments Controllers
exports.createSegment = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;
  req.body.createdBy = req.user.id;
  const segment = await ProspectSegment.create(req.body);
  await segment.updateStats();
  res.status(201).json({ success: true, data: segment });
});

exports.getSegments = asyncHandler(async (req, res, next) => {
  let query = {};
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    query = { $or: [{ owner: req.user.id }, { isPublic: true }, { "sharedWith.user": req.user.id }] };
  }
  
  // Filtros adicionales
  if (req.query.isPublic) {
    query.isPublic = req.query.isPublic === 'true';
  }
  
  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: 'i' };
  }
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const total = await ProspectSegment.countDocuments(query);
  
  const segments = await ProspectSegment.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit)
    .populate("owner", "name email")
    .populate("createdBy", "name email")
    .populate("sharedWith.user", "name email");
  
  res.status(200).json({ 
    success: true, 
    count: segments.length, 
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    },
    data: segments 
  });
});

exports.getSegment = asyncHandler(async (req, res, next) => {
  const segment = await ProspectSegment.findById(req.params.id)
    .populate("owner", "name email")
    .populate("createdBy", "name email")
    .populate("sharedWith.user", "name email");
  
  if (!segment) {
    return next(new ErrorResponse(`Segmento no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de acceso
  const canAccess = 
    segment.isPublic || 
    segment.owner.toString() === req.user.id || 
    segment.sharedWith.some(s => s.user.toString() === req.user.id) ||
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canAccess) {
    return next(new ErrorResponse(`No tienes permiso para acceder a este segmento`, 403));
  }
  
  res.status(200).json({ success: true, data: segment });
});

exports.updateSegment = asyncHandler(async (req, res, next) => {
  let segment = await ProspectSegment.findById(req.params.id);
  if (!segment) {
    return next(new ErrorResponse(`Segmento no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de edición
  const canEdit = 
    segment.owner.toString() === req.user.id || 
    segment.sharedWith.some(s => s.user.toString() === req.user.id && s.permission === 'write') ||
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canEdit) {
    return next(new ErrorResponse(`No tienes permiso para editar este segmento`, 403));
  }
  
  segment = await ProspectSegment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  .populate("owner", "name email")
  .populate("createdBy", "name email")
  .populate("sharedWith.user", "name email");
  
  // Actualizar estadísticas si cambiaron los criterios
  if (req.body.criteria) {
    await segment.updateStats();
  }
  
  res.status(200).json({ success: true, data: segment });
});

exports.deleteSegment = asyncHandler(async (req, res, next) => {
  const segment = await ProspectSegment.findById(req.params.id);
  if (!segment) {
    return next(new ErrorResponse(`Segmento no encontrado con id ${req.params.id}`, 404));
  }
  
  // Verificar permisos de eliminación (solo propietario o admin)
  const canDelete = 
    segment.owner.toString() === req.user.id || 
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!canDelete) {
    return next(new ErrorResponse(`No tienes permiso para eliminar este segmento`, 403));
  }
  
  await segment.remove();
  res.status(200).json({ success: true, data: {} });
});

// Compartir segmento
exports.shareSegment = asyncHandler(async (req, res, next) => {
  const { userId, permission } = req.body;
  
  if (!userId) {
    return next(new ErrorResponse('Se requiere un ID de usuario', 400));
  }
  
  let segment = await ProspectSegment.findById(req.params.id);
  
  if (!segment) {
    return next(new ErrorResponse(`No se encontró el segmento con id ${req.params.id}`, 404));
  }
  
  // Verificar si el usuario es propietario o administrador
  const isOwnerOrAdmin = 
    segment.owner.toString() === req.user.id || 
    req.user.role === 'admin' || 
    req.user.role === 'manager';
  
  if (!isOwnerOrAdmin) {
    return next(new ErrorResponse(`No tienes permiso para compartir este segmento`, 403));
  }
  
  // Verificar si ya está compartido con este usuario
  const existingShare = segment.sharedWith.find(
    share => share.user.toString() === userId
  );
  
  if (existingShare) {
    // Actualizar permisos existentes
    existingShare.permission = permission || 'read';
  } else {
    // Agregar nuevo usuario compartido
    segment.sharedWith.push({
      user: userId,
      permission: permission || 'read'
    });
  }
  
  await segment.save();
  
  // Obtener segmento actualizado con datos de usuario populados
  segment = await ProspectSegment.findById(segment._id)
    .populate('owner', 'name email')
    .populate('createdBy', 'name email')
    .populate('sharedWith.user', 'name email');
  
  res.status(200).json({
    success: true,
    data: segment
  });
});
