// eqhuma-courses-service/src/controllers/lessonController.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { Enrollment, Progress } = require('../models/Enrollment');

/**
 * @desc    Get all lessons for a course
 * @route   GET /api/v1/courses/:courseId/lessons
 * @access  Mixed (Public for preview lessons, Private for enrolled users)
 */
exports.getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user has access to the course
    let hasFullAccess = false;
    
    // Course instructors and admins have full access
    if (req.user && (req.user.role === 'admin' || course.instructor.toString() === req.user.id)) {
      hasFullAccess = true;
    } else {
      // Check if user is enrolled
      if (req.user) {
        const enrollment = await Enrollment.findOne({
          user: req.user.id,
          course: courseId,
          status: 'active'
        });
        
        if (enrollment) {
          hasFullAccess = true;
        }
      }
    }
    
    // Get all lessons
    const lessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 });
    
    // Filter lessons based on access
    const accessibleLessons = hasFullAccess 
      ? lessons 
      : lessons.filter(lesson => lesson.isPreview || lesson.status === 'published');
    
    // For enrolled users, add progress information
    let lessonsWithProgress = accessibleLessons;
    
    if (hasFullAccess && req.user) {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: courseId
      });
      
      if (enrollment) {
        // Get progress for all lessons
        const progresses = await Progress.find({
          enrollment: enrollment._id
        });
        
        // Map the progress to each lesson
        lessonsWithProgress = accessibleLessons.map(lesson => {
          const lessonProgress = progresses.find(
            p => p.lesson.toString() === lesson._id.toString()
          );
          
          return {
            ...lesson.toObject(),
            progress: lessonProgress ? {
              completed: lessonProgress.completed,
              completedAt: lessonProgress.completedAt,
              lastPosition: lessonProgress.lastPosition,
              watchTime: lessonProgress.watchTime,
              quizScore: lessonProgress.quizScore,
              assignmentSubmitted: lessonProgress.assignmentSubmitted
            } : null
          };
        });
      }
    }
    
    res.json({
      success: true,
      count: lessonsWithProgress.length,
      data: lessonsWithProgress
    });
  } catch (error) {
    console.error('Error getting lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lessons'
    });
  }
};

/**
 * @desc    Get single lesson
 * @route   GET /api/v1/lessons/:id
 * @access  Mixed (Public for preview lessons, Private for enrolled users)
 */
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get related course
    const course = await Course.findById(lesson.course);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found'
      });
    }
    
    // Check if user has access to the lesson
    let hasAccess = lesson.isPreview;
    
    // Course instructors and admins have access
    if (req.user && (req.user.role === 'admin' || course.instructor.toString() === req.user.id)) {
      hasAccess = true;
    } else if (req.user) {
      // Check if user is enrolled
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: lesson.course,
        status: 'active'
      });
      
      if (enrollment) {
        hasAccess = true;
        
        // Get progress for this lesson
        const progress = await Progress.findOne({
          enrollment: enrollment._id,
          lesson: lesson._id
        });
        
        // If progress exists, attach it to the lesson
        if (progress) {
          lesson = {
            ...lesson.toObject(),
            progress: {
              completed: progress.completed,
              completedAt: progress.completedAt,
              lastPosition: progress.lastPosition,
              watchTime: progress.watchTime,
              quizScore: progress.quizScore,
              assignmentSubmitted: progress.assignmentSubmitted
            }
          };
        }
      }
    }
    
    // If user doesn't have access and lesson is not a preview
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Please enroll in the course to access this lesson.'
      });
    }
    
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error getting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lesson'
    });
  }
};

/**
 * @desc    Create new lesson
 * @route   POST /api/v1/courses/:courseId/lessons
 * @access  Private (Admin/Instructor)
 */
exports.createLesson = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    const { courseId } = req.params;
    
    // Check if course exists and user has permission
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Only course instructor or admin can add lessons
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this course'
      });
    }
    
    // Create the lesson
    const lesson = await Lesson.create({
      ...req.body,
      course: courseId
    });
    
    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lesson'
    });
  }
};

/**
 * @desc    Update lesson
 * @route   PUT /api/v1/lessons/:id
 * @access  Private (Admin/Owner)
 */
exports.updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get course to check ownership
    const course = await Course.findById(lesson.course);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found'
      });
    }
    
    // Check if user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lesson'
      });
    }
    
    // Update lesson
    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lesson'
    });
  }
};

