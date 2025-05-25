// src/config.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Base configuration for the API Manager
 */
const config = {
  // API server settings
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB connection string
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/eqhuma-api-manager',
  
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-for-development-only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Default API key for development
  defaultApiKey: process.env.DEFAULT_API_KEY || 'dev-api-key-1234',
  
  // API Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 60000, 10), // 1 minute
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || 100, 10), // 100 requests per window
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // CORS settings
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'https://eqhuma.com'],
  
  // Cookie settings
  cookieSecret: process.env.COOKIE_SECRET || 'default-cookie-secret-for-development-only',
  cookieSecure: process.env.NODE_ENV === 'production',
  cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || 7 * 24 * 60 * 60 * 1000, 10), // 7 days in milliseconds
  
  // URL settings
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  shortUrlBase: process.env.SHORT_URL_BASE || 'https://eq.to/',
  
  // Webhook settings
  webhookSigningSecret: process.env.WEBHOOK_SIGNING_SECRET || 'default-webhook-signing-secret',
  webhookRetryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || 3, 10),
  
  // Service integrations
  services: {
    imss: {
      baseUrl: process.env.IMSS_API_BASE_URL,
      apiKey: process.env.IMSS_API_KEY
    },
    webinars: {
      baseUrl: process.env.WEBINARS_SERVICE_URL || 'http://localhost:4001',
      apiKey: process.env.WEBINARS_SERVICE_KEY
    },
    courses: {
      baseUrl: process.env.COURSES_SERVICE_URL || 'http://localhost:4002',
      apiKey: process.env.COURSES_SERVICE_KEY
    }
  },
  
  // Email settings
  email: {
    from: process.env.EMAIL_FROM || 'noreply@eqhuma.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY
  },
  
  // File storage settings
  fileStorage: {
    uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '..', 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, 10), // 5MB in bytes
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,application/pdf').split(',')
  }
};

module.exports = config;