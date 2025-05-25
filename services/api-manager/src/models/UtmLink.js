// src/models/UtmLink.js
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Esquema para enlaces UTM y seguimiento de marketing
 * Permite crear, gestionar y realizar seguimiento de enlaces con parámetros UTM
 */
const UtmLinkSchema = new mongoose.Schema({
  // Información básica del enlace
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre para el enlace'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    trim: true
  },
  destinationUrl: {
    type: String,
    required: [true, 'Por favor ingresa la URL de destino'],
    trim: true
  },
  shortCode: {
    type: String,
    unique: true,
    trim: true,
    index: true
  },
  
  // Parámetros UTM
  utmSource: {
    type: String,
    required: [true, 'Por favor especifica la fuente (utm_source)'],
    trim: true
  },
  utmMedium: {
    type: String,
    required: [true, 'Por favor especifica el medio (utm_medium)'],
    trim: true
  },
  utmCampaign: {
    type: String,
    required: [true, 'Por favor especifica la campaña (utm_campaign)'],
    trim: true
  },
  utmTerm: {
    type: String,
    trim: true
  },
  utmContent: {
    type: String,
    trim: true
  },
  
  // Estadísticas y seguimiento
  clicks: {
    type: Number,
    default: 0
  },
  uniqueClicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  lastClicked: Date,
  visitors: [{
    ip: String,
    userAgent: String,
    referer: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    // Geolocalización opcional
    location: {
      country: String,
      region: String,
      city: String
    }
  }],
  
  // Configuración y control
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date,
  tags: [{
    type: String,
    trim: true
  }],
  
  // Asociación con campañas y marketing
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  category: {
    type: String,
    enum: ['social', 'email', 'ads', 'affiliate', 'direct', 'other'],
    default: 'other'
  },
  
  // Seguimiento de conversiones
  conversionTracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    goalType: {
      type: String,
      enum: ['pageview', 'purchase', 'signup', 'lead', 'download', 'custom'],
      default: 'pageview'
    },
    goalUrl: String,
    goalValue: Number,
    conversionEventId: String
  },
  
  // Usuario que creó el enlace
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Datos de auditoría
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
UtmLinkSchema.index({ shortCode: 1 });
UtmLinkSchema.index({ utmSource: 1, utmMedium: 1, utmCampaign: 1 });
UtmLinkSchema.index({ createdBy: 1 });
UtmLinkSchema.index({ campaign: 1 });
UtmLinkSchema.index({ tags: 1 });

// Middleware para actualizar la fecha de modificación
UtmLinkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para generar un código corto único si no existe
UtmLinkSchema.pre('save', async function(next) {
  if (!this.shortCode) {
    // Generar un código corto único de 6 caracteres
    const generateShortCode = () => {
      return crypto.randomBytes(3).toString('hex');
    };
    
    // Intentar hasta encontrar un código único
    let shortCode = generateShortCode();
    let codeExists = await mongoose.model('UtmLink').findOne({ shortCode });
    
    while (codeExists) {
      shortCode = generateShortCode();
      codeExists = await mongoose.model('UtmLink').findOne({ shortCode });
    }
    
    this.shortCode = shortCode;
  }
  next();
});

// Método para generar la URL completa con parámetros UTM
UtmLinkSchema.methods.generateTrackedUrl = function() {
  const baseUrl = this.destinationUrl;
  const hasQueryParams = baseUrl.includes('?');
  const separator = hasQueryParams ? '&' : '?';
  
  let trackedUrl = `${baseUrl}${separator}utm_source=${encodeURIComponent(this.utmSource)}&utm_medium=${encodeURIComponent(this.utmMedium)}&utm_campaign=${encodeURIComponent(this.utmCampaign)}`;
  
  if (this.utmTerm) {
    trackedUrl += `&utm_term=${encodeURIComponent(this.utmTerm)}`;
  }
  
  if (this.utmContent) {
    trackedUrl += `&utm_content=${encodeURIComponent(this.utmContent)}`;
  }
  
  return trackedUrl;
};

// Método para generar una URL acortada para compartir
UtmLinkSchema.methods.getShortenedUrl = function() {
  const baseUrl = process.env.BASE_URL || 'https://eqhuma.com';
  return `${baseUrl}/l/${this.shortCode}`;
};

// Método para registrar un clic en el enlace
UtmLinkSchema.methods.recordClick = async function(visitorData) {
  // Incrementar contador de clics
  this.clicks += 1;
  this.lastClicked = new Date();
  
  // Añadir información del visitante si se proporciona
  if (visitorData) {
    // Comprobar si es un visitante único (por IP)
    const existingVisitor = this.visitors.find(v => v.ip === visitorData.ip);
    if (!existingVisitor) {
      this.uniqueClicks += 1;
    }
    
    this.visitors.push({
      ip: visitorData.ip,
      userAgent: visitorData.userAgent,
      referer: visitorData.referer,
      timestamp: new Date(),
      location: visitorData.location || {}
    });
  }
  
  await this.save();
  return this;
};

// Método para registrar una conversión
UtmLinkSchema.methods.recordConversion = async function(value = null) {
  this.conversions += 1;
  
  if (value !== null && this.conversionTracking.goalValue === undefined) {
    this.conversionTracking.goalValue = value;
  }
  
  await this.save();
  return this;
};

// Virtual para calcular la tasa de conversión
UtmLinkSchema.virtual('conversionRate').get(function() {
  if (!this.clicks) return 0;
  return (this.conversions / this.clicks) * 100;
});

// Virtual para verificar si el enlace está expirado
UtmLinkSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Método estático para encontrar enlaces activos por campaña
UtmLinkSchema.statics.findByCampaign = function(campaignId) {
  return this.find({
    campaign: campaignId,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Método estático para obtener estadísticas agregadas por fuente
UtmLinkSchema.statics.getStatsBySource = async function(userId = null) {
  const match = userId ? { createdBy: mongoose.Types.ObjectId(userId) } : {};
  
  return this.aggregate([
    { $match: match },
    { $group: {
      _id: "$utmSource",
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
};

module.exports = mongoose.model('UtmLink', UtmLinkSchema);