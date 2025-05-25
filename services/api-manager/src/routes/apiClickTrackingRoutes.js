// src/routes/apiClickTrackingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  trackApiClick,
  trackConversion,
  getApiClickStats,
  cleanupOldTrackingData
} = require('../controllers/apiClickTrackingController');

/**
 * Rutas para el seguimiento de clics y uso de APIs
 */

// Ruta pública para registrar clics/uso de API
router.post('/track', trackApiClick);

// Ruta pública para registrar conversiones
router.post('/conversion', trackConversion);

// Rutas privadas (requieren autenticación)
router
  .route('/stats/:apiInstanceId')
  .get(protect, getApiClickStats);

// Rutas admin para mantenimiento y limpieza de datos
router
  .route('/cleanup')
  .delete(protect, authorize('admin'), cleanupOldTrackingData);

module.exports = router;