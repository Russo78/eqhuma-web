// eqhuma-courses-service/src/routes/authRoutes.js
const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Get current user profile
router.get('/me', protect, authController.getMe);

// Update profile
router.put('/profile', protect, authController.updateProfile);

// Update password
router.put(
  '/password',
  [
    protect,
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.updatePassword
);

// Upload profile image
router.post(
  '/upload-profile-image',
  protect,
  upload.profileImage,
  upload.handleUploadError,
  authController.uploadProfileImage
);

// SSO routes for integration with main service
router.post('/verify-token', authController.verifyToken);
router.post('/sso', authController.ssoLogin);

module.exports = router;