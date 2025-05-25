// src/models/PromoCode.js
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Esquema para códigos promocionales en EQHuma
 * Permite crear y gestionar promociones, descuentos y ofertas especiales
 */
const PromoCodeSchema = new mongoose.Schema({
  // Información básica del código promocional
  code: {
    type: String,
    required: [true, 'Por favor ingresa un código promocional'],
    trim: true,
    uppercase: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre para la promoción'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    trim: true
  },
  
  // Tipo y valor del descuento/promoción
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_product', 'custom'],
    default: 'percentage',
    required: [true, 'Por favor especifica el tipo de promoción']
  },
  value: {
    type: Number,
    required: [true, 'Por favor especifica el valor del descuento/beneficio'],
    min: [0, 'El valor no puede ser negativo']
  },
  currency: {
    type: String,
    default: 'MXN',
    trim: true
  },
  
  // Productos o servicios aplicables
  applicableTo: {
    productTypes: [{
      type: String,
      enum: ['all', 'subscription', 'one_time', 'service', 'product', 'api_access'],
      default: 'all'
    }],
    productIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    categories: [{
      type: String,
      trim: true
    }]
  },
  
  // Restricciones y validez
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  usageLimit: {
    perUser: {
      type: Number,
      default: 1
    },
    total: Number
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  minimumAmount: {
    type: Number,
    min: 0
  },
  maximumAmount: {
    type: Number,
    min: 0
  },
  
  // Restricciones de usuarios
  userRestrictions: {
    allowedUserTypes: [{
      type: String,
      enum: ['all', 'new', 'returning', 'premium', 'basic']
    }],
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Seguimiento de uso
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    discountAmount: Number
  }],
  
  // Tracking de marketing
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Datos de creación y administración
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
PromoCodeSchema.index({ code: 1 });
PromoCodeSchema.index({ startDate: 1, endDate: 1 });
PromoCodeSchema.index({ isActive: 1 });
PromoCodeSchema.index({ "usageHistory.user": 1 });

// Middleware para actualizar la fecha de modificación
PromoCodeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para generar código promocional automático si no se proporciona
PromoCodeSchema.pre('save', function(next) {
  if (this.isNew && !this.code) {
    // Generar un código promocional único de 8 caracteres
    const prefix = 'EQ';
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.code = `${prefix}${randomPart}`;
  }
  next();
});

// Método para verificar si un código promocional es válido para un usuario y monto
PromoCodeSchema.methods.isValidForUse = function(userId, amount = null) {
  const now = new Date();
  
  // Verificar si está activo
  if (!this.isActive) return false;
  
  // Verificar fechas de validez
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  
  // Verificar límite de uso total
  if (this.usageLimit && this.usageLimit.total && this.currentUsage >= this.usageLimit.total) return false;
  
  // Verificar límite de uso por usuario
  if (userId && this.usageLimit && this.usageLimit.perUser) {
    const userUsage = this.usageHistory.filter(
      history => history.user && history.user.toString() === userId.toString()
    ).length;
    
    if (userUsage >= this.usageLimit.perUser) return false;
  }
  
  // Verificar monto mínimo/máximo si se proporciona
  if (amount !== null) {
    if (this.minimumAmount && amount < this.minimumAmount) return false;
    if (this.maximumAmount && amount > this.maximumAmount) return false;
  }
  
  return true;
};

// Método para aplicar el código promocional y calcular el descuento
PromoCodeSchema.methods.calculateDiscount = function(amount, options = {}) {
  if (!this.isValidForUse(options.userId, amount)) {
    return { valid: false, originalAmount: amount, discountedAmount: amount, discount: 0 };
  }
  
  let discount = 0;
  
  // Calcular el descuento según el tipo
  switch (this.type) {
    case 'percentage':
      discount = (amount * this.value) / 100;
      break;
    case 'fixed_amount':
      discount = Math.min(this.value, amount); // No descontar más del monto total
      break;
    case 'free_product':
      // Lógica para productos gratuitos - simplificada aquí
      if (options.hasProduct && options.productPrice) {
        discount = options.productPrice;
      }
      break;
    case 'custom':
      // Aquí se implementaría la lógica personalizada si es necesario
      if (options.customCalculation) {
        discount = options.customCalculation(amount, this.value);
      } else {
        discount = this.value;
      }
      break;
  }
  
  // Asegurar que el descuento no exceda el monto total
  discount = Math.min(discount, amount);
  
  return {
    valid: true,
    originalAmount: amount,
    discountedAmount: amount - discount,
    discount
  };
};

// Método para registrar el uso de un código promocional
PromoCodeSchema.methods.recordUsage = async function(userId, orderId, discountAmount) {
  // Añadir registro al historial
  this.usageHistory.push({
    user: userId,
    usedAt: new Date(),
    orderId,
    discountAmount
  });
  
  // Incrementar contador de uso
  this.currentUsage += 1;
  
  await this.save();
  return this;
};

// Método para desactivar un código promocional
PromoCodeSchema.methods.deactivate = async function() {
  this.isActive = false;
  await this.save();
  return this;
};

// Virtual para verificar si el código ha expirado
PromoCodeSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false;
  return this.endDate < new Date();
});

// Virtual para calcular el porcentaje de uso
PromoCodeSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimit || !this.usageLimit.total) return null;
  return (this.currentUsage / this.usageLimit.total) * 100;
});

// Método estático para encontrar promociones activas por producto
PromoCodeSchema.statics.findActiveByProduct = function(productId, productType) {
  return this.find({
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gt: new Date() } }
    ],
    $or: [
      { 'applicableTo.productTypes': 'all' },
      { 'applicableTo.productTypes': productType },
      { 'applicableTo.productIds': productId }
    ]
  });
};

module.exports = mongoose.model('PromoCode', PromoCodeSchema);