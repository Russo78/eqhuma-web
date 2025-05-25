// src/routes/marketingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Controladores UTM
  createUtmLink,
  getUtmLinks,
  getUtmLink,
  updateUtmLink,
  deleteUtmLink,
  getUtmLinkStats,
  redirectUtmLink,
  recordUtmConversion,
  
  // Controladores Códigos promo
  createPromoCode,
  getPromoCodes,
  verifyPromoCode,
  applyPromoCode
} = require('../controllers/marketingController');

/**
 * Rutas para enlaces UTM y tracking
 */

// Rutas públicas 
router.get('/r/:shortCode', redirectUtmLink); // Redirección de enlaces cortos
router.post('/utm-links/conversion', recordUtmConversion); // Registro de conversiones

// Rutas para enlaces UTM (requieren autenticación)
router
  .route('/utm-links')
  .get(protect, getUtmLinks)
  .post(protect, createUtmLink);

router
  .route('/utm-links/:id')
  .get(protect, getUtmLink)
  .put(protect, updateUtmLink)
  .delete(protect, deleteUtmLink);

router.get('/utm-links/:id/stats', protect, getUtmLinkStats);

/**
 * Rutas para códigos promocionales
 */

// Ruta pública para verificar código promo
router.post('/promo-codes/verify', verifyPromoCode);

// Rutas privadas para códigos promo
router
  .route('/promo-codes')
  .get(protect, getPromoCodes)
  .post(protect, authorize('admin', 'manager'), createPromoCode);

router.post('/promo-codes/apply', protect, applyPromoCode);

module.exports = router;