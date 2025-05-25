# EQHuma API Click Tracking System

## Overview

The EQHuma API Click Tracking System provides a comprehensive solution for tracking user interactions with your APIs and applications. This guide explains how to integrate the tracking system into your applications, record clicks and conversions, and analyze the resulting data.

## Features

- **Click Tracking**: Record when users interact with your APIs or applications
- **Conversion Tracking**: Track when clicks lead to valuable actions (purchases, sign-ups, etc.)
- **UTM Parameter Tracking**: Automatically capture marketing campaign data
- **Geographic Data**: Capture user location information (country, region, city)
- **Device Information**: Track browser, operating system, and device types
- **Customizable Metadata**: Add your own data to tracking events
- **Multi-channel Tracking**: Support for web, email, and API tracking

## Getting Started

### Step 1: Create an API Instance

Before you can start tracking, you need to create an API instance in the EQHuma dashboard:

1. Log in to your EQHuma account
2. Navigate to API Management
3. Click "Create New API Instance"
4. Fill in the name and description for your instance
5. Save to generate your API key

### Step 2: Choose Your Integration Method

The system offers multiple integration methods:

- **JavaScript Snippet**: Easy website integration
- **Direct API Calls**: For backend services and custom implementations
- **Email Tracking Pixel**: For tracking email opens
- **Server-Side SDK**: For Node.js applications (coming soon)

## Integration Methods

### JavaScript Snippet

Add this script to your website's `<head>` section:

```html
<script src="https://api.eqhuma.com/api/v1/api-tracking/script.js?api_key=YOUR_API_KEY"></script>
```

This automatically tracks page visits and provides methods for tracking events and conversions:

```javascript
// Track a custom event
window.trackEvent('button_click', { buttonId: 'signup', page: '/landing' });

// Track a conversion
window.trackConversion({
  type: 'purchase',           // Conversion type
  value: 99.99,              // Monetary value
  orderId: 'ORDER123',       // Optional order ID
  transactionId: 'TX123456',  // Optional transaction ID
  metadata: {                // Optional additional data
    product: 'Premium Plan',
    couponUsed: true
  }
});
```

### Direct API Calls

For backend integrations or more control, use direct API calls:

#### Tracking Clicks

```
GET /api/v1/api-tracking/click?api_key=YOUR_API_KEY&endpoint=/your-endpoint&utm_source=source&utm_medium=medium
```

Parameters:
- `api_key`: Your API key (required)
- `endpoint`: The endpoint or action being tracked (optional)
- `utm_source`, `utm_medium`, `utm_campaign`, etc.: UTM parameters (optional)
- `metadata`: JSON string with additional data (optional)

#### Tracking Conversions

```
POST /api/v1/api-tracking/conversion
Headers: X-API-Key: YOUR_API_KEY
Content-Type: application/json

{
  "clickId": "uuid-from-previous-click",
  "type": "signup",
  "value": 50,
  "orderId": "ORDER123",
  "metadata": { "plan": "enterprise" }
}
```

### Email Tracking Pixel

To track email opens, include this image in your HTML emails:

```html
<img src="https://api.eqhuma.com/api/v1/api-tracking/pixel?api_key=YOUR_API_KEY&campaign_id=YOUR_CAMPAIGN_ID&recipient_id=UNIQUE_RECIPIENT_ID" width="1" height="1" alt="" style="display:none;">
```

## Analyzing Your Data

Access your tracking data through the EQHuma dashboard:

1. Log in to your EQHuma account
2. Navigate to API Management
3. Select your API instance
4. Click "View Statistics"

You can view metrics like:
- Total clicks and unique visitors
- Conversion rates and revenue
- Geographic distribution
- Device breakdown
- UTM source analysis

## Advanced Features

### Click Segmentation

Use the segmentation feature to analyze your data by:
- Daily/weekly/monthly trends
- UTM source, medium, or campaign
- Geographic region
- Device type

### Data Export

Export your click data for custom analysis:

```
GET /api/v1/api-instances/:id/export
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

### API Security

Enhance security by setting restrictions on your API key:

1. Navigate to API Management
2. Select your API instance
3. Click "Generate New Key"
4. Add IP or domain restrictions

## Best Practices

1. **Consistent Naming**: Use consistent naming for endpoints and conversion types
2. **UTM Parameters**: Always include UTM parameters in your marketing campaigns
3. **Conversion Values**: Assign accurate monetary values to conversions when possible
4. **Regular Analysis**: Check your dashboard regularly for insights
5. **Data Privacy**: Only collect data that complies with privacy regulations like GDPR

## Troubleshooting

### Common Issues

- **Missing Clicks**: Ensure your API key is valid and not revoked
- **No Conversions**: Verify clickId is correctly passed
- **Incorrect Data**: Check UTM parameters are properly formatted

### Support

For additional support, contact the EQHuma team at support@eqhuma.com
