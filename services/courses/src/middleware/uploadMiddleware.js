// eqhuma-courses-service/src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure upload directory exists
const createDirIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine subdirectory based on file type and usage
    let uploadPath = path.join(config.uploadDir);
    
    if (file.fieldname === 'profileImage') {
      uploadPath = path.join(config.uploadDir, 'profiles');
    } else if (file.fieldname === 'courseImage') {
      uploadPath = path.join(config.uploadDir, 'courses');
    } else if (file.fieldname === 'lessonResource') {
      uploadPath = path.join(config.uploadDir, 'lessons');
    } else if (file.fieldname === 'eventImage') {
      uploadPath = path.join(config.uploadDir, 'events');
    }
    
    createDirIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, uniqueSuffix + fileExt);
  }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on field
  const imageFileTypes = /jpeg|jpg|png|gif|webp/;
  const documentFileTypes = /pdf|doc|docx|xls|exceljs|ppt|pptx/;
  const videoFileTypes = /mp4|avi|mov|wmv|flv|mkv|webm/;
  
  // Get file extension
  const extname = path.extname(file.originalname).toLowerCase().substring(1);
  
  // Check file type based on field name
  if (file.fieldname === 'profileImage' || file.fieldname === 'courseImage' || file.fieldname === 'eventImage') {
    if (imageFileTypes.test(extname)) {
      return cb(null, true);
    }
  } else if (file.fieldname === 'lessonResource') {
    if (imageFileTypes.test(extname) || documentFileTypes.test(extname)) {
      return cb(null, true);
    }
  } else if (file.fieldname === 'lessonVideo') {
    if (videoFileTypes.test(extname)) {
      return cb(null, true);
    }
  }
  
  // Reject file if it doesn't match allowed types
  cb(new Error(`Unsupported file type: ${extname}`), false);
};

// Export upload middleware configurations
module.exports = {
  // Profile image upload
  profileImage: multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }).single('profileImage'),
  
  // Course image upload
  courseImage: multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  }).single('courseImage'),
  
  // Lesson resource upload (PDF, documents, images)
  lessonResource: multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
  }).single('lessonResource'),
  
  // Lesson video upload
  lessonVideo: multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
  }).single('lessonVideo'),
  
  // Event image upload
  eventImage: multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  }).single('eventImage'),
  
  // Error handler for multer
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File is too large'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }
    
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    next();
  }
};