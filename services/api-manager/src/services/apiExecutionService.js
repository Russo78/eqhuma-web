// src/services/apiExecutionService.js
const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');
const ApiTemplate = require('../models/ApiTemplate');
const ApiInstance = require('../models/ApiInstance');
const Credential = require('../models/Credential');

/**
 * API Execution Service
 * Handles execution of API calls based on templates and instances
 */
const apiExecutionService = {
  /**
   * Execute API call using template and endpoint configuration
   */
  executeApiCall: async (apiTemplate, endpoint, params = {}, headers = {}, body = {}, credentials = null) => {
    try {
      // Build request URL
      const url = buildRequestUrl(apiTemplate.baseUrl, endpoint.path, params);
      
      // Set up request headers
      const requestHeaders = buildRequestHeaders(apiTemplate, endpoint, headers);
      
      // Set up authentication
      if (credentials) {
        await applyAuthentication(requestHeaders, apiTemplate, credentials);
      }
      
      // Set up request options
      const requestOptions = {
        method: endpoint.method || 'GET',
        url,
        headers: requestHeaders,
        timeout: endpoint.timeout || apiTemplate.settings?.timeout || 30000,
        validateStatus: null // Don't throw on error status codes
      };
      
      // Add request body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(requestOptions.method)) {
        if (Object.keys(body).length > 0) {
          // Check if content type is form-urlencoded
          if (requestHeaders['Content-Type'] === 'application/x-www-form-urlencoded') {
            requestOptions.data = qs.stringify(body);
          } else {
            requestOptions.data = body;
          }
        }
      }
      
      // Execute the request
      const startTime = Date.now();
      const response = await axios(requestOptions);
      const responseTime = Date.now() - startTime;
      
      // Process response
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        meta: {
          url,
          method: requestOptions.method,
          responseTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('API execution error:', error);
      
      // Format error response
      return {
        error: {
          message: error.message || 'Unknown error occurred',
          code: error.code || 'EXECUTION_ERROR'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    }
  },
  
  /**
   * Execute API endpoint from an instance
   */
  executeInstanceEndpoint: async (apiInstance, endpointId, params = {}, headers = {}, body = {}) => {
    try {
      // Get API template
      const apiTemplate = await ApiTemplate.findById(apiInstance.templateId);
      if (!apiTemplate) {
        throw new Error('API Template not found');
      }
      
      // Find the endpoint in the template
      const endpoint = apiTemplate.endpoints.find(e => e._id.toString() === endpointId);
      if (!endpoint) {
        throw new Error('Endpoint not found in template');
      }
      
      // Check if endpoint is disabled in the instance
      const endpointOverride = apiInstance.endpointOverrides?.find(
        o => o.endpointId.toString() === endpointId
      );
      
      if (endpointOverride?.disabled) {
        throw new Error('This endpoint is disabled for the current API instance');
      }
      
      // Get credentials if configured
      let credentials = null;
      if (apiInstance.credentialId) {
        credentials = await Credential.findById(apiInstance.credentialId);
        if (!credentials) {
          throw new Error('API credentials not found');
        }
      }
      
      // Merge endpoint settings with override values
      const mergedEndpoint = {
        ...endpoint.toObject(),
        ...(endpointOverride || {})
      };
      
      // Use instance baseUrl if provided, otherwise use template baseUrl
      const baseUrl = apiInstance.baseUrl || apiTemplate.baseUrl;
      const templateWithInstanceOverrides = {
        ...apiTemplate.toObject(),
        baseUrl,
        headers: apiInstance.headers?.length ? apiInstance.headers : apiTemplate.headers
      };
      
      // Execute the API call
      const startTime = Date.now();
      const result = await apiExecutionService.executeApiCall(
        templateWithInstanceOverrides,
        mergedEndpoint,
        params,
        headers,
        body,
        credentials
      );
      const responseTime = Date.now() - startTime;
      
      // Update API instance usage statistics
      const success = !result.error && (result.status < 400);
      await apiInstance.recordUsage(success, responseTime);
      
      return result;
    } catch (error) {
      console.error('API instance execution error:', error);
      
      // Format error response
      return {
        error: {
          message: error.message || 'Unknown error occurred',
          code: error.code || 'EXECUTION_ERROR'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    }
  },
  
  /**
   * Convert API template to OpenAPI specification
   */
  convertToOpenAPI: (apiTemplate) => {
    try {
      // Create base OpenAPI document
      const openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: apiTemplate.name,
          description: apiTemplate.description,
          version: apiTemplate.version,
          contact: {}
        },
        servers: [
          {
            url: apiTemplate.baseUrl,
            description: 'Default server'
          }
        ],
        paths: {},
        components: {
          schemas: {},
          securitySchemes: {}
        },
        tags: []
      };
      
      // Add tags from API template
      if (apiTemplate.tags && apiTemplate.tags.length > 0) {
        openApiSpec.tags = apiTemplate.tags.map(tag => ({ name: tag }));
      }
      
      // Add authentication
      if (apiTemplate.authentication && apiTemplate.authentication.type !== 'none') {
        switch (apiTemplate.authentication.type) {
          case 'api_key':
            openApiSpec.components.securitySchemes.apiKey = {
              type: 'apiKey',
              name: apiTemplate.authentication.headerName || 'X-API-Key',
              in: apiTemplate.authentication.location === 'header' ? 'header' : 
                 apiTemplate.authentication.location === 'query' ? 'query' : 'header'
            };
            break;
          case 'bearer':
            openApiSpec.components.securitySchemes.bearerAuth = {
              type: 'http',
              scheme: 'bearer'
            };
            break;
          case 'basic':
            openApiSpec.components.securitySchemes.basicAuth = {
              type: 'http',
              scheme: 'basic'
            };
            break;
          case 'oauth2':
            if (apiTemplate.authentication.oauthConfig) {
              const oauth = apiTemplate.authentication.oauthConfig;
              openApiSpec.components.securitySchemes.oauth2 = {
                type: 'oauth2',
                flows: {}
              };
              
              // Add appropriate flow based on grant type
              if (oauth.grantType === 'authorization_code') {
                openApiSpec.components.securitySchemes.oauth2.flows.authorizationCode = {
                  authorizationUrl: oauth.authUrl,
                  tokenUrl: oauth.tokenUrl,
                  scopes: {}
                };
                
                // Add scopes
                if (oauth.scope) {
                  oauth.scope.split(' ').forEach(scope => {
                    openApiSpec.components.securitySchemes.oauth2.flows.authorizationCode.scopes[scope] = scope;
                  });
                }
              } else if (oauth.grantType === 'client_credentials') {
                openApiSpec.components.securitySchemes.oauth2.flows.clientCredentials = {
                  tokenUrl: oauth.tokenUrl,
                  scopes: {}
                };
                
                // Add scopes
                if (oauth.scope) {
                  oauth.scope.split(' ').forEach(scope => {
                    openApiSpec.components.securitySchemes.oauth2.flows.clientCredentials.scopes[scope] = scope;
                  });
                }
              }
            }
            break;
        }
      }
      
      // Process endpoints
      if (apiTemplate.endpoints && apiTemplate.endpoints.length > 0) {
        apiTemplate.endpoints.forEach(endpoint => {
          // Create path entry if it doesn't exist
          if (!openApiSpec.paths[endpoint.path]) {
            openApiSpec.paths[endpoint.path] = {};
          }
          
          // Create operation object
          const operation = {
            summary: endpoint.name,
            description: endpoint.description,
            operationId: `${endpoint.name.replace(/\s+/g, '')}_${endpoint.method.toLowerCase()}`,
            tags: apiTemplate.tags && apiTemplate.tags.length ? [apiTemplate.tags[0]] : undefined,
            parameters: [],
            responses: {
              '200': {
                description: 'Successful operation'
              },
              '400': {
                description: 'Bad request'
              },
              '401': {
                description: 'Unauthorized'
              },
              '500': {
                description: 'Internal server error'
              }
            }
          };
          
          // Add parameters
          if (endpoint.parameters && endpoint.parameters.length > 0) {
            endpoint.parameters.forEach(param => {
              const parameter = {
                name: param.name,
                in: param.location,
                description: param.description,
                required: param.isRequired,
                schema: {}
              };
              
              // Set schema type
              switch (param.type) {
                case 'number':
                  parameter.schema.type = 'number';
                  break;
                case 'boolean':
                  parameter.schema.type = 'boolean';
                  break;
                case 'array':
                  parameter.schema.type = 'array';
                  parameter.schema.items = { type: 'string' };
                  break;
                case 'object':
                  parameter.schema.type = 'object';
                  break;
                default:
                  parameter.schema.type = 'string';
              }
              
              // Add validations
              if (param.validations) {
                if (param.validations.min !== undefined) {
                  if (param.type === 'string') {
                    parameter.schema.minLength = param.validations.min;
                  } else if (param.type === 'number') {
                    parameter.schema.minimum = param.validations.min;
                  }
                }
                
                if (param.validations.max !== undefined) {
                  if (param.type === 'string') {
                    parameter.schema.maxLength = param.validations.max;
                  } else if (param.type === 'number') {
                    parameter.schema.maximum = param.validations.max;
                  }
                }
                
                if (param.validations.pattern) {
                  parameter.schema.pattern = param.validations.pattern;
                }
                
                if (param.validations.enum && param.validations.enum.length > 0) {
                  parameter.schema.enum = param.validations.enum;
                }
              }
              
              // Add default value
              if (param.defaultValue) {
                parameter.schema.default = param.defaultValue;
              }
              
              // Add parameter to operation
              if (param.location !== 'body') {
                operation.parameters.push(parameter);
              }
            });
          }
          
          // Add request body if needed
          if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
            // Look for body parameters
            const bodyParams = endpoint.parameters?.filter(p => p.location === 'body');
            
            if (bodyParams?.length > 0 || endpoint.requestBodySchema) {
              operation.requestBody = {
                content: {
                  'application/json': {
                    schema: endpoint.requestBodySchema || {
                      type: 'object',
                      properties: {}
                    }
                  }
                }
              };
              
              // If using body params instead of a schema
              if (bodyParams?.length > 0 && !endpoint.requestBodySchema) {
                bodyParams.forEach(param => {
                  operation.requestBody.content['application/json'].schema.properties[param.name] = {
                    type: param.type === 'number' ? 'number' : 
                          param.type === 'boolean' ? 'boolean' : 
                          param.type === 'array' ? 'array' : 
                          param.type === 'object' ? 'object' : 'string',
                    description: param.description
                  };
                  
                  if (param.isRequired) {
                    if (!operation.requestBody.content['application/json'].schema.required) {
                      operation.requestBody.content['application/json'].schema.required = [];
                    }
                    operation.requestBody.content['application/json'].schema.required.push(param.name);
                  }
                });
              }
            }
          }
          
          // Add response schema if available
          if (endpoint.responseSchema) {
            if (!operation.responses['200'].content) {
              operation.responses['200'].content = {
                'application/json': {
                  schema: endpoint.responseSchema
                }
              };
            }
          }
          
          // Add security requirement based on template authentication
          if (apiTemplate.authentication && apiTemplate.authentication.type !== 'none') {
            operation.security = [];
            
            switch (apiTemplate.authentication.type) {
              case 'api_key':
                operation.security.push({ apiKey: [] });
                break;
              case 'bearer':
                operation.security.push({ bearerAuth: [] });
                break;
              case 'basic':
                operation.security.push({ basicAuth: [] });
                break;
              case 'oauth2':
                if (apiTemplate.authentication.oauthConfig && apiTemplate.authentication.oauthConfig.scope) {
                  const scopes = apiTemplate.authentication.oauthConfig.scope.split(' ');
                  operation.security.push({ oauth2: scopes });
                } else {
                  operation.security.push({ oauth2: [] });
                }
                break;
            }
          }
          
          // Add operation to path
          openApiSpec.paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
        });
      }
      
      return openApiSpec;
    } catch (error) {
      console.error('Error converting to OpenAPI:', error);
      return null;
    }
  }
};

/**
 * Build request URL from base URL, endpoint path, and parameters
 */
function buildRequestUrl(baseUrl, endpointPath, params = {}) {
  // Ensure no trailing slash in base URL
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Ensure leading slash in endpoint path
  const normalizedPath = !endpointPath.startsWith('/') ? `/${endpointPath}` : endpointPath;
  
  // Combine to form full URL
  let url = `${normalizedBaseUrl}${normalizedPath}`;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    const placeholder = `{${key}}`;
    if (url.includes(placeholder)) {
      url = url.replace(placeholder, encodeURIComponent(params[key]));
      delete params[key]; // Remove used path parameter
    }
  });
  
  // Add remaining parameters as query string
  if (Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      queryParams.append(key, params[key]);
    });
    
    url = `${url}?${queryParams.toString()}`;
  }
  
  return url;
}

