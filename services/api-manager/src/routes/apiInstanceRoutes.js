// src/routes/apiInstanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getApiInstances,
  getApiInstance,
  createApiInstance,
  updateApiInstance,
  deleteApiInstance,
  regenerateApiKey,
  regenerateApiSecret,
  verifyApiKey,
  configureWebhook
} = require('../controllers/apiInstanceController');

/**
 * Rutas para la gestión de instancias de API
 */

// Ruta pública para verificar validez de una API key
router.post('/verify', verifyApiKey);

// Rutas que requieren autenticación
router
  .route('/')
  .get(protect, getApiInstances)
  .post(protect, createApiInstance);

router
  .route('/:id')
  .get(protect, getApiInstance)
  .put(protect, updateApiInstance)
  .delete(protect, deleteApiInstance);

router.post('/:id/regenerate-key', protect, regenerateApiKey);
router.post('/:id/regenerate-secret', protect, regenerateApiSecret);
router.post('/:id/webhook', protect, configureWebhook);

module.exports = router;