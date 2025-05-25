// src/models/Segment.js
const mongoose = require('mongoose');

/**
 * Esquema para el modelo de Segmentos
 * Permite agrupar prospectos según criterios dinámicos para campañas de marketing
 */
const SegmentSchema = new mongoose.Schema({
  // Nombre del segmento
  name: {
    type: String,
    required: [true, 'Por favor ingrese un nombre para el segmento'],
    trim: true,
    unique: true
  },
  
  // Descripción del segmento
  description: {
    type: String,
    trim: true
  },
  
  // Tipo de segmento
  type: {
    type: String,
    enum: ['estático', 'dinámico'],
    default: 'dinámico',
    required: true
  },
  
  // Reglas del segmento (para segmentos dinámicos)
  // Las reglas se guardan en formato JSON para permitir consultas flexibles
  rules: {
    type: [{
      field: {
        type: String,
        required: true
      },
      operator: {
        type: String,
        enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan',
               'startsWith', 'endsWith', 'exists', 'notExists', 'inList', 'notInList'],
        required: true
      },
      value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      // Para condiciones anidadas
      logicalOperator: {
        type: String,
        enum: ['and', 'or', 'not'],
        default: 'and'
      }
    }],
    default: []
  },
  
  // ID's de prospectos explícitos (para segmentos estáticos)
  prospectIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prospect'
  }],
  
  // Contadores de métricas
  metrics: {
    totalCount: {
      type: Number,
      default: 0
    },
    activeCount: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageValue: {
      type: Number,
      default: 0
    }
  },
  
  // Color para identificación visual
  color: {
    type: String,
    default: '#3498db' // Azul por defecto
  },
  
  // Etiquetas para organización
  tags: [String],
  
  // Usuario creador
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Última actualización por
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Campaña asociada (opcional)
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  
  // Estado del segmento
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Última vez que se actualizaron los cálculos del segmento
  lastCalculated: {
    type: Date
  },
  
  // Campos de auditoría
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar la fecha de actualización
SegmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para generar la consulta MongoDB basada en las reglas del segmento
SegmentSchema.methods.generateQuery = function() {
  if (this.type === 'estático') {
    return {
      _id: { $in: this.prospectIds }
    };
  }
  
  // Para segmentos dinámicos, traducir reglas a una consulta MongoDB
  const queryConditions = [];
  
  this.rules.forEach(rule => {
    const condition = {};
    
    // Traducir operador a sintaxis MongoDB
    switch (rule.operator) {
      case 'equals':
        condition[rule.field] = rule.value;
        break;
      case 'notEquals':
        condition[rule.field] = { $ne: rule.value };
        break;
      case 'contains':
        condition[rule.field] = { $regex: rule.value, $options: 'i' };
        break;
      case 'notContains':
        condition[rule.field] = { $not: { $regex: rule.value, $options: 'i' } };
        break;
      case 'greaterThan':
        condition[rule.field] = { $gt: rule.value };
        break;
      case 'lessThan':
        condition[rule.field] = { $lt: rule.value };
        break;
      case 'startsWith':
        condition[rule.field] = { $regex: `^${rule.value}`, $options: 'i' };
        break;
      case 'endsWith':
        condition[rule.field] = { $regex: `${rule.value}$`, $options: 'i' };
        break;
      case 'exists':
        condition[rule.field] = { $exists: true };
        break;
      case 'notExists':
        condition[rule.field] = { $exists: false };
        break;
      case 'inList':
        condition[rule.field] = { $in: Array.isArray(rule.value) ? rule.value : [rule.value] };
        break;
      case 'notInList':
        condition[rule.field] = { $nin: Array.isArray(rule.value) ? rule.value : [rule.value] };
        break;
      default:
        // En caso de un operador no reconocido, no agregamos nada
        return;
    }
    
    queryConditions.push(condition);
  });
  
  // Combinar todas las condiciones con el operador lógico correspondiente (por defecto AND)
  return queryConditions.length > 0 ? { $and: queryConditions } : {};
};

// Método estático para actualizar las métricas del segmento
SegmentSchema.methods.refreshMetrics = async function() {
  const Prospect = mongoose.model('Prospect');
  const query = this.generateQuery();
  
  // Total de prospectos que cumplen con las reglas
  const totalCount = await Prospect.countDocuments(query);
  
  // Prospectos activos (no perdidos ni inactivos)
  const activeQuery = {
    ...query,
    status: { $nin: ['perdido', 'inactivo'] }
  };
  const activeCount = await Prospect.countDocuments(activeQuery);
  
  // Prospectos convertidos (ganados)
  const convertedQuery = {
    ...query,
    status: 'ganado'
  };
  const convertedCount = await Prospect.countDocuments(convertedQuery);
  
  // Cálculo del valor promedio
  const valueResult = await Prospect.aggregate([
    { $match: query },
    { $group: { _id: null, average: { $avg: '$estimatedValue' } } }
  ]);
  
  // Actualizar métricas
  this.metrics = {
    totalCount,
    activeCount,
    conversionRate: totalCount > 0 ? (convertedCount / totalCount) * 100 : 0,
    averageValue: valueResult.length > 0 ? valueResult[0].average : 0
  };
  
  this.lastCalculated = Date.now();
  return this.save();
};

module.exports = mongoose.model('Segment', SegmentSchema);