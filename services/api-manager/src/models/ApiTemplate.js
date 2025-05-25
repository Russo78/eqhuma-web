// src/models/ApiTemplate.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for endpoint definition within an API template
const EndpointSchema = new Schema({
  path: {
    type: String,
    required: [true, 'Endpoint path is required'],
    trim: true
  },
  method: {
    type: String,
    required: [true, 'HTTP method is required'],
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Endpoint name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parameters: [{
    name: {
      type: String,
      required: [true, 'Parameter name is required'],
      trim: true
    },
    description: String,
    required: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array', 'file'],
      default: 'string'
    },
    location: {
      type: String,
      enum: ['path', 'query', 'header', 'body', 'formData'],
      default: 'query'
    },
    defaultValue: Schema.Types.Mixed,
    example: Schema.Types.Mixed,
    enumValues: [Schema.Types.Mixed]
  }],
  requestBodySchema: {
    type: Object,
    default: null
  },
  responseSchema: {
    type: Object,
    default: null
  },
  // Configuration for the endpoint
  configuration: {
    rateLimit: {
      enabled: {
        type: Boolean,
        default: true
      },
      limit: {
        type: Number,
        default: 100
      },
      window: {
        type: Number,
        default: 60 // seconds
      }
    },
    caching: {
      enabled: {
        type: Boolean,
        default: false
      },
      ttl: {
        type: Number,
        default: 60 // seconds
      }
    },
    // Required authentication level
    authRequired: {
      type: Boolean,
      default: true
    },
    // Which roles can access this endpoint
    allowedRoles: {
      type: [String],
      default: []
    }
  }
});

// Schema for authentication configuration
const AuthConfigSchema = new Schema({
  type: {
    type: String,
    enum: ['apiKey', 'jwt', 'oauth2', 'basic', 'none'],
    default: 'apiKey'
  },
  apiKeyLocation: {
    type: String,
    enum: ['header', 'query'],
    default: 'header'
  },
  apiKeyName: {
    type: String,
    default: 'X-API-KEY'
  },
  jwtSecret: String,
  oauth2: {
    clientId: String,
    clientSecret: String,
    redirectUri: String,
    authorizationUrl: String,
    tokenUrl: String,
    scopes: [String]
  },
  expiryTime: {
    type: Number,
    default: 86400 // 24 hours in seconds
  }
});

// Schema for webhook configuration
const WebhookConfigSchema = new Schema({
  events: [{
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true
    },
    description: String
  }],
  retryPolicy: {
    maxRetries: {
      type: Number,
      default: 3
    },
    retryInterval: {
      type: Number,
      default: 60 // seconds
    }
  },
  signatureSecret: String,
  headers: [{
    key: String,
    value: String
  }]
});

// Main API Template Schema
const ApiTemplateSchema = new Schema({
  name: {
    type: String,
    required: [true, 'API template name is required'],
    trim: true
  },
  version: {
    type: String,
    required: [true, 'API version is required'],
    trim: true,
    default: '1.0.0'
  },
  description: {
    type: String,
    trim: true
  },
  basePath: {
    type: String,
    default: '/api',
    trim: true
  },
  endpoints: [EndpointSchema],
  authConfig: {
    type: AuthConfigSchema,
    default: () => ({})
  },
  webhookConfig: {
    type: WebhookConfigSchema,
    default: () => ({})
  },
  // Rate limiting configuration for the entire API
  rateLimit: {
    enabled: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 1000 // requests per window
    },
    window: {
      type: Number,
      default: 60 * 60 // 1 hour in seconds
    }
  },
  // Access tiers configuration
  tiers: [{
    name: {
      type: String,
      required: [true, 'Tier name is required'],
      trim: true
    },
    description: String,
    rateLimit: {
      limit: Number,
      window: Number
    },
    price: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      billingPeriod: {
        type: String,
        enum: ['monthly', 'yearly', 'one-time'],
        default: 'monthly'
      }
    },
    features: [String]
  }],
  // Documentation configuration
  documentation: {
    title: String,
    description: String,
    termsOfService: String,
    contact: {
      name: String,
      url: String,
      email: String
    },
    license: {
      name: String,
      url: String
    }
  },
  // Metadata for organizing and filtering
  tags: [String],
  category: {
    type: String,
    trim: true
  },
  // Relations
  organizationId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Organization ID is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // Status of the API template
  status: {
    type: String,
    enum: ['draft', 'published', 'deprecated', 'archived'],
    default: 'draft'
  },
  // API visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'organization'],
    default: 'private'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ApiTemplateSchema.index({ organizationId: 1 });
