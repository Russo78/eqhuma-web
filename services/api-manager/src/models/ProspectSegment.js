// src/models/ProspectSegment.js
const mongoose = require('mongoose');
const Prospect = require('./Prospect');

/**
 * Esquema para segmentos de prospectos en el CRM de EQHuma
 * Permite agrupar prospectos según criterios específicos para campañas o análisis
 */
const ProspectSegmentSchema = new mongoose.Schema({
  // Información básica del segmento
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre para el segmento'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    trim: true
  },
  
  // Criterios de segmentación (estructura flexible para permitir consultas complejas)
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Estadísticas del segmento
  stats: {
    totalProspects: {
      type: Number,
      default: 0
    },
    activeProspects: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    avgScore: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Si el segmento se actualiza automáticamente
  automationEnabled: {
    type: Boolean,
    default: true
  },
  
  // Frecuencia de actualización automática (en horas, 0 = en tiempo real)
  updateFrequency: {
    type: Number,
    default: 24
  },
  
  // Si el segmento es público (visible para todos los usuarios)
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Etiquetas para organización
  tags: [String],
  
  // Color para visualización en UI (formato hex)
  color: {
    type: String,
    default: '#3498db' // Azul por defecto
  },
  
  // Propietario y creador
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Compartir con otros usuarios
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    }
  }],
  
  // Campos para acciones automáticas (opcional)
  actions: [{
    type: {
      type: String,
      enum: ['email', 'notification', 'task', 'webhook'],
      required: true
    },
    config: {
      type: mongoose.Schema.Types.Mixed
    },
    active: {
      type: Boolean,
      default: true
    }
  }],
  
  // Creado y actualizado
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

// Índices
ProspectSegmentSchema.index({ name: 1, owner: 1 }, { unique: true });
ProspectSegmentSchema.index({ owner: 1 });
ProspectSegmentSchema.index({ 'sharedWith.user': 1 });
ProspectSegmentSchema.index({ isPublic: 1 });

// Middleware pre-save para actualizar fecha
ProspectSegmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Construye una consulta MongoDB a partir de los criterios del segmento
 */
ProspectSegmentSchema.methods.buildQuery = function() {
  // Si no hay criterios definidos, devolver un objeto vacío
  if (!this.criteria || Object.keys(this.criteria).length === 0) {
    return {};
  }
  
  const query = {};
  const { criteria } = this;
  
  // Procesar criterios básicos
  if (criteria.status) {
    query.status = Array.isArray(criteria.status) 
      ? { $in: criteria.status } 
      : criteria.status;
  }
  
  if (criteria.segment) {
    query.segment = Array.isArray(criteria.segment) 
      ? { $in: criteria.segment } 
      : criteria.segment;
  }
  
  if (criteria.source) {
    query.source = Array.isArray(criteria.source) 
      ? { $in: criteria.source } 
      : criteria.source;
  }
  
  // Rangos de score y probability
  if (criteria.minScore !== undefined) {
    query.score = query.score || {};
    query.score.$gte = criteria.minScore;
  }
  
  if (criteria.maxScore !== undefined) {
    query.score = query.score || {};
    query.score.$lte = criteria.maxScore;
  }
  
  if (criteria.minProbability !== undefined) {
    query.probability = query.probability || {};
    query.probability.$gte = criteria.minProbability;
  }
  
  if (criteria.maxProbability !== undefined) {
    query.probability = query.probability || {};
    query.probability.$lte = criteria.maxProbability;
  }
  
  // Fechas
  if (criteria.createdAfter) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$gte = new Date(criteria.createdAfter);
  }
  
  if (criteria.createdBefore) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = new Date(criteria.createdBefore);
  }
  
  if (criteria.lastContactAfter) {
    query.lastContactedAt = query.lastContactedAt || {};
    query.lastContactedAt.$gte = new Date(criteria.lastContactAfter);
  }
  
  if (criteria.lastContactBefore) {
    query.lastContactedAt = query.lastContactedAt || {};
    query.lastContactedAt.$lte = new Date(criteria.lastContactBefore);
  }
  
  // Tags (usando $all para requerir todos los tags especificados)
  if (criteria.tags && criteria.tags.length > 0) {
    query.tags = { $all: criteria.tags };
  }
  
  // Ubicación
  if (criteria.location) {
    if (criteria.location.country) {
      query['location.country'] = criteria.location.country;
    }
    
    if (criteria.location.state) {
      query['location.state'] = criteria.location.state;
    }
    
    if (criteria.location.city) {
      query['location.city'] = criteria.location.city;
    }
  }
  
  // Campos personalizados
  if (criteria.customFields) {
    for (const [key, value] of Object.entries(criteria.customFields)) {
      query[`customFields.${key}`] = value;
    }
  }
  
  // UTM Source para campañas específicas
  if (criteria.utmSource) {
    query.utmSource = criteria.utmSource;
  }
  
  // Condiciones avanzadas (si se proporciona una consulta MongoDB directa)
  if (criteria.advancedQuery) {
    // Combinar con la consulta existente usando $and para evitar sobrescribir criterios
    return { $and: [query, criteria.advancedQuery] };
  }
  
  return query;
};

/**
 * Método para actualizar las estadísticas del segmento
 */
ProspectSegmentSchema.methods.updateStats = async function() {
  const query = this.buildQuery();
  
  try {
    // Obtener estadísticas básicas
    const totalProspects = await Prospect.countDocuments(query);
    
    // Prospectos activos (que no están en estado dormant o lost)
    const activeQuery = {
      ...query,
      status: { $nin: ['dormant', 'lost'] }
    };
    const activeProspects = await Prospect.countDocuments(activeQuery);
    
    // Prospectos convertidos (won)
    const wonQuery = {
      ...query,
      status: 'won'
    };
    const wonProspects = await Prospect.countDocuments(wonQuery);
    
    // Tasa de conversión
    const conversionRate = totalProspects > 0 ? (wonProspects / totalProspects) * 100 : 0;
    
    // Promedio de score
    const scoreResult = await Prospect.aggregate([
      { $match: query },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    
    const avgScore = scoreResult.length > 0 ? scoreResult[0].avgScore : 0;
    
    // Actualizar estadísticas
    this.stats = {
      totalProspects,
      activeProspects,
      conversionRate,
      avgScore,
      lastUpdated: Date.now()
    };
    
    await this.save();
    return this.stats;
  } catch (err) {
    console.error('Error al actualizar estadísticas del segmento:', err);
    throw err;
  }
};

module.exports = mongoose.model('ProspectSegment', ProspectSegmentSchema);