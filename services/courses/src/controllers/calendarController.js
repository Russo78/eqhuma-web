// eqhuma-courses-service/src/controllers/calendarController.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const CalendarEvent = require('../models/CalendarEvent');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * @desc    Get all events with filtering
 * @route   GET /api/v1/calendar/events
 * @access  Mixed (Public for published events, Private for unpublished events)
 */
exports.getEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      eventType,
      location,
      search,
      isPublic,
      sort = 'startDate',
      order = 'asc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Date range filter
    if (startDate) {
      filter.startDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      filter.endDate = { $lte: new Date(endDate) };
    }
    
    // Other filters
    if (eventType) filter.eventType = eventType;
    if (location) filter.location = location;
    
    // For non-admins, only show public events unless they're the organizer
    if (!req.user || req.user.role !== 'admin') {
      if (req.user) {
        filter.$or = [
          { isPublic: true },
          { organizer: req.user.id }
        ];
      } else {
        filter.isPublic = true;
      }
    } else if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query
    const events = await CalendarEvent.find(filter)
      .populate('organizer', 'name email profileImage')
      .populate('course', 'title slug coverImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count
    const total = await CalendarEvent.countDocuments(filter);
    
    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/v1/calendar/events/:id
 * @access  Mixed (Public for published events, Private for unpublished events)
 */
exports.getEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('organizer', 'name email profileImage')
      .populate('course', 'title slug description coverImage');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has access to non-public event
    if (!event.isPublic && (!req.user || (req.user.role !== 'admin' && event.organizer._id.toString() !== req.user.id))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This event is not public.'
      });
    }
    
    // Check if user is registered for this event
    let isRegistered = false;
    let attendeeStatus = null;
    
    if (req.user) {
      const attendee = event.attendees.find(
        a => a.user && a.user.toString() === req.user.id
      );
      
      if (attendee) {
        isRegistered = true;
        attendeeStatus = attendee.status;
      }
    }
    
    res.json({
      success: true,
      data: {
        ...event.toObject(),
        isRegistered,
        attendeeStatus,
        isFullyBooked: event.isFullyBooked(),
        registrationOpen: event.isRegistrationOpen(),
        isPast: event.isPast()
      }
    });
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/v1/calendar/events
 * @access  Private (Admin/Instructor)
 */
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Set organizer to current user
    req.body.organizer = req.user.id;
    
    // Validate course ID if provided
    if (req.body.course) {
      const course = await Course.findById(req.body.course);
      if (!course) {
        return res.status(400).json({
          success: false,
          message: 'The specified course does not exist'
        });
      }
      
      // Verify that user is the course instructor or admin
      if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only create events for your own courses'
        });
      }
    }
    
    // Create event
    const event = await CalendarEvent.create(req.body);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event'
    });
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/v1/calendar/events/:id
 * @access  Private (Admin/Organizer)
 */
exports.updateEvent = async (req, res) => {
  try {
    let event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    // Don't allow changing associated course
    if (req.body.course && event.course && req.body.course !== event.course.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change the associated course. Create a new event instead.'
      });
    }
    
    // Update event
    event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/v1/calendar/events/:id
 * @access  Private (Admin/Organizer)
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    // Check if there are confirmed attendees
    const confirmedAttendees = event.attendees.filter(a => a.status === 'confirmed');
    if (confirmedAttendees.length > 0 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with confirmed attendees. Please cancel the event instead.'
      });
    }
    
    // Delete event
    await event.remove();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
};

/**
 * @desc    Register for an event
 * @route   POST /api/v1/calendar/events/:id/register
 * @access  Private
 */
exports.registerForEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if registration is open
    if (!event.isRegistrationOpen()) {
      return res.status(400).json({
        success: false,
        message: 'Registration for this event is closed'
      });
    }
    
    // Check if event is fully booked
    if (event.isFullyBooked()) {
      return res.status(400).json({
        success: false,
        message: 'This event is fully booked'
      });
    }
    
    // Check if user is already registered
    const isAlreadyRegistered = event.attendees.some(
      attendee => attendee.user && attendee.user.toString() === req.user.id
    );
    
    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }
    
    // Get user details
    const user = await User.findById(req.user.id);
    
    // Register user
    try {
      await event.addAttendee({
        user: user._id,
        email: user.email,
        name: user.name,
        status: 'confirmed'
      });
      
      res.json({
        success: true,
        message: 'Successfully registered for the event'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during event registration'
    });
  }
};

/**
 * @desc    Cancel registration for an event
 * @route   DELETE /api/v1/calendar/events/:id/register
 * @access  Private
 */
