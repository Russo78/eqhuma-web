// src/utils/userAgentParser.js
/**
 * User Agent Parser - Utility functions to extract browser, OS and device type info from user agent
 */

/**
 * Parse user agent string and extract browser, OS and device information
 * @param {string} userAgent - The user agent string from request headers
 * @returns {Object} Object containing browser, os, and deviceType information
 */
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return { browser: 'Unknown', os: 'Unknown', deviceType: 'unknown' };
  }

  const ua = userAgent.toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop'; // Default to desktop

  // Detect browser
  if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('android')) {
    os = 'Android';
    deviceType = 'mobile';
  } else if (ua.includes('iphone')) {
    os = 'iOS';
    deviceType = 'mobile';
  } else if (ua.includes('ipad')) {
    os = 'iOS';
    deviceType = 'tablet';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  // Detect device type based on user agent if not already determined
  if (deviceType === 'desktop') {
    if (
      ua.includes('mobile') || 
      ua.includes('android') || 
      ua.includes('iphone')
    ) {
      deviceType = 'mobile';
    } else if (
      ua.includes('tablet') || 
      ua.includes('ipad') || 
      ua.includes('kindle')
    ) {
      deviceType = 'tablet';
    }
  }

  return { browser, os, deviceType };
}

module.exports = { parseUserAgent };