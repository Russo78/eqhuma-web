// src/controllers/authController.js
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/v1/auth/register
 * @access  Público
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, company, phone } = req.body;

  // Verificar si ya existe un usuario con ese email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('El correo electrónico ya está registrado', 400));
  }

  // Crear usuario
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user', // Asegurar que el rol sea válido
    company,
    phone
  });

  // Generar token de verificación de email
  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Crear URL de verificación
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;

  // Mensaje para el correo de verificación
  const message = `Has sido registrado en EQHuma API Manager. Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace: \n\n ${verificationUrl}`;

  try {
    // Enviar correo de verificación
    await sendEmail({
      email: user.email,
      subject: 'Verificación de correo electrónico',
      message
    });

    // Enviar respuesta
    sendTokenResponse(user, 201, res, {
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.'
    });
  } catch (err) {
    console.error('Error al enviar correo de verificación:', err);
    
    // Eliminar el token de verificación si hay un error
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 201, res, {
      message: 'Usuario registrado exitosamente. Error al enviar correo de verificación.'
    });
  }
});

/**
 * @desc    Iniciar sesión de usuario
 * @route   POST /api/v1/auth/login
 * @access  Público
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validar email y contraseña
  if (!email || !password) {
    return next(new ErrorResponse('Por favor proporciona un email y contraseña', 400));
  }

  // Verificar si el usuario existe
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Verificar si la cuenta está activa
  if (!user.isActive) {
    return next(new ErrorResponse('Esta cuenta ha sido desactivada', 403));
  }

  // Verificar si la contraseña coincide
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Registrar fecha del último login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Enviar respuesta con token
  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Cerrar sesión de usuario / Limpiar cookie
 * @route   GET /api/v1/auth/logout
 * @access  Privado
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // Limpiar cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Obtener datos del usuario actual
 * @route   GET /api/v1/auth/me
 * @access  Privado
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Actualizar detalles de usuario (nombre, email, etc)
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Privado
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // Filtrar solo campos permitidos
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    company: req.body.company,
    phone: req.body.phone
  };
  
  // Eliminar campos undefined
  Object.keys(fieldsToUpdate).forEach(key => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  // Actualizar usuario
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Actualizar contraseña
 * @route   PUT /api/v1/auth/updatepassword
 * @access  Privado
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new ErrorResponse('Por favor proporciona la contraseña actual y la nueva contraseña', 400)
    );
  }

  // Verificar contraseña actual
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('La contraseña actual es incorrecta', 401));
  }

  // Actualizar contraseña
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Solicitar reseteo de contraseña
 * @route   POST /api/v1/auth/forgotpassword
 * @access  Público
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No existe un usuario con ese email', 404));
  }

  // Generar token de reseteo
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Crear URL de reseteo
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  // Mensaje para el correo
  const message = `Has solicitado resetear tu contraseña. Por favor haz una solicitud PUT a: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Token para reseteo de contraseña',
      message
    });

    res.status(200).json({ 
      success: true, 
      data: { message: 'Email enviado' } 
    });
  } catch (err) {
    console.error('Error al enviar correo de reseteo:', err);
    
    // Eliminar el token si hay un error
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('No se pudo enviar el email', 500));
  }
});

/**
 * @desc    Resetear contraseña
 * @route   PUT /api/v1/auth/resetpassword/:resettoken
 * @access  Público
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Obtener token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  // Buscar usuario con token válido
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Token inválido o expirado', 400));
  }

  // Establecer nueva contraseña
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, {
    message: 'Contraseña actualizada exitosamente'
  });
});

/**
 * @desc    Verificar correo electrónico
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Público
 */
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Obtener token de la URL
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Buscar usuario con token válido
  const user = await User.findOne({
    verificationToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Token inválido o expirado', 400));
  }

  // Actualizar usuario como verificado
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, {
    message: 'Correo electrónico verificado exitosamente'
  });
});

/**
 * Función auxiliar para enviar respuesta con token JWT
 */
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  // Crear token
  const token = user.getSignedJwtToken();

  // Opciones para la cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Usar HTTPS en producción
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Respuesta con cookie
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        company: user.company,
        phone: user.phone
      },
      ...extraData
    });
};