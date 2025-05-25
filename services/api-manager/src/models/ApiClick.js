// src/models/ApiClick.js
const mongoose = require('mongoose');

/**
 * Esquema para el seguimiento de clics y uso de APIs
 * Permite rastrear el uso, origen y éxito de las llamadas a API
 */
const ApiClickSchema = new mongoose.Schema({
  // Referencia a la instancia de API que se usó
  apiInstance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiInstance',
    required: true,
    index: true
  },
  
  // Datos sobre el cliente y la petición
  clientIp: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  endpoint: {
    type: String,
    trim: true,
    required: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    default: 'GET'
  },
  
  // Resultado de la petición
  statusCode: {
    type: Number
  },
  responseTime: {
    type: Number, // tiempo de respuesta en ms
    default: 0
  },
  isSuccess: {
    type: Boolean,
    default: true
  },
  errorMessage: String,
  
  // Parámetros de seguimiento
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,
  
  // Información de conversión
  isConverted: {
    type: Boolean,
    default: false
  },
  convertedAt: Date,
  conversionValue: {
    type: Number,
    default: 0
  },
  conversionType: String,
  
  // Datos de geolocalización (opcionales)
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  
  // Campos de seguimiento adicionales personalizables
  metaData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices para mejorar consultas comunes
ApiClickSchema.index({ 'apiInstance': 1, 'createdAt': 1 });
ApiClickSchema.index({ 'isConverted': 1 });
ApiClickSchema.index({ 'utmSource': 1, 'utmMedium': 1, 'utmCampaign': 1 });

// Método para marcar una conversión
ApiClickSchema.methods.markAsConverted = async function(type, value = 0) {
  this.isConverted = true;
  this.convertedAt = Date.now();
  this.conversionType = type;
  this.conversionValue = value;
  
  await this.save();
  return this;
};

// Método para enriquecer con datos de geolocalización
ApiClickSchema.methods.enrichWithGeoData = async function(geoData) {
  if (!geoData) return this;
  
  this.location = {
    country: geoData.country || '',
    region: geoData.region || '',
    city: geoData.city || '',
    latitude: geoData.latitude || null,
    longitude: geoData.longitude || null
  };
  
  await this.save();
  return this;
};

// Método estático para obtener estadísticas agregadas
ApiClickSchema.statics.getClickStats = async function(apiInstanceId, dateRange = {}) {
  const match = { apiInstance: mongoose.Types.ObjectId(apiInstanceId) };
  
  // Aplicar filtro de fechas si se proporciona
  if (dateRange.start) {
    match.createdAt = { $gte: new Date(dateRange.start) };
  }
  if (dateRange.end) {
    match.createdAt = { ...match.createdAt, $lte: new Date(dateRange.end) };
  }
  
  // Realizar agregación para obtener estadísticas
  return this.aggregate([
    { $match: match },
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
};

module.exports = mongoose.model('ApiClick', ApiClickSchema);