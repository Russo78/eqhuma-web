// src/routes/apiTemplateRoutes.js
const express = require('express');
const { protect, authorize, requireOrganizationAccess } = require('../middleware/auth');
const { asyncHandler, ApiError } = require('../middleware/error');
const ApiTemplate = require('../models/ApiTemplate');

const router = express.Router();

/**
 * @route   GET /api/v1/api-templates
 * @desc    Get all API templates for the organization
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  // Build query
  const query = {
    organizationId: req.user.organizationId
  };

  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by visibility if provided
  if (req.query.visibility) {
    query.visibility = req.query.visibility;
  }

  // Filter by tag if provided
  if (req.query.tag) {
    query.tags = req.query.tag;
  }

  // Filter by category if provided
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by search term if provided
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Sort options
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Execute query with pagination
  const apiTemplates = await ApiTemplate.find(query)
    .sort(sort)
    .skip(startIndex)
    .limit(limit)
    .select('-endpoints.configuration.rateLimit -endpoints.configuration.caching');

  // Get total count for pagination
  const total = await ApiTemplate.countDocuments(query);

  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: apiTemplates.length,
    pagination,
    data: apiTemplates,
    total
  });
}));

/**
 * @route   GET /api/v1/api-templates/:id
 * @desc    Get API template by ID
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  res.status(200).json({
    success: true,
    data: apiTemplate
  });
}));

/**
 * @route   POST /api/v1/api-templates
 * @desc    Create a new API template
 * @access  Private (admin, manager)
 */
router.post('/', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  // Add organization ID and creator info
  req.body.organizationId = req.user.organizationId;
  req.body.createdBy = req.user.id;

  // Validate required fields
  if (!req.body.name) {
    throw new ApiError('API template name is required', 400);
  }
  
  if (!req.body.version) {
    req.body.version = '1.0.0';
  }

  // Check for duplicate name+version
  const existingTemplate = await ApiTemplate.findOne({
    name: req.body.name,
    version: req.body.version,
    organizationId: req.user.organizationId
  });

  if (existingTemplate) {
    throw new ApiError(`API template with name '${req.body.name}' and version '${req.body.version}' already exists`, 400);
  }

  // Create API template
  const apiTemplate = await ApiTemplate.create(req.body);

  res.status(201).json({
    success: true,
    data: apiTemplate
  });
}));

/**
 * @route   PUT /api/v1/api-templates/:id
 * @desc    Update an API template
 * @access  Private (admin, manager)
 */
router.put('/:id', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  let apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Cannot modify published templates (require new version)
  if (apiTemplate.status === 'published' && req.body.status !== 'deprecated') {
    throw new ApiError('Cannot modify a published API template. Create a new version instead.', 400);
  }

  // Prevent changing organization ID
  if (req.body.organizationId) {
    delete req.body.organizationId;
  }

  // Check for duplicate name+version if changing either
  if ((req.body.name && req.body.name !== apiTemplate.name) || 
      (req.body.version && req.body.version !== apiTemplate.version)) {
    
    const existingTemplate = await ApiTemplate.findOne({
      name: req.body.name || apiTemplate.name,
      version: req.body.version || apiTemplate.version,
      organizationId: req.user.organizationId,
      _id: { $ne: req.params.id }
    });

    if (existingTemplate) {
      throw new ApiError(`API template with name '${req.body.name || apiTemplate.name}' and version '${req.body.version || apiTemplate.version}' already exists`, 400);
    }
  }

  // Update API template
  apiTemplate = await ApiTemplate.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: apiTemplate
  });
}));

/**
 * @route   DELETE /api/v1/api-templates/:id
 * @desc    Delete an API template
 * @access  Private (admin)
 */
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Check if API template is in use
  // In a real app, you'd check for dependencies like API instances using this template
  if (apiTemplate.status === 'published') {
    throw new ApiError('Cannot delete a published API template that may be in use', 400);
  }

  await apiTemplate.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}));

/**
 * @route   POST /api/v1/api-templates/:id/endpoints
 * @desc    Add an endpoint to an API template
 * @access  Private (admin, manager)
 */
router.post('/:id/endpoints', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Validate required fields
  if (!req.body.path) {
    throw new ApiError('Endpoint path is required', 400);
  }
  
  if (!req.body.method) {
    throw new ApiError('HTTP method is required', 400);
  }
  
  if (!req.body.name) {
    throw new ApiError('Endpoint name is required', 400);
  }

  // Check for duplicate endpoint (same path and method)
  const isDuplicate = apiTemplate.endpoints.some(endpoint => 
    endpoint.path === req.body.path && endpoint.method === req.body.method.toUpperCase()
  );

  if (isDuplicate) {
    throw new ApiError(`Endpoint ${req.body.method} ${req.body.path} already exists`, 400);
  }

  // Ensure method is uppercase
  req.body.method = req.body.method.toUpperCase();
  
  // Add endpoint
  apiTemplate.endpoints.push(req.body);
  await apiTemplate.save();

  res.status(201).json({
    success: true,
    data: apiTemplate.endpoints[apiTemplate.endpoints.length - 1]
  });
}));

/**
 * @route   PUT /api/v1/api-templates/:id/endpoints/:endpointId
 * @desc    Update an endpoint in an API template
 * @access  Private (admin, manager)
 */
