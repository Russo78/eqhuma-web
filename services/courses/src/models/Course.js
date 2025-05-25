// eqhuma-courses-service/src/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot be more than 200 characters'],
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    discountValidUntil: {
      type: Date,
    },
    coverImage: {
      type: String,
      default: 'default-course-cover.jpg',
    },
    duration: {
      type: Number, // In minutes
      default: 0,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
      default: 'all-levels',
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    tags: [String],
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    requirements: [String],
    objectives: [String],
    targetAudience: [String],
    language: {
      type: String,
      default: 'es',
    },
    certificateAvailable: {
      type: Boolean,
      default: false,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    accessPeriod: {
      type: Number, // In days, 0 means lifetime access
      default: 0,
    },
    maxStudents: {
      type: Number, // 0 means unlimited
      default: 0, 
    },
    promotionalVideo: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from title
CourseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Virtual for lessons
CourseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
});

// Virtual for enrollments
CourseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  justOne: false,
});

// Index for search
CourseSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Course', CourseSchema);