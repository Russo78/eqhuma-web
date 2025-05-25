// eqhuma-courses-service/src/controllers/courseController.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { Enrollment } = require('../models/Enrollment');

/**
 * @desc    Get all courses
 * @route   GET /api/v1/courses
 * @access  Public
 */
exports.getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      category,
      level,
      instructor,
      search,
      status,
      featured,
      minPrice,
      maxPrice
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only show published courses for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }
    
    // Apply filters if provided
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    if (featured) filter.featured = featured === 'true';
    
    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Prepare sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Calculate pagination values
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const courses = await Course.find(filter)
      .populate('instructor', 'name profileImage bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Course.countDocuments(filter);

    // Return response
    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

/**
 * @desc    Get single course by ID or slug
 * @route   GET /api/v1/courses/:id
 * @access  Public
 */
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    let course;

    // Check if ID is valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      course = await Course.findById(id);
    } else {
      // If not, try to find by slug
      course = await Course.findOne({ slug: id });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If course is not published and user is not admin or the instructor
    if (
      course.status !== 'published' &&
      (!req.user || (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Course is not published'
      });
    }

    // Populate instructor details
    await course.populate('instructor', 'name email profileImage bio');

    // If user is logged in, check if they're enrolled
    let isEnrolled = false;
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: course._id
      });
      isEnrolled = !!enrollment;
    }

    // Get total enrollment count
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });

    // Return course with enrollment info
    res.json({
      success: true,
      data: {
        ...course.toObject(),
        isEnrolled,
        enrollmentId: enrollment ? enrollment._id : null,
        enrollmentCount
      }
    });
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/v1/courses
 * @access  Private (Admin/Instructor)
 */
exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Set instructor to current user
    req.body.instructor = req.user.id;

    // Create course
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A course with that title already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/v1/courses/:id
 * @access  Private (Admin/Owner)
 */
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Update course
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A course with that title already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/v1/courses/:id
 * @access  Private (Admin/Owner)
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Check if there are enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
    if (enrollmentCount > 0 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments. Please contact an admin.'
      });
    }

    // Delete course
    await course.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

/**
 * @desc    Upload course cover image
 * @route   POST /api/v1/courses/:id/upload-cover
 * @access  Private (Admin/Owner)
 */
exports.uploadCourseCover = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Update cover image path
    course.coverImage = req.file.filename;
    await course.save();

    res.json({
      success: true,
      data: {
        coverImage: course.coverImage
      }
    });
  } catch (error) {
    console.error('Error uploading course cover:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading cover image'
    });
  }
};

/**
 * @desc    Get course categories
 * @route   GET /api/v1/courses/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    // Aggregate unique categories
    const categories = await Course.distinct('category');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

/**
 * @desc    Get featured courses
 * @route   GET /api/v1/courses/featured
 * @access  Public
 */
exports.getFeaturedCourses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const courses = await Course.find({
      status: 'published',
      featured: true
    })
      .populate('instructor', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error getting featured courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured courses'
    });
  }
};

/**
 * @desc    Get my courses (as instructor)
 * @route   GET /api/v1/courses/my-courses
 * @access  Private
 */
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error getting my courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching my courses'
    });
  }
};

/**
 * @desc    Get courses I'm enrolled in
 * @route   GET /api/v1/courses/my-enrollments
 * @access  Private
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name profileImage'
        }
      })
      .sort({ enrolledAt: -1 });

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    console.error('Error getting my enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrollments'
    });
  }
};

/**
 * @desc    Get course statistics (admin only)
 * @route   GET /api/v1/courses/stats
 * @access  Private (Admin)
 */
exports.getCourseStats = async (req, res) => {
  try {
    // Total courses
    const totalCourses = await Course.countDocuments();
    
    // Total published courses
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    
    // Total enrollments
    const totalEnrollments = await Enrollment.countDocuments();
    
    // Popular courses (by enrollment)
    const popularCourses = await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $project: {
          title: 1,
          slug: 1,
          category: 1,
          instructor: 1,
          enrollmentCount: { $size: '$enrollments' }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Courses by category
    const categoryCounts = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        popularCourses,
        categoryCounts
      }
    });
  } catch (error) {
    console.error('Error getting course stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course statistics'
    });
  }
};