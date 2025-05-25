// eqhuma-courses-service/src/routes/lessonRoutes.js
const express = require('express');
const { check } = require('express-validator');
const lessonController = require('../controllers/lessonController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get single lesson - either public preview or requires enrollment
router.get('/:id', optionalAuth, lessonController.getLesson);

// Update lesson
router.put(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  lessonController.updateLesson
);

// Delete lesson
router.delete(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  lessonController.deleteLesson
);

// Upload lesson resources
router.post(
  '/:id/upload',
  protect,
  authorize('admin', 'instructor'),
  upload.lessonResource,
  upload.handleUploadError,
  lessonController.uploadLessonResource
);

// Update lesson progress (for enrolled students)
router.post(
  '/:id/progress',
  protect,
  lessonController.updateProgress
);

module.exports = router;