router.put('/:id/endpoints/:endpointId', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Find endpoint index
  const endpointIndex = apiTemplate.endpoints.findIndex(e => e._id.toString() === req.params.endpointId);

  if (endpointIndex === -1) {
    throw new ApiError('Endpoint not found', 404);
  }

  // Check for duplicate if path or method is changing
  if (req.body.path || req.body.method) {
    const newPath = req.body.path || apiTemplate.endpoints[endpointIndex].path;
    const newMethod = req.body.method ? req.body.method.toUpperCase() : apiTemplate.endpoints[endpointIndex].method;

    const isDuplicate = apiTemplate.endpoints.some((endpoint, index) => 
      index !== endpointIndex && 
      endpoint.path === newPath && 
      endpoint.method === newMethod
    );

    if (isDuplicate) {
      throw new ApiError(`Endpoint ${newMethod} ${newPath} already exists`, 400);
    }
  }

  // Update endpoint
  Object.keys(req.body).forEach(key => {
    if (key === 'method' && req.body.method) {
      apiTemplate.endpoints[endpointIndex][key] = req.body[key].toUpperCase();
    } else {
      apiTemplate.endpoints[endpointIndex][key] = req.body[key];
    }
  });

  await apiTemplate.save();

  res.status(200).json({
    success: true,
    data: apiTemplate.endpoints[endpointIndex]
  });
}));

/**
 * @route   DELETE /api/v1/api-templates/:id/endpoints/:endpointId
 * @desc    Delete an endpoint from an API template
 * @access  Private (admin, manager)
 */
router.delete('/:id/endpoints/:endpointId', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Find endpoint
  const endpointIndex = apiTemplate.endpoints.findIndex(e => e._id.toString() === req.params.endpointId);

  if (endpointIndex === -1) {
    throw new ApiError('Endpoint not found', 404);
  }

  // Remove endpoint
  apiTemplate.endpoints.splice(endpointIndex, 1);
  await apiTemplate.save();

  res.status(200).json({
    success: true,
    data: {}
  });
}));

/**
 * @route   POST /api/v1/api-templates/:id/clone
 * @desc    Clone an API template
 * @access  Private (admin, manager)
 */
router.post('/:id/clone', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  // Find source template
  const sourceTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!sourceTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Get new name and version
  const { name, version, description } = req.body;
  
  if (!name) {
    throw new ApiError('New template name is required', 400);
  }
  
  if (!version) {
    throw new ApiError('New template version is required', 400);
  }

  // Check for duplicate
  const existingTemplate = await ApiTemplate.findOne({
    name,
    version,
    organizationId: req.user.organizationId
  });

  if (existingTemplate) {
    throw new ApiError(`API template with name '${name}' and version '${version}' already exists`, 400);
  }

  // Create new template (clone)
  const newTemplateData = sourceTemplate.toObject();
  delete newTemplateData._id;
  delete newTemplateData.createdAt;
  delete newTemplateData.updatedAt;
  
  // Override with new values
  newTemplateData.name = name;
  newTemplateData.version = version;
  newTemplateData.description = description || `Clone of ${sourceTemplate.name} v${sourceTemplate.version}`;
  newTemplateData.status = 'draft';
  newTemplateData.createdBy = req.user.id;

  const newTemplate = await ApiTemplate.create(newTemplateData);

  res.status(201).json({
    success: true,
    data: newTemplate
  });
}));

/**
 * @route   POST /api/v1/api-templates/:id/create-instance
 * @desc    Create an API instance from a template
 * @access  Private (admin, manager)
 */
router.post('/:id/create-instance', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  if (apiTemplate.status !== 'published') {
    throw new ApiError('Can only create instances from published templates', 400);
  }

  // Add creator info to instance data
  req.body.createdBy = req.user.id;

  // Create API instance from template
  try {
    const instance = await apiTemplate.createInstance(req.body);

    res.status(201).json({
      success: true,
      data: instance
    });
  } catch (error) {
    throw new ApiError(`Error creating API instance: ${error.message}`, 400);
  }
}));

/**
 * @route   GET /api/v1/api-templates/:id/openapi
 * @desc    Get OpenAPI specification for an API template
 * @access  Private
 */
router.get('/:id/openapi', protect, asyncHandler(async (req, res) => {
  const apiTemplate = await ApiTemplate.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });

  if (!apiTemplate) {
    throw new ApiError('API template not found', 404);
  }

  // Generate OpenAPI spec
  const openApiSpec = apiTemplate.generateOpenApiSpec();

  res.status(200).json(openApiSpec);
}));

/**
 * @route   GET /api/v1/api-templates/categories
 * @desc    Get all API template categories
 * @access  Private
 */
router.get('/meta/categories', protect, asyncHandler(async (req, res) => {
  const categories = await ApiTemplate.distinct('category', {
    organizationId: req.user.organizationId,
    category: { $ne: null, $ne: '' }
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
}));

/**
 * @route   GET /api/v1/api-templates/tags
 * @desc    Get all API template tags
 * @access  Private
 */
router.get('/meta/tags', protect, asyncHandler(async (req, res) => {
  const tags = await ApiTemplate.distinct('tags', {
    organizationId: req.user.organizationId,
    tags: { $ne: null }
  });

  res.status(200).json({
    success: true,
    count: tags.length,
    data: tags
  });
}));

module.exports = router;