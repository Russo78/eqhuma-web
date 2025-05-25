// eqhuma-courses-service/src/models/CalendarEvent.js
const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    eventType: {
      type: String,
      enum: ['webinar', 'workshop', 'course', 'meeting', 'other'],
      default: 'other',
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      enum: ['online', 'onsite', 'hybrid'],
      default: 'online',
    },
    address: {
      type: String,
    },
    virtualMeetingUrl: {
      type: String,
    },
    virtualMeetingProvider: {
      type: String,
      enum: ['zoom', 'teams', 'meet', 'webex', 'other'],
    },
    color: {
      type: String,
      default: '#4285F4',
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    capacity: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        email: String,
        name: String,
        status: {
          type: String,
          enum: ['invited', 'confirmed', 'attended', 'declined', 'tentative'],
          default: 'invited',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        confirmedAt: Date,
      },
    ],
    recurrence: {
      frequency: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'none',
      },
      interval: {
        type: Number,
        default: 1,
      },
      endDate: Date,
      endAfterOccurrences: Number,
      weekDays: [
        {
          type: String,
          enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        },
      ],
      monthDay: Number,
      exceptions: [Date],
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ['email', 'notification'],
          default: 'email',
        },
        minutes: {
          type: Number,
          default: 30, // minutes before event
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    attachment: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed', 'rescheduled'],
      default: 'scheduled',
    },
    tags: [String],
    maxRegistrations: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    currentRegistrations: {
      type: Number,
      default: 0,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    registrationCloseDate: {
      type: Date,
    },
    price: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    featuredImage: {
      type: String,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for related course
CalendarEventSchema.virtual('courseDetails', {
  ref: 'Course',
  localField: 'course',
  foreignField: '_id',
  justOne: true,
});

// Create index for searching events
CalendarEventSchema.index({ 
  title: 'text', 
  description: 'text' 
});

// Create index for date queries
CalendarEventSchema.index({ startDate: 1, endDate: 1 });

// Check if event is fully booked
CalendarEventSchema.methods.isFullyBooked = function() {
  return this.maxRegistrations > 0 && this.currentRegistrations >= this.maxRegistrations;
};

// Check if registrations are open
CalendarEventSchema.methods.isRegistrationOpen = function() {
  if (!this.registrationOpen) return false;
  
  if (this.registrationCloseDate) {
    return new Date() <= new Date(this.registrationCloseDate);
  }
  
  return true;
};

// Check if event has passed
CalendarEventSchema.methods.isPast = function() {
  return new Date() > new Date(this.endDate);
};

// Add attendee to event
CalendarEventSchema.methods.addAttendee = async function(attendeeData) {
  // Check if registration is open
  if (!this.isRegistrationOpen()) {
    throw new Error('Registration for this event is closed');
  }
  
  // Check if event is full
  if (this.isFullyBooked()) {
    throw new Error('This event is fully booked');
  }
  
  // Check if attendee is already registered
  const isAlreadyRegistered = this.attendees.some(attendee => {
    if (attendeeData.user && attendee.user) {
      return attendee.user.toString() === attendeeData.user.toString();
    }
    if (attendeeData.email && attendee.email) {
      return attendee.email === attendeeData.email;
    }
    return false;
  });
  
  if (isAlreadyRegistered) {
    throw new Error('Attendee is already registered for this event');
  }
  
  // Add attendee
  this.attendees.push({
    ...attendeeData,
    invitedAt: new Date(),
  });
  
  // Increment registration count
  this.currentRegistrations += 1;
  
  return this.save();
};

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);