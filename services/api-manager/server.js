// server.js
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { createServer } = require('http');


// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./src/utils/db');

// Import middleware
const { errorHandler } = require('./src/middleware/error');

// Import routes
const apiTemplateRoutes = require('./src/routes/apiTemplateRoutes');
const apiInstanceRoutes = require('./src/routes/apiInstanceRoutes');
const marketingRoutes = require('./src/routes/marketingRoutes');
const crmRoutes = require('./src/routes/crmRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP param pollution

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // default: 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // default: limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

// Apply rate limiting to API routes
app.use('/api', limiter);

// Compression
app.use(compression());

// API Documentation
if (process.env.ENABLE_API_DOCS === 'true' || process.env.NODE_ENV === 'development') {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'EQHuma API Manager API',
        version: '1.0.0',
        description: 'EQHuma API Manager Microservice API Documentation',
        contact: {
          name: 'EQHuma Support',
          email: 'support@eqhuma.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}`,
          description: 'Development Server',
        },
        {
          url: 'https://api.eqhuma.com',
          description: 'Production Server',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
    },
    apis: ['./src/routes/*.js', './src/models/*.js'],
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Mount routers
const apiVersion = '/api/v1';
app.use(`${apiVersion}/api-templates`, apiTemplateRoutes);
app.use(`${apiVersion}/api-instances`, apiInstanceRoutes);
app.use(`${apiVersion}/marketing`, marketingRoutes);
app.use(`${apiVersion}/crm`, crmRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    service: 'EQHuma API Manager',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to EQHuma API Manager API',
    docs: '/api-docs',
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not found - ${req.originalUrl}`,
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;