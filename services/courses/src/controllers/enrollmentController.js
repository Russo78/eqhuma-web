// eqhuma-courses-service/src/controllers/enrollmentController.js
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { Enrollment, Progress } = require('../models/Enrollment');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Enroll in a course
 * @route   POST /api/v1/courses/:courseId/enroll
 * @access  Private
 */
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course is published
    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished course'
      });
    }
    
    // Check if course has reached maximum students
    if (course.maxStudents > 0) {
      const currentEnrollments = await Enrollment.countDocuments({ course: courseId });
      if (currentEnrollments >= course.maxStudents) {
        return res.status(400).json({
          success: false,
          message: 'Course has reached maximum enrollment limit'
        });
      }
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }
    
    // Handle free vs paid course
    const { corporateCode } = req.body;
    let paymentStatus = 'pending';
    
    // Check for free course or valid corporate code (implement code validation as needed)
    if (course.price === 0) {
      paymentStatus = 'free';
    }
    
    // Create enrollment record
    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: courseId,
      status: 'active',
      paymentStatus,
      enrollmentType: corporateCode ? 'corporate' : 'individual',
      corporateCode,
      amount: course.discountPrice && new Date() <= new Date(course.discountValidUntil) 
        ? course.discountPrice 
        : course.price,
      currency: 'MXN'
    });
    
    // Initialize progress records for all lessons if it's a free course
    if (paymentStatus === 'free') {
      const lessons = await mongoose.model('Lesson').find({ course: courseId });
      
      // Create progress records for each lesson
      const progressRecords = lessons.map(lesson => ({
        enrollment: enrollment._id,
        lesson: lesson._id,
        completed: false,
        watchTime: 0,
        lastPosition: 0
      }));
      
      if (progressRecords.length > 0) {
        await Progress.insertMany(progressRecords);
      }
    }
    
    // Return different responses based on whether payment is needed
    if (paymentStatus === 'free') {
      // Update course enrollment count
      course.enrollmentCount += 1;
      await course.save();
      
      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Successfully enrolled in course'
      });
    } else {
      // For paid courses, create a payment session
      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Enrollment created. Payment required to access course content.',
        requiresPayment: true
      });
    }
    
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during enrollment'
    });
  }
};

/**
 * @desc    Get all enrollments (admin only)
 * @route   GET /api/v1/enrollments
 * @access  Private (Admin)
 */
exports.getEnrollments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25,
      status,
      courseId,
      userId,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.course = courseId;
    if (userId) filter.user = userId;
    
    // Setup pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort configuration
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;
    
    // Execute query
    const enrollments = await Enrollment.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count
    const total = await Enrollment.countDocuments(filter);
    
    res.json({
      success: true,
      data: enrollments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrollments'
    });
  }
};

/**
 * @desc    Get user's enrollments
 * @route   GET /api/v1/enrollments/my-enrollments
 * @access  Private
 */
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate({
        path: 'course',
        select: 'title slug description coverImage duration level category instructor',
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
 * @desc    Get single enrollment
 * @route   GET /api/v1/enrollments/:id
 * @access  Private
 */
exports.getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name email profileImage'
        }
      });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if user is authorized to view this enrollment
    if (
      enrollment.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      enrollment.course.instructor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this enrollment'
      });
    }
    
    // Get progress
    const progress = await Progress.find({ enrollment: enrollment._id })
      .populate('lesson', 'title order duration contentType');
    
    res.json({
      success: true,
      data: {
        enrollment,
        progress
      }
    });
  } catch (error) {
    console.error('Error getting enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrollment'
    });
  }
};

/**
 * @desc    Update enrollment status
 * @route   PUT /api/v1/enrollments/:id
 * @access  Private (Admin/Instructor)
 */
exports.updateEnrollment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    let enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Get course to check permissions
    const course = await Course.findById(enrollment.course);
    
    // Only admin, course instructor, or the enrolled user can update
    if (
      req.user.role !== 'admin' && 
      course.instructor.toString() !== req.user.id &&
      enrollment.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this enrollment'
      });
    }
    
    // Update fields
    const updateData = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    
    // Update enrollment
    enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating enrollment'
    });
  }
};

/**
 * @desc    Create payment session for enrollment
 * @route   POST /api/v1/enrollments/:id/payment
 * @access  Private
 */