ApiTemplateSchema.index({ name: 1, version: 1, organizationId: 1 }, { unique: true });
ApiTemplateSchema.index({ status: 1 });
ApiTemplateSchema.index({ tags: 1 });
ApiTemplateSchema.index({ 'endpoints.method': 1, 'endpoints.path': 1 });

// Method to create a new API instance based on this template
ApiTemplateSchema.methods.createInstance = async function(instanceData) {
  try {
    // Get the ApiInstance model
    const ApiInstance = mongoose.model('ApiInstance');
    
    // Create instance with template data and custom instance data
    const instance = await ApiInstance.create({
      templateId: this._id,
      name: instanceData.name || `${this.name} Instance`,
      description: instanceData.description || this.description,
      basePath: instanceData.basePath || this.basePath,
      version: this.version,
      organizationId: this.organizationId,
      createdBy: instanceData.createdBy || this.createdBy,
      // Use template endpoints but allow overrides
      endpoints: instanceData.endpoints || this.endpoints,
      // Use template auth config but allow overrides
      authConfig: {
        ...this.authConfig.toObject(),
        ...(instanceData.authConfig || {})
      },
      // Use template webhook config but allow overrides
      webhookConfig: {
        ...this.webhookConfig.toObject(),
        ...(instanceData.webhookConfig || {})
      },
      // Set tier and custom settings
      tier: instanceData.tier || null,
      customSettings: instanceData.customSettings || {}
    });
    
    return instance;
  } catch (error) {
    throw new Error(`Error creating API instance: ${error.message}`);
  }
};

// Method to validate an endpoint configuration
ApiTemplateSchema.methods.validateEndpoint = function(endpointPath, method) {
  const endpoint = this.endpoints.find(e => 
    e.path === endpointPath && e.method === method.toUpperCase()
  );
  
  if (!endpoint) {
    return { valid: false, message: `Endpoint ${method.toUpperCase()} ${endpointPath} not found in API template` };
  }
  
  return { valid: true, endpoint };
};

// Method to generate documentation (OpenAPI/Swagger)
ApiTemplateSchema.methods.generateOpenApiSpec = function() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: this.documentation?.title || this.name,
      version: this.version,
      description: this.documentation?.description || this.description || ''
    },
    servers: [{
      url: this.basePath,
      description: 'API Base URL'
    }],
    paths: {},
    components: {
      securitySchemes: {}
    }
  };
  
  // Add security scheme based on auth config
  if (this.authConfig.type === 'apiKey') {
    spec.components.securitySchemes.apiKey = {
      type: 'apiKey',
      name: this.authConfig.apiKeyName,
      in: this.authConfig.apiKeyLocation
    };
  } else if (this.authConfig.type === 'jwt') {
    spec.components.securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    };
  }
  
  // Add endpoints to spec
  this.endpoints.forEach(endpoint => {
    const pathKey = endpoint.path;
    const methodKey = endpoint.method.toLowerCase();
    
    if (!spec.paths[pathKey]) {
      spec.paths[pathKey] = {};
    }
    
    spec.paths[pathKey][methodKey] = {
      summary: endpoint.name,
      description: endpoint.description,
      parameters: endpoint.parameters.map(param => ({
        name: param.name,
        in: param.location,
        description: param.description,
        required: param.required,
        schema: {
          type: param.type,
          default: param.defaultValue,
          enum: param.enumValues?.length ? param.enumValues : undefined
        },
        example: param.example
      })),
      responses: {
        '200': {
          description: 'Successful response'
        }
      }
    };
    
    // Add request body schema if provided
    if (endpoint.requestBodySchema) {
      spec.paths[pathKey][methodKey].requestBody = {
        content: {
          'application/json': {
            schema: endpoint.requestBodySchema
          }
        }
      };
    }
    
    // Add response schema if provided
    if (endpoint.responseSchema) {
      spec.paths[pathKey][methodKey].responses['200'] = {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: endpoint.responseSchema
          }
        }
      };
    }
    
    // Add security requirement if auth is required
    if (endpoint.configuration.authRequired) {
      let security = [];
      
      if (this.authConfig.type === 'apiKey') {
        security.push({ apiKey: [] });
      } else if (this.authConfig.type === 'jwt') {
        security.push({ bearerAuth: [] });
      }
      
      if (security.length) {
        spec.paths[pathKey][methodKey].security = security;
      }
    }
  });
  
  return spec;
};

module.exports = mongoose.model('ApiTemplate', ApiTemplateSchema);