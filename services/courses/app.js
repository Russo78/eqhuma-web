// eqhuma-courses-service/app.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const { errorHandler, notFound, validationError, duplicateKeyError, rateLimitError } = require('./src/middleware/errorMiddleware');
const config = require('./src/config');
const connectDB = require('./src/utils/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const calendarRoutes = require('./src/routes/calendarRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Body parser middleware
app.use(express.json({ limit: config.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.maxFileSize }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
// Set security headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: config.corsOrigins.split(','),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use('/api', limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API version
const API_VERSION = '/api/v1';

// Mount routes
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/courses`, courseRoutes);
app.use(`${API_VERSION}/lessons`, lessonRoutes);
app.use(`${API_VERSION}/enrollments`, enrollmentRoutes);
app.use(`${API_VERSION}/calendar`, calendarRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'EQHuma Courses Microservice API',
    version: '1.0.0',
    status: 'active'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: process.uptime()
  });
});

// Error handlers
app.use(validationError);
app.use(duplicateKeyError);
app.use(rateLimitError);
app.use(notFound);
app.use(errorHandler);

module.exports = app;