// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Esquema de usuario para EQHuma API Manager
 * Incluye métodos para autenticación, generación de tokens y gestión de contraseñas
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa tu nombre'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa un correo electrónico'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un correo electrónico válido'
    ],
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir por defecto en las consultas
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager', 'developer'],
    default: 'user'
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Campos para gestión de APIs
  apiQuota: {
    type: Number,
    default: 0
  },
  apiUsage: {
    type: Number,
    default: 0
  },
  // Campos para verificación de correo
  verificationToken: String,
  verificationTokenExpire: Date,
  // Campos para reseteo de contraseña
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Campos para auditoría
  lastLogin: Date,
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

// Middleware para encriptar contraseñas antes de guardar
UserSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generar salt y hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para actualizar la fecha de modificación
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para comparar contraseñas ingresadas con hash almacenado
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar y firmar JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Método para generar token de reseteo de contraseña
UserSchema.methods.getResetPasswordToken = function() {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash el token y guardarlo en la base de datos
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Establecer tiempo de expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Método para generar token de verificación de email
UserSchema.methods.getVerificationToken = function() {
  // Generar token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Hash el token y guardarlo en la base de datos
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  // Establecer tiempo de expiración (24 horas)
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

// Relaciones virtuales - si se implementan relaciones en el futuro
UserSchema.virtual('apiInstances', {
  ref: 'ApiInstance',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

UserSchema.virtual('prospects', {
  ref: 'Prospect',
  localField: '_id',
  foreignField: 'assignedTo',
  justOne: false
});

module.exports = mongoose.model('User', UserSchema);