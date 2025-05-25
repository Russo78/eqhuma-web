// src/models/Prospect.js
const mongoose = require('mongoose');

/**
 * Esquema para prospectos en el CRM de EQHuma
 * Permite gestionar leads, oportunidades de venta y clientes potenciales
 */
const ProspectSchema = new mongoose.Schema({
  // Información personal
  firstName: {
    type: String,
    required: [true, 'Por favor ingresa el nombre del prospecto'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'Por favor ingresa el apellido del prospecto'],
    trim: true,
    maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Por favor ingresa un correo electrónico válido'
    ],
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  mobilePhone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  
  // Detalles de negocio
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'dormant'],
    default: 'new'
  },
  segment: {
    type: String,
    enum: ['individual', 'small_business', 'mid_market', 'enterprise', 'government', 'education', 'other'],
    default: 'individual'
  },
  industry: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['web', 'referral', 'event', 'cold_call', 'social_media', 'api', 'other'],
    default: 'web'
  },
  
  // Evaluación y puntuación
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  budget: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'MXN'
  },
  
  // Etiquetas y categorización
  tags: [{
    type: String,
    trim: true
  }],
  
  // Información de contacto y seguimiento
  lastContactedAt: Date,
  nextFollowUpAt: Date,
  nextAction: {
    type: String,
    trim: true
  },
  
  // Notas de seguimiento y comentarios
  notes: [{
    content: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Documentos relacionados
  documents: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Historial de cambios
  history: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Geolocalización
  location: {
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Datos de interacciones con APIs
  apiInteractions: [{
    apiInstance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiInstance'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // URL del avatar/foto (opcional)
  avatarUrl: String,
  
  // Campos personalizados (JSON con datos adicionales)
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Datos UTM si proviene de una campaña de marketing
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,
  
  // Propietario y asignación
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  
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
  
  // Metadatos del sistema
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

// Índices para mejorar el rendimiento
ProspectSchema.index({ status: 1 });
ProspectSchema.index({ score: 1 });
ProspectSchema.index({ owner: 1 });
ProspectSchema.index({ assignedTo: 1 });
ProspectSchema.index({ 'sharedWith.user': 1 });
ProspectSchema.index({ email: 1 });
ProspectSchema.index({ company: 1 });

// Middleware para actualizar la fecha de modificación
ProspectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual para obtener el nombre completo
ProspectSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual para verificar si el prospecto está asignado
ProspectSchema.virtual('isAssigned').get(function() {
  return !!this.assignedTo;
});

// Virtual para calcular el tiempo desde el último contacto
ProspectSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContactedAt) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastContactedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Método para actualizar el estado y registrar el cambio en el historial
ProspectSchema.methods.updateStatus = async function(newStatus, userId, notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Registrar cambio en el historial
  this.history = this.history || [];
  this.history.unshift({
    user: userId,
    timestamp: Date.now(),
    changes: {
      status: {
        oldValue: oldStatus,
        newValue: newStatus
      }
    }
  });
  
  // Añadir nota si se proporciona
  if (notes) {
    this.notes = this.notes || [];
    this.notes.unshift({
      content: notes,
      user: userId,
      createdAt: Date.now()
    });
  }
  
  // Si el estado cambia a "contacted", actualizar lastContactedAt
  if (newStatus === 'contacted') {
    this.lastContactedAt = Date.now();
  }
  
  await this.save();
  return this;
};

// Método para registrar un contacto con el prospecto
ProspectSchema.methods.logContact = async function(userId, method, notes) {
  this.lastContactedAt = Date.now();
  
  // Añadir nota
  this.notes = this.notes || [];
  const noteContent = `Contacto ${method}: ${notes}`;
  this.notes.unshift({
    content: noteContent,
    user: userId,
    createdAt: Date.now()
  });
  
  // Registrar en historial
  this.history = this.history || [];
  this.history.unshift({
    user: userId,
    timestamp: Date.now(),
    changes: {
      contact: {
        method,
        notes
      }
    }
  });
  
  await this.save();
  return this;
};

// Método para añadir una interacción de API
ProspectSchema.methods.addApiInteraction = async function(apiInstanceId, metadata = {}) {
  this.apiInteractions = this.apiInteractions || [];
  
  this.apiInteractions.unshift({
    apiInstance: apiInstanceId,
    timestamp: Date.now(),
    metadata
  });
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Prospect', ProspectSchema);