exports.cancelRegistration = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Find user in attendees
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user && attendee.user.toString() === req.user.id
    );
    
    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }
    
    // Remove attendee
    event.attendees.splice(attendeeIndex, 1);
    
    // Decrement registration count
    if (event.currentRegistrations > 0) {
      event.currentRegistrations -= 1;
    }
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling registration'
    });
  }
};

/**
 * @desc    Get all attendees for an event
 * @route   GET /api/v1/calendar/events/:id/attendees
 * @access  Private (Admin/Organizer)
 */
exports.getEventAttendees = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('attendees.user', 'name email profileImage');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check permissions
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendees'
      });
    }
    
    res.json({
      success: true,
      count: event.attendees.length,
      data: event.attendees
    });
  } catch (error) {
    console.error('Error getting event attendees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendees'
    });
  }
};

/**
 * @desc    Update attendee status
 * @route   PUT /api/v1/calendar/events/:id/attendees/:attendeeId
 * @access  Private (Admin/Organizer)
 */
exports.updateAttendeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['invited', 'confirmed', 'attended', 'declined', 'tentative'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check permissions
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update attendee status'
      });
    }
    
    // Find and update attendee
    const attendee = event.attendees.id(req.params.attendeeId);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }
    
    // Update status
    attendee.status = status;
    
    // Set confirmation date if confirmed
    if (status === 'confirmed' && !attendee.confirmedAt) {
      attendee.confirmedAt = new Date();
    }
    
    await event.save();
    
    res.json({
      success: true,
      data: attendee
    });
  } catch (error) {
    console.error('Error updating attendee status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating attendee status'
    });
  }
};

/**
 * @desc    Upload event image
 * @route   POST /api/v1/calendar/events/:id/upload-image
 * @access  Private (Admin/Organizer)
 */
exports.uploadEventImage = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ownership
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Update event image
    event.featuredImage = req.file.filename;
    await event.save();
    
    res.json({
      success: true,
      data: {
        featuredImage: event.featuredImage
      }
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
};

/**
 * @desc    Get events for a specific course
 * @route   GET /api/v1/calendar/courses/:courseId/events
 * @access  Mixed (Public for published events, Private for unpublished events)
 */
exports.getCourseEvents = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Build filter
    const filter = { course: courseId };
    
    // For non-admins, only show public events unless they're the organizer
    if (!req.user || req.user.role !== 'admin') {
      if (req.user) {
        filter.$or = [
          { isPublic: true },
          { organizer: req.user.id }
        ];
      } else {
        filter.isPublic = true;
      }
    }
    
    // Get events
    const events = await CalendarEvent.find(filter)
      .populate('organizer', 'name profileImage')
      .sort({ startDate: 1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting course events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course events'
    });
  }
};

/**
 * @desc    Get upcoming events
 * @route   GET /api/v1/calendar/events/upcoming
 * @access  Public
 */
exports.getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const now = new Date();
    
    // Get upcoming public events
    const events = await CalendarEvent.find({
      isPublic: true,
      startDate: { $gte: now },
      status: 'scheduled'
    })
      .populate('organizer', 'name profileImage')
      .populate('course', 'title slug coverImage')
      .sort({ startDate: 1 })
      .limit(parseInt(limit, 10));
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming events'
    });
  }
};

/**
 * @desc    Get my events (as organizer)
 * @route   GET /api/v1/calendar/events/my-events
 * @access  Private
 */
exports.getMyEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find({ organizer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('course', 'title slug');
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting my events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching my events'
    });
  }
};

/**
 * @desc    Get events I'm registered for
 * @route   GET /api/v1/calendar/events/my-registrations
 * @access  Private
 */
exports.getMyRegistrations = async (req, res) => {
  try {
    // Find events where the user is an attendee
    const events = await CalendarEvent.find({
      'attendees.user': req.user.id
    })
      .populate('organizer', 'name email profileImage')
      .populate('course', 'title slug coverImage')
      .sort({ startDate: 1 });
    
    // Add attendee status to each event
    const eventsWithStatus = events.map(event => {
      const attendee = event.attendees.find(
        a => a.user && a.user.toString() === req.user.id
      );
      
      return {
        ...event.toObject(),
        attendeeStatus: attendee ? attendee.status : null
      };
    });
    
    res.json({
      success: true,
      count: events.length,
      data: eventsWithStatus
    });
  } catch (error) {
    console.error('Error getting my registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching registrations'
    });
  }
};

/**
 * @desc    Get event categories
 * @route   GET /api/v1/calendar/events/categories
 * @access  Public
 */
exports.getEventCategories = async (req, res) => {
  try {
    // Aggregate unique categories
    const categories = await CalendarEvent.distinct('category');
    
    res.json({
      success: true,
      data: categories.filter(Boolean) // Filter out null/undefined values
    });
  } catch (error) {
    console.error('Error getting event categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};