// eqhuma-courses-service/src/routes/courseRoutes.js
const express = require('express');
const { check } = require('express-validator');
const courseController = require('../controllers/courseController');
const enrollmentController = require('../controllers/enrollmentController');
const lessonController = require('../controllers/lessonController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, courseController.getCourses);
router.get('/categories', courseController.getCategories);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/:id', optionalAuth, courseController.getCourse);

// Protected routes - require login
router.get('/my-courses', protect, courseController.getMyCourses);
router.get('/my-enrollments', protect, courseController.getMyEnrollments);

// Admin only routes
router.get('/stats', protect, authorize('admin'), courseController.getCourseStats);

// Instructor/Admin routes
router.post(
  '/',
  [
    protect,
    authorize('admin', 'instructor'),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
  ],
  courseController.createCourse
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  courseController.updateCourse
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'instructor'),
  courseController.deleteCourse
);

// Upload course cover image
router.post(
  '/:id/upload-cover',
  protect,
  authorize('admin', 'instructor'),
  upload.courseImage,
  upload.handleUploadError,
  courseController.uploadCourseCover
);

// Enrollment routes
router.post(
  '/:courseId/enroll',
  protect,
  enrollmentController.enrollInCourse
);

// Lesson routes under course
router.get('/:courseId/lessons', optionalAuth, lessonController.getLessons);

router.post(
  '/:courseId/lessons',
  [
    protect,
    authorize('admin', 'instructor'),
    check('title', 'Title is required').not().isEmpty(),
    check('contentType', 'Content type is required').not().isEmpty(),
  ],
  lessonController.createLesson
);

// Lesson reordering
router.put(
  '/:courseId/lessons/reorder',
  protect,
  authorize('admin', 'instructor'),
  lessonController.reorderLessons
);

module.exports = router;