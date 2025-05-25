// eqhuma-courses-service/src/routes/calendarRoutes.js
const express = require('express');
const calendarController = require('../controllers/calendarController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes (with optional authentication for access control)
router.get('/events', optionalAuth, calendarController.getEvents);
router.get('/events/upcoming', calendarController.getUpcomingEvents);
router.get('/events/categories', calendarController.getEventCategories);
router.get('/events/:id', optionalAuth, calendarController.getEvent);
router.get('/courses/:courseId/events', optionalAuth, calendarController.getCourseEvents);

// Protected routes - require login
router.get('/events/my-events', protect, calendarController.getMyEvents);
router.get('/events/my-registrations', protect, calendarController.getMyRegistrations);

// Event registration endpoints
router.post('/events/:id/register', protect, calendarController.registerForEvent);
router.delete('/events/:id/register', protect, calendarController.cancelRegistration);

// Create, update, delete events - instructor or admin only
router.post(
  '/events',
  protect,
  authorize('admin', 'instructor'),
  calendarController.createEvent
);

router.put(
  '/events/:id',
  protect,
  authorize('admin', 'instructor'),
  calendarController.updateEvent
);

router.delete(
  '/events/:id',
  protect,
  authorize('admin', 'instructor'),
  calendarController.deleteEvent
);

// Upload event image
router.post(
  '/events/:id/upload-image',
  protect,
  authorize('admin', 'instructor'),
  upload.eventImage,
  upload.handleUploadError,
  calendarController.uploadEventImage
);

// Attendee management - instructor or admin only
router.get(
  '/events/:id/attendees',
  protect,
  authorize('admin', 'instructor'),
  calendarController.getEventAttendees
);

router.put(
  '/events/:id/attendees/:attendeeId',
  protect,
  authorize('admin', 'instructor'),
  calendarController.updateAttendeeStatus
);

module.exports = router;