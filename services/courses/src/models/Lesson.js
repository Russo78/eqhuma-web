// eqhuma-courses-service/src/models/Lesson.js
const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // In minutes
      default: 0,
    },
    videoUrl: {
      type: String,
    },
    videoProvider: {
      type: String,
      enum: ['youtube', 'vimeo', 'wistia', 'custom', 'other'],
      default: 'custom',
    },
    videoThumbnail: {
      type: String,
    },
    content: {
      type: String,
    },
    contentType: {
      type: String,
      enum: ['video', 'article', 'quiz', 'assignment', 'resource'],
      default: 'video',
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['pdf', 'doc', 'image', 'link', 'other'],
          default: 'pdf',
        },
        url: {
          type: String,
          required: true,
        },
        size: {
          type: Number, // In bytes
        },
        description: String,
      },
    ],
    quiz: {
      questions: [
        {
          question: {
            type: String,
            required: true,
          },
          options: [
            {
              text: String,
              isCorrect: Boolean,
            },
          ],
          explanation: String,
          points: {
            type: Number,
            default: 1,
          },
        },
      ],
      passingScore: {
        type: Number,
        default: 70,
      },
      timeLimit: {
        type: Number, // In minutes, 0 means no limit
        default: 0,
      },
      attempts: {
        type: Number, // 0 means unlimited attempts
        default: 0,
      },
    },
    assignment: {
      description: String,
      instructions: String,
      dueDate: Date,
      maxScore: {
        type: Number,
        default: 100,
      },
      attachments: [
        {
          title: String,
          url: String,
          type: String,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-increment order value when adding a new lesson to a course
LessonSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Find the highest order for the course
    const highestOrderLesson = await this.constructor.findOne(
      { course: this.course },
      {},
      { sort: { order: -1 } }
    );

    if (highestOrderLesson) {
      this.order = highestOrderLesson.order + 1;
    } else {
      // This is the first lesson in the course
      this.order = 1;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to update course duration when lesson duration changes
LessonSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  
  // Find all lessons for the course
  const lessons = await this.constructor.find({ course: this.course });
  
  // Calculate total duration
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  
  // Update course duration
  await Course.findByIdAndUpdate(this.course, { duration: totalDuration });
});

// Delete related resources when lesson is deleted
LessonSchema.pre('remove', async function(next) {
  // Here you can add code to delete video files, resources, etc.
  next();
});

module.exports = mongoose.model('Lesson', LessonSchema);