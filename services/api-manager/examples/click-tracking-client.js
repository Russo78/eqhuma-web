/**
 * EQHuma API Click Tracking - Example Client Implementation
 * 
 * This example demonstrates how to integrate the EQHuma click tracking system
 * into a single-page application and track various user interactions.
 */

// Configuration
const CONFIG = {
  apiKey: 'your-api-key-here', // Replace with your actual API key
  apiBaseUrl: 'https://api.eqhuma.com/api/v1/api-tracking',
  debug: true // Set to false in production
};

/**
 * EQHuma Click Tracking Client
 * A lightweight client to interact with EQHuma's click tracking API
 */
class EQHumaTracker {
  constructor(config) {
    this.config = config;
    this.clickId = null;
    this.initialized = false;
    this.eventQueue = [];
    
    // Try to load click ID from storage
    this.loadClickId();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  /**
   * Initialize the tracker
   */
  init() {
    if (this.initialized) return;
    
    this.log('Initializing EQHuma tracker');
    
    // Track initial page view
    this.trackPageView();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Process any queued events
    this.processEventQueue();
    
    this.initialized = true;
  }
  
  /**
   * Set up automatic event listeners
   */
  setupEventListeners() {
    // Track all link clicks if data-track attribute is present
    document.addEventListener('click', (e) => {
      const trackElement = e.target.closest('[data-track]');
      if (trackElement) {
        const eventName = trackElement.dataset.track || 'click';
        const metadata = this.getElementMetadata(trackElement);
        this.trackEvent(eventName, metadata);
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (form.hasAttribute('data-track-form')) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());
        
        // Don't include sensitive data in tracking
        delete formValues.password;
        delete formValues.credit_card;
        
        this.trackEvent('form_submit', {
          formId: form.id || 'unknown',
          formAction: form.action,
          ...formValues
        });
        
        // Submit the form after a short delay to ensure tracking completes
        setTimeout(() => form.submit(), 300);
      }
    });
    
    // Track page navigation in single-page apps
    const originalPushState = history.pushState;
    history.pushState = function(state, title, url) {
      originalPushState.call(history, state, title, url);
      this.trackPageView();
    }.bind(this);
    
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }
  
  /**
   * Extract metadata from an element
   */
  getElementMetadata(element) {
    const metadata = {};
    
    // Extract all data-track-* attributes
    Object.keys(element.dataset).forEach(key => {
      if (key.startsWith('track') && key !== 'track') {
        const metadataKey = key.replace('track', '').toLowerCase();
        metadata[metadataKey] = element.dataset[key];
      }
    });
    
    // Add basic element info
    metadata.elementType = element.tagName.toLowerCase();
    if (element.id) metadata.elementId = element.id;
    if (element.href) metadata.href = element.href;
    if (element.textContent) {
      metadata.text = element.textContent.trim().substring(0, 50);
    }
    
    return metadata;
  }
  
