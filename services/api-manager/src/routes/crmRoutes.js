// src/routes/crmRoutes.js
const express = require('express');
const { 
  createProspect, 
  getProspects, 
  getProspect, 
  updateProspect, 
  deleteProspect, 
  shareProspect,
  unshareProspect,
  assignProspect,
  addProspectNote,
  createSegment,
  getSegments,
  getSegment,
  updateSegment,
  deleteSegment,
  shareSegment
} = require('../controllers/crmController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Rutas para prospectos
router.route('/prospects')
  .get(getProspects)
  .post(authorize('admin', 'manager', 'staff'), createProspect);

router.route('/prospects/:id')
  .get(getProspect)
  .put(updateProspect)
  .delete(authorize('admin', 'manager'), deleteProspect);

router.route('/prospects/:id/share')
  .post(authorize('admin', 'manager', 'staff'), shareProspect);

router.route('/prospects/:id/share/:userId')
  .delete(authorize('admin', 'manager', 'staff'), unshareProspect);

router.route('/prospects/:id/assign')
  .post(authorize('admin', 'manager', 'staff'), assignProspect);

router.route('/prospects/:id/notes')
  .post(addProspectNote);

// Rutas para segmentos
router.route('/segments')
  .get(getSegments)
  .post(authorize('admin', 'manager', 'staff'), createSegment);

router.route('/segments/:id')
  .get(getSegment)
  .put(updateSegment)
  .delete(authorize('admin', 'manager'), deleteSegment);

router.route('/segments/:id/share')
  .post(authorize('admin', 'manager', 'staff'), shareSegment);

module.exports = router;