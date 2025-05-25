// eqhuma-courses-service/src/routes/enrollmentRoutes.js
const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get(
  '/',
  protect,
  authorize('admin'),
  enrollmentController.getEnrollments
);

router.get(
  '/stats',
  protect,
  authorize('admin'),
  enrollmentController.getEnrollmentStats
);

// Student routes
router.get(
  '/my-enrollments',
  protect,
  enrollmentController.getMyEnrollments
);

// Get single enrollment
// Access controlled in controller: student can access own enrollments,
// instructors can access enrollments for their courses, admins can access all
router.get(
  '/:id',
  protect,
  enrollmentController.getEnrollment
);

// Update enrollment status
// Access controlled in controller
router.put(
  '/:id',
  protect,
  enrollmentController.updateEnrollment
);

// Payment routes
router.post(
  '/:id/payment',
  protect,
  enrollmentController.createPaymentSession
);

// Webhook for payment provider (Stripe)
// Public endpoint but validation happens in the controller
router.post(
  '/webhook',
  enrollmentController.handlePaymentWebhook
);

// Issue certificate
// Access controlled in controller (admin or course instructor)
router.post(
  '/:id/certificate',
  protect,
  enrollmentController.issueCertificate
);

module.exports = router;