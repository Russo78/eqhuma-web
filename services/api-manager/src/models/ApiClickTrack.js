// src/models/ApiClickTrack.js
const mongoose = require('mongoose');

/**
 * Esquema para el modelo de Seguimiento de Clics en API
 * Registra cada vez que se accede a una API
 */
const ApiClickTrackSchema = new mongoose.Schema({
  // Instancia de API que se está utilizando
  apiInstance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiInstance',
    required: true,
    index: true
  },
  
  // Tipo de evento (request, error, conversion, etc)
  eventType: {
    type: String,
    enum: ['request', 'error', 'success', 'conversion', 'webhook'],
    required: true,
    index: true
  },
  
  // Endpoint al que se accedió
  endpoint: {
    type: String,
    required: true
  },
  
  // Método HTTP utilizado
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    required: true
  },
  
  // Código de estado HTTP de la respuesta
  statusCode: {
    type: Number
  },
  
  // Tiempo de respuesta en milisegundos
  responseTime: {
    type: Number
  },
  
  // Dirección IP del cliente
  ipAddress: {
    type: String
  },
  
  // País de origen basado en la IP
  country: {
    type: String
  },
  
  // Ciudad de origen basada en la IP
  city: {
    type: String
  },
  
  // Referrer (sitio desde donde se realizó la solicitud)
  referrer: {
    type: String
  },
  
  // Dominio del sitio desde donde se realizó la solicitud
  domain: {
    type: String
  },
  
  // Datos del agente de usuario
  userAgent: {
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    device: String,
    isMobile: Boolean,
    isTablet: Boolean,
    isDesktop: Boolean
  },
  
  // Valor de conversión (si aplica)
  conversionValue: {
    type: Number,
    default: 0
  },
  
  // Identificador de la campaña de marketing (si está disponible)
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmContent: String,
  utmTerm: String,
  
  // ID de cliente personalizado (si se proporciona)
  clientId: String,
  
  // ID de sesión (si está disponible)
  sessionId: String,
  
  // Mensaje de error (si hay un error)
  errorMessage: String,
  
  // Datos personalizados (cualquier información adicional)
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Marca de tiempo de creación
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índice compuesto para consultas de análisis frecuentes
ApiClickTrackSchema.index({ apiInstance: 1, eventType: 1, createdAt: -1 });
ApiClickTrackSchema.index({ apiInstance: 1, createdAt: -1 });

// Pre-procesamiento de datos antes de guardar
ApiClickTrackSchema.pre('save', function(next) {
  // Si tenemos una URL de referencia, intentamos extraer el dominio
  if (this.referrer && !this.domain) {
    try {
      const url = new URL(this.referrer);
      this.domain = url.hostname;
    } catch (error) {
      // Si no se puede analizar la URL, dejamos el dominio como null
    }
  }
  next();
});

// Método para agregar datos de conversión
ApiClickTrackSchema.methods.addConversionData = function(value, customData = {}) {
  this.eventType = 'conversion';
  this.conversionValue = value || 0;
  this.customData = { ...this.customData, ...customData };
  return this;
};

// Método estático para obtener estadísticas generales
ApiClickTrackSchema.statics.getStatsByApiInstance = async function(apiInstanceId, startDate, endDate) {
  const match = { 
    apiInstance: mongoose.Types.ObjectId(apiInstanceId)
  };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: match },
    { $group: {
      _id: { 
        eventType: "$eventType", 
        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
      },
      count: { $sum: 1 },
      avgResponseTime: { $avg: "$responseTime" },
      totalConversionValue: { $sum: "$conversionValue" }
    }},
    { $sort: { "_id.day": 1 } }
  ]);
};

module.exports = mongoose.model('ApiClickTrack', ApiClickTrackSchema);