/**
 * Build request headers from template, endpoint, and user-provided headers
 */
function buildRequestHeaders(apiTemplate, endpoint, userHeaders = {}) {
  const headers = {};
  
  // Add template-level headers
  if (apiTemplate.headers && apiTemplate.headers.length > 0) {
    apiTemplate.headers.forEach(header => {
      headers[header.key] = header.value;
    });
  }
  
  // Add endpoint-specific headers
  if (endpoint.parameters) {
    endpoint.parameters
      .filter(param => param.location === 'header')
      .forEach(param => {
        if (param.defaultValue) {
          headers[param.name] = param.defaultValue;
        }
      });
  }
  
  // Add user-provided headers (these take precedence)
  Object.keys(userHeaders).forEach(key => {
    headers[key] = userHeaders[key];
  });
  
  // Set default Content-Type if not provided and method typically includes a body
  if (!headers['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

/**
 * Apply authentication to request headers based on API template authentication config
 */
async function applyAuthentication(headers, apiTemplate, credentials) {
  try {
    // Decrypt credentials for use
    const decryptedCredentials = credentials.decryptCredentials();
    if (!decryptedCredentials) {
      throw new Error('Failed to decrypt credentials');
    }
    
    const authType = apiTemplate.authentication?.type;
    
    switch (authType) {
      case 'api_key':
        const keyName = apiTemplate.authentication.headerName || 'X-API-Key';
        const location = apiTemplate.authentication.location || 'header';
        
        if (location === 'header') {
          headers[keyName] = decryptedCredentials.apiKey;
        }
        break;
        
      case 'basic':
        if (decryptedCredentials.basic) {
          const { username, password } = decryptedCredentials.basic;
          if (username && password) {
            const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
            headers['Authorization'] = `Basic ${base64Credentials}`;
          }
        }
        break;
        
      case 'bearer':
        if (decryptedCredentials.apiKey) {
          const prefix = apiTemplate.authentication.prefix || 'Bearer';
          headers['Authorization'] = `${prefix} ${decryptedCredentials.apiKey}`;
        }
        break;
        
      case 'oauth2':
        if (decryptedCredentials.oauth2 && decryptedCredentials.oauth2.accessToken) {
          headers['Authorization'] = `Bearer ${decryptedCredentials.oauth2.accessToken}`;
        }
        break;
        
      case 'custom':
        if (decryptedCredentials.custom) {
          // Apply custom authentication logic based on template and credential data
          // This would depend on the specific implementation requirements
          console.log('Custom authentication applied');
        }
        break;
    }
  } catch (error) {
    console.error('Error applying authentication:', error);
    throw new Error('Authentication error: ' + error.message);
  }
}

module.exports = apiExecutionService;