  /**
   * Track a page view
   */
  trackPageView() {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    this.log(`Tracking page view: ${currentPath}`);
    
    // Parse UTM parameters from URL
    const urlParams = new URLSearchParams(currentSearch);
    const utmParams = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
      const value = urlParams.get(param);
      if (value) utmParams[param] = value;
    });
    
    // Add page-specific metadata
    const metadata = {
      title: document.title,
      referrer: document.referrer
    };
    
    // Send the request
    this.sendTrackingRequest('click', {
      endpoint: currentPath,
      ...utmParams,
      metadata: JSON.stringify(metadata)
    }).then(response => {
      if (response && response.clickId) {
        this.clickId = response.clickId;
        this.saveClickId();
      }
    });
  }
  
  /**
   * Track a custom event
   * @param {string} eventName - Name of the event to track
   * @param {object} eventData - Additional data about the event
   */
  trackEvent(eventName, eventData = {}) {
    if (!this.initialized) {
      // Queue event to be sent after initialization
      this.eventQueue.push({ eventName, eventData });
      return;
    }
    
    this.log(`Tracking event: ${eventName}`, eventData);
    
    this.sendTrackingRequest('click', {
      endpoint: `event_${eventName}`,
      metadata: JSON.stringify(eventData)
    });
  }
  
  /**
   * Track a conversion
   * @param {object} options - Conversion options
   */
  trackConversion(options = {}) {
    if (!this.clickId && !options.clickId) {
      this.log('No click ID found for conversion tracking', 'error');
      return Promise.reject(new Error('No click ID found'));
    }
    
    const clickId = options.clickId || this.clickId;
    
    this.log(`Tracking conversion with clickId: ${clickId}`, options);
    
    return fetch(`${this.config.apiBaseUrl}/conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey
      },
      body: JSON.stringify({
        clickId,
        type: options.type || 'conversion',
        value: parseFloat(options.value) || 0,
        orderId: options.orderId || '',
        transactionId: options.transactionId || '',
        metadata: options.metadata || {}
      })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.success && this.config.debug) {
        console.error('Conversion tracking failed:', data.error);
      }
      return data;
    })
    .catch(error => {
      this.log('Error tracking conversion: ' + error.message, 'error');
      throw error;
    });
  }
  
  /**
   * Process any events queued before initialization
   */
  processEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this.trackEvent(event.eventName, event.eventData);
    }
  }
  
  /**
   * Send a tracking request
   * @param {string} type - Type of tracking request ('click', 'pixel')
   * @param {object} params - Parameters to send with the request
   * @returns {Promise} Promise resolving to response data
   */
  sendTrackingRequest(type, params) {
    // Add API key to params
    params = { ...params, api_key: this.config.apiKey };
    
    // Convert params to query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    // Create a tracking request
    const url = `${this.config.apiBaseUrl}/${type}?${queryParams.toString()}`;
    
    return new Promise((resolve, reject) => {
      // Use Image object for tracking to avoid CORS issues
      const img = new Image();
      
      img.onload = function() {
        // For debugging, try to extract JSON from response
        if (this.config.debug) {
          try {
            // Note: This may not work in all browsers
            if (this.response) {
              const response = JSON.parse(this.response);
              resolve(response);
              return;
            }
          } catch (e) {}
        }
        resolve({});
      }.bind(this);
      
      img.onerror = function() {
        // Image loading errors are normal and don't indicate a failure
        resolve({});
      };
      
      img.src = url;
    });
  }
  
  /**
   * Save click ID to local storage
   */
  saveClickId() {
    if (this.clickId) {
      try {
        localStorage.setItem('eqhuma_click_id', this.clickId);
        sessionStorage.setItem('eqhuma_click_id', this.clickId);
      } catch (e) {
        // Handle storage access denied
      }
    }
  }
  
  /**
   * Load click ID from storage
   */
  loadClickId() {
    try {
      // Try session storage first, then local storage
      this.clickId = sessionStorage.getItem('eqhuma_click_id') || localStorage.getItem('eqhuma_click_id');
    } catch (e) {
      // Handle storage access denied
    }
  }
  
  /**
   * Log message to console in debug mode
   * @param {string} message - Message to log
   * @param {string} level - Log level ('log', 'warn', 'error')
   */
  log(message, level = 'log') {
    if (this.config.debug) {
      console[level](`[EQHumaTracker] ${message}`);
    }
  }
}

/**
 * Usage examples
 */
// Initialize tracker
const tracker = new EQHumaTracker(CONFIG);

// Manual tracking examples - uncomment to use
/*
// Track a custom event with metadata
tracker.trackEvent('product_view', {
  productId: '12345',
  productName: 'Premium Plan',
  category: 'Subscription',
  price: 99.99
});

// Track a conversion
tracker.trackConversion({
  type: 'purchase',
  value: 99.99,
  orderId: 'ORD-12345',
  metadata: {
    products: [{ id: 'PRD-1', qty: 1 }],
    couponCode: 'SUMMER20'
  }
});
*/

/**
 * HTML example usage:
 * 
 * <!-- Track clicks on this button -->
 * <button 
 *   data-track="signup_click" 
 *   data-track-plan="premium"
 *   data-track-source="hero_section">
 *   Sign Up Now
 * </button>
 * 
 * <!-- Track form submission -->
 * <form data-track-form action="/subscribe" method="post">
 *   <input name="email" type="email">
 *   <input name="plan" value="basic">
 *   <button type="submit">Subscribe</button>
 * </form>
 */

// Export tracker
window.EQHumaTracker = EQHumaTracker;
export default tracker;