exports.createPaymentSession = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course', 'title price description coverImage');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Verify ownership
    if (enrollment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this enrollment'
      });
    }
    
    // Check if already paid
    if (['completed', 'free'].includes(enrollment.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'This enrollment is already paid'
      });
    }
    
    // Get or create Stripe customer
    let user = await User.findById(req.user.id);
    let customer;
    
    if (user.stripeCustomerId) {
      customer = user.stripeCustomerId;
    } else {
      const customerData = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      customer = customerData.id;
      user.stripeCustomerId = customer;
      await user.save({ validateBeforeSave: false });
    }
    
    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: enrollment.course.title,
              description: enrollment.course.description.substring(0, 100) + '...',
              images: [enrollment.course.coverImage ? `${process.env.BASE_URL}/uploads/${enrollment.course.coverImage}` : null].filter(Boolean)
            },
            unit_amount: enrollment.amount * 100 // Amount in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/courses/enrollment-success?id=${enrollment._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${enrollment.course._id}`,
      metadata: {
        enrollmentId: enrollment._id.toString(),
        courseId: enrollment.course._id.toString(),
        userId: req.user.id
      }
    });
    
    // Update enrollment with payment id
    enrollment.paymentId = session.id;
    await enrollment.save();
    
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment session'
    });
  }
};

/**
 * @desc    Process webhook from Stripe
 * @route   POST /api/v1/enrollments/webhook
 * @access  Public
 */
exports.handlePaymentWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    // Verify webhook signature
    let event;
    
    if (webhookSecret) {
      const signature = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(
        req.rawBody, // Make sure express is configured to provide raw body
        signature,
        webhookSecret
      );
    } else {
      // Webhook secret not configured, use the event as-is (development only)
      event = req.body;
    }
    
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract enrollment ID from metadata
      const { enrollmentId } = session.metadata;
      
      if (!enrollmentId) {
        throw new Error('No enrollment ID provided in webhook metadata');
      }
      
      // Update enrollment status
      const enrollment = await Enrollment.findById(enrollmentId);
      
      if (!enrollment) {
        throw new Error(`Enrollment ${enrollmentId} not found`);
      }
      
      enrollment.paymentStatus = 'completed';
      enrollment.transactionId = session.payment_intent;
      await enrollment.save();
      
      // Create progress records for all lessons
      const lessons = await mongoose.model('Lesson').find({ course: enrollment.course });
      
      // Create progress records for each lesson
      const progressRecords = lessons.map(lesson => ({
        enrollment: enrollment._id,
        lesson: lesson._id,
        completed: false,
        watchTime: 0,
        lastPosition: 0
      }));
      
      if (progressRecords.length > 0) {
        await Progress.insertMany(progressRecords);
      }
      
      console.log(`🎉 Payment successful for enrollment ${enrollmentId}`);
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const { enrollmentId } = session.metadata;
      
      if (enrollmentId) {
        await Enrollment.findByIdAndUpdate(enrollmentId, {
          $set: { paymentStatus: 'failed' }
        });
        
        console.log(`Payment session expired for enrollment ${enrollmentId}`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ success: false, message: `Webhook error: ${error.message}` });
  }
};

/**
 * @desc    Issue certificate for completed course
 * @route   POST /api/v1/enrollments/:id/certificate
 * @access  Private (Admin/Instructor)
 */
exports.issueCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title instructor');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check permissions
    if (
      req.user.role !== 'admin' && 
      enrollment.course.instructor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to issue certificate'
      });
    }
    
    // Check if course is completed
    if (enrollment.progressPercentage < 100) {
      return res.status(400).json({
        success: false,
        message: 'User has not completed the course yet'
      });
    }
    
    // Generate certificate URL (this would typically involve generating a PDF)
    const certificateUrl = `certificates/${enrollment._id}-${Date.now()}.pdf`;
    
    // Update enrollment with certificate information
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = certificateUrl;
    await enrollment.save();
    
    // In a real implementation, you would generate the certificate here
    // and save it to the specified location
    
    res.json({
      success: true,
      data: {
        certificateUrl,
        enrollment
      },
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while issuing certificate'
    });
  }
};

/**
 * @desc    Get enrollment statistics
 * @route   GET /api/v1/enrollments/stats
 * @access  Private (Admin)
 */
exports.getEnrollmentStats = async (req, res) => {
  try {
    // Total enrollments
    const totalEnrollments = await Enrollment.countDocuments();
    
    // Active enrollments
    const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
    
    // Completed enrollments
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    
    // Revenue statistics
    const revenueStats = await Enrollment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { 
        _id: null, 
        totalRevenue: { $sum: '$amount' },
        avgRevenue: { $avg: '$amount' },
        count: { $sum: 1 }
      }}
    ]);
    
    // Monthly enrollments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyEnrollments = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          count: { $sum: 1 },
          revenue: { 
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'completed'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format monthly data
    const monthlyData = monthlyEnrollments.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      count: item.count,
      revenue: item.revenue
    }));
    
    res.json({
      success: true,
      data: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        revenue: revenueStats.length > 0 ? {
          total: revenueStats[0].totalRevenue,
          average: revenueStats[0].avgRevenue,
          count: revenueStats[0].count
        } : {
          total: 0,
          average: 0,
          count: 0
        },
        monthlyData
      }
    });
  } catch (error) {
    console.error('Error getting enrollment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrollment statistics'
    });
  }
};