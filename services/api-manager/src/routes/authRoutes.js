// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/authController');

/**
 * Rutas para autenticación y gestión de usuarios
 */

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Rutas que requieren autenticación
router.use(protect); // Middleware de protección para todas las rutas siguientes

router.get('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

// Rutas de administración de usuarios (solo admin)
router
  .route('/users')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

router
  .route('/users/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;