// eqhuma-courses-service/src/models/Enrollment.js
const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'completed'],
      default: 'active',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed', 'free'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    paymentId: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'MXN',
    },
    enrollmentType: {
      type: String,
      enum: ['individual', 'corporate'],
      default: 'individual',
    },
    corporateCode: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress tracking
EnrollmentSchema.virtual('progress', {
  ref: 'Progress',
  localField: '_id',
  foreignField: 'enrollment',
  justOne: false,
});

// Create a unique index on user and course to prevent duplicate enrollments
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Calculate expiration date based on course access period
EnrollmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('enrolledAt')) {
    try {
      // Get the course access period
      const Course = mongoose.model('Course');
      const course = await Course.findById(this.course);
      
      // Only set expiration if course has limited access period
      if (course && course.accessPeriod > 0) {
        const expirationDate = new Date(this.enrolledAt);
        expirationDate.setDate(expirationDate.getDate() + course.accessPeriod);
        this.expiresAt = expirationDate;
      }

      // If it's a new enrollment, increment the course enrollment count
      if (this.isNew) {
        await Course.findByIdAndUpdate(this.course, {
          $inc: { enrollmentCount: 1 }
        });
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Define Progress schema for tracking lesson completion
const ProgressSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Enrollment',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  watchTime: {
    type: Number, // In seconds
    default: 0,
  },
  lastPosition: {
    type: Number, // Video position in seconds
    default: 0,
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  quizAttempts: {
    type: Number,
    default: 0,
  },
  assignmentSubmitted: {
    type: Boolean,
    default: false,
  },
  assignmentScore: {
    type: Number,
  },
  assignmentFeedback: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true
});

// Define unique index for enrollment and lesson
ProgressSchema.index({ enrollment: 1, lesson: 1 }, { unique: true });

// Create Progress model
const Progress = mongoose.model('Progress', ProgressSchema);

// Export both models
module.exports = {
  Enrollment: mongoose.model('Enrollment', EnrollmentSchema),
  Progress
};