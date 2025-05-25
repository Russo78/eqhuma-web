// src/models/ApiInstance.js
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Esquema para instancias de API en EQHuma
 * Gestiona las claves de API, configuraciones y límites de uso
 */
const ApiInstanceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre para la API'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    trim: true
  },
  // Usuario propietario de esta instancia de API
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Identificadores de acceso a la API
  apiKey: {
    type: String,
    unique: true,
    select: false // No incluir por defecto en las consultas
  },
  apiSecret: {
    type: String,
    unique: true,
    select: false // No incluir por defecto en las consultas
  },
  // Configuración y límites
  isActive: {
    type: Boolean,
    default: true
  },
  requiresSecret: {
    type: Boolean,
    default: true,
    description: 'Determina si las operaciones requieren la API Secret además de la Key'
  },
  usageLimit: {
    type: Number,
    default: 1000,
    description: 'Límite de llamadas a la API'
  },
  usageCount: {
    type: Number,
    default: 0,
    description: 'Contador de uso actual'
  },
  // Configuración de webhook para notificaciones
  webhook: {
    url: String,
    events: [String], // Eventos que activan el webhook
    secret: String,
    isActive: {
      type: Boolean,
      default: false
    },
    lastTriggered: Date,
    failCount: {
      type: Number,
      default: 0
    }
  },
  // Configuración de dominio permitido (CORS)
  allowedDomains: [{
    type: String,
    trim: true
  }],
  // Datos de auditoría
  lastUsed: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejor rendimiento
ApiInstanceSchema.index({ apiKey: 1 });
ApiInstanceSchema.index({ user: 1 });
ApiInstanceSchema.index({ createdAt: 1 });
ApiInstanceSchema.index({ expiresAt: 1 });

// Middleware para actualizar la fecha de modificación
ApiInstanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para generar API Key y Secret antes de guardar un nuevo documento
ApiInstanceSchema.pre('save', function(next) {
  // Solo generar si es un documento nuevo o si se solicita regeneración
  if (!this.isNew && !this.isModified('apiKey') && !this.isModified('apiSecret')) {
    return next();
  }
  
  // Generar API Key si es necesario
  if (!this.apiKey || this.isModified('apiKey')) {
    // Formato: prefijo_timestamp_random
    const prefix = 'eqhuma';
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(16).toString('hex');
    this.apiKey = `${prefix}_${timestamp}_${random}`;
  }
  
  // Generar API Secret si es necesario
  if (!this.apiSecret || this.isModified('apiSecret')) {
    this.apiSecret = crypto.randomBytes(32).toString('hex');
  }
  
  next();
});

// Método para verificar si una instancia de API puede ser usada
ApiInstanceSchema.methods.canBeUsed = function() {
  // Verificar si está activa
  if (!this.isActive) return false;
  
  // Verificar expiración
  if (this.expiresAt && this.expiresAt < Date.now()) return false;
  
  // Verificar límite de uso
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  
  return true;
};

// Método para registrar uso de la API
ApiInstanceSchema.methods.logUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = Date.now();
  await this.save();
};

// Método para generar un nuevo par de llaves
ApiInstanceSchema.methods.regenerateKeys = async function(regenerateSecret = false) {
  // Generar una nueva API Key
  const prefix = 'eqhuma';
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  this.apiKey = `${prefix}_${timestamp}_${random}`;
  
  // Regenerar Secret si se solicita
  if (regenerateSecret) {
    this.apiSecret = crypto.randomBytes(32).toString('hex');
  }
  
  await this.save();
  return { apiKey: this.apiKey, apiSecret: regenerateSecret ? this.apiSecret : undefined };
};

// Método para configurar webhook
ApiInstanceSchema.methods.setWebhook = async function(url, events = [], secret = null) {
  this.webhook = {
    url,
    events: Array.isArray(events) ? events : [events],
    secret: secret || crypto.randomBytes(16).toString('hex'),
    isActive: !!url,
    lastTriggered: null,
    failCount: 0
  };
  
  await this.save();
  return this.webhook;
};

// Virtual para obtener estadísticas de uso
ApiInstanceSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimit) return 0;
  return (this.usageCount / this.usageLimit) * 100;
});

// Relaciones virtuales
ApiInstanceSchema.virtual('clicks', {
  ref: 'ApiClick',
  localField: '_id',
  foreignField: 'apiInstance',
  justOne: false
});

module.exports = mongoose.model('ApiInstance', ApiInstanceSchema);