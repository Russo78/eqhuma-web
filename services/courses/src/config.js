// eqhuma-courses-service/src/config.js
require('dotenv').config();
const path = require('path');

module.exports = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  
  // Database configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/eqhuma_courses',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  
  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173',
  
  // Payment configuration
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mainServiceUrl: process.env.MAIN_SERVICE_URL || 'http://localhost:3000',
  
  // File upload configuration
  maxFileSize: process.env.MAX_FILE_SIZE || '50mb',
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
  
  // AWS S3 configuration for production file storage
  aws: {
    region: process.env.AWS_REGION,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET
  },
  
  // Email configuration
  mail: {
    provider: process.env.MAIL_PROVIDER || 'smtp',
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM || 'noreply@eqhuma.com'
  }
};