/**
 * @desc    Delete lesson
 * @route   DELETE /api/v1/lessons/:id
 * @access  Private (Admin/Owner)
 */
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get course to check ownership
    const course = await Course.findById(lesson.course);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found'
      });
    }
    
    // Check if user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson'
      });
    }
    
    // Delete lesson
    await lesson.remove();
    
    // Re-order remaining lessons
    const remainingLessons = await Lesson.find({ course: course._id })
      .sort({ order: 1 });
    
    // Update order numbers
    for (let i = 0; i < remainingLessons.length; i++) {
      if (remainingLessons[i].order !== i + 1) {
        remainingLessons[i].order = i + 1;
        await remainingLessons[i].save();
      }
    }
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lesson'
    });
  }
};

/**
 * @desc    Upload video or resource for lesson
 * @route   POST /api/v1/lessons/:id/upload
 * @access  Private (Admin/Owner)
 */
exports.uploadLessonResource = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get course to check ownership
    const course = await Course.findById(lesson.course);
    
    // Check if user is course owner or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload resources for this lesson'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Get upload type and update appropriate field
    const { uploadType } = req.body;
    
    if (uploadType === 'video') {
      lesson.videoUrl = req.file.path;
      lesson.videoProvider = 'custom';
    } else if (uploadType === 'resource') {
      // Add to resources array
      lesson.resources.push({
        title: req.body.title || req.file.originalname,
        type: req.body.type || 'other',
        url: req.file.path,
        size: req.file.size,
        description: req.body.description || ''
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid upload type'
      });
    }
    
    await lesson.save();
    
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error uploading lesson resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading resource'
    });
  }
};

/**
 * @desc    Update lesson progress
 * @route   POST /api/v1/lessons/:id/progress
 * @access  Private (Enrolled Student)
 */
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, lastPosition, watchTime, quizScore, assignmentData } = req.body;
    
    // Get lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: lesson.course,
      status: 'active'
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to update progress'
      });
    }
    
    // Find or create progress record
    let progress = await Progress.findOne({
      enrollment: enrollment._id,
      lesson: lesson._id
    });
    
    if (!progress) {
      progress = new Progress({
        enrollment: enrollment._id,
        lesson: lesson._id,
        completed: false,
        lastPosition: 0,
        watchTime: 0
      });
    }
    
    // Update progress fields
    if (completed !== undefined) {
      progress.completed = completed;
      if (completed && !progress.completedAt) {
        progress.completedAt = new Date();
      }
    }
    
    if (lastPosition !== undefined) {
      progress.lastPosition = lastPosition;
    }
    
    if (watchTime !== undefined) {
      progress.watchTime = watchTime;
    }
    
    if (quizScore !== undefined && lesson.contentType === 'quiz') {
      progress.quizScore = quizScore;
      progress.quizAttempts += 1;
      
      // Mark as completed if score is above passing threshold
      if (lesson.quiz && lesson.quiz.passingScore && quizScore >= lesson.quiz.passingScore) {
        progress.completed = true;
        progress.completedAt = progress.completedAt || new Date();
      }
    }
    
    if (assignmentData && lesson.contentType === 'assignment') {
      progress.assignmentSubmitted = true;
      progress.notes = assignmentData.notes || progress.notes;
      // Assignment completion is marked by instructor later
    }
    
    // Save progress
    await progress.save();
    
    // Update overall course progress
    const allLessons = await Lesson.find({ course: lesson.course });
    const completedLessons = await Progress.countDocuments({
      enrollment: enrollment._id,
      completed: true
    });
    
    const progressPercentage = Math.floor((completedLessons / allLessons.length) * 100);
    
    // Update enrollment with progress percentage
    enrollment.progressPercentage = progressPercentage;
    enrollment.lastAccessedAt = new Date();
    
    // Check if course is completed
    if (progressPercentage === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      enrollment.status = 'completed';
    }
    
    await enrollment.save();
    
    res.json({
      success: true,
      data: progress,
      courseProgress: progressPercentage
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    });
  }
};

/**
 * @desc    Reorder lessons
 * @route   PUT /api/v1/courses/:courseId/lessons/reorder
 * @access  Private (Admin/Owner)
 */
exports.reorderLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { orderData } = req.body;
    
    if (!orderData || !Array.isArray(orderData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order data'
      });
    }
    
    // Verify course exists and check permissions
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reorder lessons for this course'
      });
    }
    
    // Update each lesson's order
    for (const item of orderData) {
      await Lesson.findByIdAndUpdate(
        item.lessonId,
        { order: item.order },
        { new: true, runValidators: true }
      );
    }
    
    // Get all lessons with updated order
    const lessons = await Lesson.find({ course: courseId })
      .sort({ order: 1 });
    
    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering lessons'
    });
  }
};