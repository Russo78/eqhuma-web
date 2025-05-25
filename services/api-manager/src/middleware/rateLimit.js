// src/middleware/rateLimit.js
const { ApiError } = require('./error');
const config = require('../config');

/**
 * In-memory store for rate limiting
 * Note: In production, use Redis or another distributed cache instead
 */
const rateLimitStore = {
  // Structure: { [key: string]: { count: number, resetTime: number } }
  requests: new Map(),
  
  /**
   * Get current count for a key
   * @param {string} key - Unique identifier for the client
   * @returns {Object} Rate limit information for this key
   */
  get(key) {
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) {  // 1% chance on each request
      this.cleanup();
    }
    
    // Get or initialize record
    if (!this.requests.has(key)) {
      return { count: 0, resetTime: now + (config.rateLimitWindowMs || 60000) };
    }
    
    const record = this.requests.get(key);
    
    // If the window has expired, reset the counter
    if (now > record.resetTime) {
      return { count: 0, resetTime: now + (config.rateLimitWindowMs || 60000) };
    }
    
    return record;
  },
  
  /**
   * Increment counter for a key
   * @param {string} key - Unique identifier for the client
   * @returns {Object} Updated rate limit information
   */
  increment(key) {
    const now = Date.now();
    const record = this.get(key);
    
    // If expired, set new window
    if (now > record.resetTime) {
      const newRecord = { 
        count: 1, 
        resetTime: now + (config.rateLimitWindowMs || 60000) 
      };
      this.requests.set(key, newRecord);
      return newRecord;
    }
    
    // Otherwise increment
    record.count += 1;
    this.requests.set(key, record);
    return record;
  },
  
  /**
   * Clean up expired entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
};

/**
 * Creates a rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = config.rateLimitWindowMs || 60 * 1000, // 1 minute by default
    max = config.rateLimitMax || 100,                 // 100 requests per window by default
    message = 'Too many requests, please try again later',
    statusCode = 429,
    keyGenerator = (req) => {
      // Default key is IP address
      return req.ip || req.connection.remoteAddress;
    },
    skip = () => false,
    headers = true,
  } = options;
  
  return (req, res, next) => {
    // Skip rate limiting if skip function returns true
    if (skip(req, res)) {
      return next();
    }
    
    // Get client identifier
    let key = keyGenerator(req);
    
    // If request is authenticated, use API key or user ID
    if (req.apiInstance) {
      key = `api:${req.apiInstance._id}`;
    } else if (req.user) {
      key = `user:${req.user.id}`;
    }
    
    // Get current record and increment
    const record = rateLimitStore.increment(key);
    
    // Calculate time remaining in window
    const timeRemaining = Math.max(0, record.resetTime - Date.now());
    const remainingRequests = Math.max(0, max - record.count);
    
    // Set rate limit headers if enabled
    if (headers) {
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remainingRequests);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
    }
    
    // Allow the request if under limit
    if (record.count <= max) {
      return next();
    }
    
    // Otherwise, reject with 429 Too Many Requests
    if (headers) {
      res.setHeader('Retry-After', Math.ceil(timeRemaining / 1000));
    }
    
    next(new ApiError(message, statusCode));
  };
};

/**
 * Default rate limiter with standard settings
 */
const standardRateLimiter = createRateLimiter();

/**
 * Strict rate limiter for authentication routes
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again after 15 minutes'
});

/**
 * API rate limiter with higher limits for authenticated API users
 */
const apiRateLimiter = createRateLimiter({
  // Different limits based on authentication status
  keyGenerator: (req) => {
    if (req.apiInstance) {
      return `api:${req.apiInstance._id}`;
    } else if (req.user) {
      return `user:${req.user.id}`;
    }
    return req.ip;
  },
  // Skip rate limiting for certain users or admin roles
  skip: (req) => {
    // Skip for admin users
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      return true;
    }
    
    // Skip based on API plan if available
    if (req.apiInstance && req.apiInstance.plan === 'unlimited') {
      return true;
    }
    
    return false;
  },
  // Different limits for different tiers
  max: (req) => {
    if (req.apiInstance) {
      switch(req.apiInstance.tier) {
        case 'premium': return 5000;
        case 'business': return 2000;
        case 'basic': return 1000;
        default: return 100;
      }
    } else if (req.user) {
      return 1000;  // Higher limit for authenticated users
    }
    return 100;  // Default limit for unauthenticated requests
  }
});

module.exports = {
  createRateLimiter,
  standardRateLimiter,
  authRateLimiter,
  apiRateLimiter
};