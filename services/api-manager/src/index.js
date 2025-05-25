// src/index.js
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const winston = require('winston');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import DB connection
const connectDB = require('./utils/db');

// Import route files
const apiTemplateRoutes = require('./routes/apiTemplateRoutes');
const utmLinkRoutes = require('./routes/utmLinkRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const crmRoutes = require('./routes/crmRoutes');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Import error handler middleware
const { errorHandler } = require('./middleware/error');

// Set up logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Sanitize data
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Compress responses
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // default 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/api-templates', apiTemplateRoutes);
app.use('/api/v1/utm-links', utmLinkRoutes);
app.use('/api/v1/promo-codes', promoCodeRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Management service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Add API docs if enabled
if (process.env.ENABLE_API_DOCS === 'true') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./docs/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Set up Socket.IO events
io.on('connection', (socket) => {
  logger.info(`New socket connection: ${socket.id}`);
  
  socket.on('join', (room) => {
    socket.join(room);
    logger.info(`Socket ${socket.id} joined room ${room}`);
  });
  
  socket.on('leave', (room) => {
    socket.leave(room);
    logger.info(`Socket ${socket.id} left room ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Schedule cron jobs
// Run analytics update every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Running scheduled analytics update');
    // Import analytics service to avoid circular dependencies
    const { updateAllAnalytics } = require('./services/analyticsService');
    await updateAllAnalytics();
    logger.info('Scheduled analytics update completed successfully');
  } catch (error) {
    logger.error('Scheduled analytics update failed', { error: error.message });
  }
});

// Clean expired promo codes every day
cron.schedule('0 1 * * *', async () => {
  try {
    logger.info('Running promo code cleanup');
    // Import promo code service
    const { cleanupExpiredPromoCodes } = require('./services/promoCodeService');
    await cleanupExpiredPromoCodes();
    logger.info('Promo code cleanup completed successfully');
  } catch (error) {
    logger.error('Promo code cleanup failed', { error: error.message });
  }
});

// Update segment data every 6 hours
cron.schedule('0 */6 * * *', async () => {
  try {
    logger.info('Running segment data update');
    // Import segment service
    const { updateAllSegments } = require('./services/segmentService');
    await updateAllSegments();
    logger.info('Segment data update completed successfully');
  } catch (error) {
    logger.error('Segment data update failed', { error: error.message });
  }
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

// Export app for testing
module.exports = { app, httpServer, io };