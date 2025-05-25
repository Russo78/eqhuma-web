// src/routes/apiRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const apiTemplateController = require('../controllers/apiTemplateController');
const credentialController = require('../controllers/credentialController');
const apiInstanceController = require('../controllers/apiInstanceController');
const marketingController = require('../controllers/marketingController');
const crmController = require('../controllers/crmController');

const router = express.Router();

// API Template routes
router
  .route('/api-templates')
  .get(protect, apiTemplateController.getAllApiTemplates)
  .post(protect, authorize('admin', 'developer'), apiTemplateController.createApiTemplate);

router
  .route('/api-templates/:id')
  .get(protect, apiTemplateController.getApiTemplate)
  .put(protect, authorize('admin', 'developer'), apiTemplateController.updateApiTemplate)
  .delete(protect, authorize('admin', 'developer'), apiTemplateController.deleteApiTemplate);

router
  .route('/api-templates/:id/instances')
  .post(protect, apiTemplateController.createApiInstance);

router
  .route('/api-templates/:id/test-endpoint')
  .post(protect, apiTemplateController.testApiEndpoint);

router
  .route('/api-templates/:id/export/openapi')
  .get(protect, apiTemplateController.exportAsOpenAPI);

// API Instance routes
router
  .route('/api-instances')
  .get(protect, apiInstanceController.getAllApiInstances)
  .post(protect, authorize('admin', 'developer'), apiInstanceController.createApiInstance);

router
  .route('/api-instances/:id')
  .get(protect, apiInstanceController.getApiInstance)
  .put(protect, authorize('admin', 'developer'), apiInstanceController.updateApiInstance)
  .delete(protect, authorize('admin', 'developer'), apiInstanceController.deleteApiInstance);

router
  .route('/api-instances/:id/execute/:endpointId')
  .post(protect, apiInstanceController.executeApiEndpoint);

// API Credential routes
router
  .route('/credentials')
  .get(protect, credentialController.getAllCredentials)
  .post(protect, authorize('admin', 'developer'), credentialController.createCredential);

router
  .route('/credentials/:id')
  .get(protect, credentialController.getCredential)
  .put(protect, authorize('admin', 'developer'), credentialController.updateCredential)
  .delete(protect, authorize('admin', 'developer'), credentialController.deleteCredential);

// Marketing UTM routes
router
  .route('/marketing/utm-links')
  .get(protect, marketingController.getAllUtmLinks)
  .post(protect, marketingController.createUtmLink);

router
  .route('/marketing/utm-links/:id')
  .get(protect, marketingController.getUtmLink)
  .put(protect, marketingController.updateUtmLink)
  .delete(protect, marketingController.deleteUtmLink);

router
  .route('/marketing/analytics')
  .get(protect, marketingController.getAnalytics);

router
  .route('/marketing/promo-codes')
  .get(protect, marketingController.getAllPromoCodes)
  .post(protect, authorize('admin', 'marketing'), marketingController.createPromoCode);

router
  .route('/marketing/promo-codes/:id')
  .get(protect, marketingController.getPromoCode)
  .put(protect, authorize('admin', 'marketing'), marketingController.updatePromoCode)
  .delete(protect, authorize('admin', 'marketing'), marketingController.deletePromoCode);

// CRM routes
router
  .route('/crm/prospects')
  .get(protect, crmController.getAllProspects)
  .post(protect, crmController.createProspect);

router
  .route('/crm/prospects/:id')
  .get(protect, crmController.getProspect)
  .put(protect, crmController.updateProspect)
  .delete(protect, crmController.deleteProspect);

router
  .route('/crm/segments')
  .get(protect, crmController.getAllSegments)
  .post(protect, authorize('admin', 'marketing'), crmController.createSegment);

router
  .route('/crm/analytics')
  .get(protect, crmController.getAnalytics);

module.exports = router;