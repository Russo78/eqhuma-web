// src/utils/geoIpLookup.js
/**
 * GeoIP Lookup - Utility functions to determine geographic location from IP address
 */
const axios = require('axios');
const NodeCache = require('node-cache');

// Cache IP lookups for 24 hours to avoid repeating API calls
const geoIpCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

/**
 * Look up geographic data based on an IP address
 * @param {string} ipAddress - The IP address to lookup
 * @returns {Promise<Object>} Object containing country, region, and city
 */
async function lookupGeoData(ipAddress) {
  // Don't look up private or local IPs
  if (!ipAddress || 
      ipAddress === '127.0.0.1' || 
      ipAddress === 'localhost' ||
      ipAddress.startsWith('192.168.') || 
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.16.') || 
      ipAddress.startsWith('::1')) {
    return {
      country: 'Local',
      region: 'Local',
      city: 'Local'
    };
  }

  // Return cached response if available
  const cachedResponse = geoIpCache.get(ipAddress);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Use free IP geolocation service
    // Note: In production, you might want to use a paid service with better reliability and higher rate limits
    const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
    
    if (response.data && !response.data.error) {
      const geoData = {
        country: response.data.country_name || response.data.country || 'Unknown',
        region: response.data.region || 'Unknown',
        city: response.data.city || 'Unknown',
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone
      };
      
      // Cache the result
      geoIpCache.set(ipAddress, geoData);
      
      return geoData;
    }
    
    return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
  } catch (error) {
    console.error(`Error looking up IP address ${ipAddress}:`, error.message);
    return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
  }
}

/**
 * Clear the geo IP cache
 */
function clearGeoCache() {
  geoIpCache.flushAll();
}

module.exports = { lookupGeoData, clearGeoCache };