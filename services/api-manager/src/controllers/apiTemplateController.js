// src/controllers/apiTemplateController.js
const ApiTemplate = require('../models/ApiTemplate');
const ApiInstance = require('../models/ApiInstance');
const Credential = require('../models/Credential');
const apiExecutionService = require('../services/apiExecutionService');

/**
 * @desc    Get all API templates
 * @route   GET /api/v1/api-templates
 * @access  Private
 */
exports.getAllApiTemplates = async (req, res, next) => {
  try {
    // Extract query parameters for filtering and pagination
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sort = '-createdAt'
    } = req.query;
    
    // Build query
    const query = { organizationId: req.user.organizationId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Execute query with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: [
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' }
      ]
    };
    
    const apiTemplates = await ApiTemplate.paginate(query, options);
    
    res.status(200).json({
      success: true,
      count: apiTemplates.totalDocs,
      totalPages: apiTemplates.totalPages,
      page: apiTemplates.page,
      limit: apiTemplates.limit,
      data: apiTemplates.docs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single API template
 * @route   GET /api/v1/api-templates/:id
 * @access  Private
 */
exports.getApiTemplate = async (req, res, next) => {
  try {
    const apiTemplate = await ApiTemplate.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    }).populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);
    
    if (!apiTemplate) {
      return res.status(404).json({
        success: false,
        message: 'API Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: apiTemplate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new API template
 * @route   POST /api/v1/api-templates
 * @access  Private
 */
exports.createApiTemplate = async (req, res, next) => {
  try {
    // Add user and organization info
    req.body.createdBy = req.user.id;
    req.body.updatedBy = req.user.id;
    req.body.organizationId = req.user.organizationId;
    
    // Create new API template
    const apiTemplate = await ApiTemplate.create(req.body);
    
    res.status(201).json({
      success: true,
      data: apiTemplate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update API template
 * @route   PUT /api/v1/api-templates/:id
 * @access  Private
 */
exports.updateApiTemplate = async (req, res, next) => {
  try {
    // Add updatedBy field
    req.body.updatedBy = req.user.id;
    
    // Find and update template
    const apiTemplate = await ApiTemplate.findOneAndUpdate(
      { 
        _id: req.params.id,
        organizationId: req.user.organizationId
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!apiTemplate) {
      return res.status(404).json({
        success: false,
        message: 'API Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: apiTemplate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete API template
 * @route   DELETE /api/v1/api-templates/:id
 * @access  Private
 */
exports.deleteApiTemplate = async (req, res, next) => {
  try {
    const apiTemplate = await ApiTemplate.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (!apiTemplate) {
      return res.status(404).json({
        success: false,
        message: 'API Template not found'
      });
    }
    
    // Check for existing API instances using this template
    const instances = await ApiInstance.countDocuments({ templateId: apiTemplate._id });
    if (instances > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete template with ${instances} active instances`
      });
    }
    
    await apiTemplate.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create API instance from template
 * @route   POST /api/v1/api-templates/:id/instances
 * @access  Private
 */
exports.createApiInstance = async (req, res, next) => {
  try {
    // Get the API template
    const apiTemplate = await ApiTemplate.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (!apiTemplate) {
      return res.status(404).json({
        success: false,
        message: 'API Template not found'
      });
    }
    
    // Add required fields
    req.body.templateId = apiTemplate._id;
    req.body.organizationId = req.user.organizationId;
    req.body.createdBy = req.user.id;
    req.body.updatedBy = req.user.id;
    req.body.templateVersion = apiTemplate.version;
    
    // Create API instance
    const apiInstance = await ApiInstance.create(req.body);
    
    res.status(201).json({
      success: true,
      data: apiInstance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test API endpoint
 * @route   POST /api/v1/api-templates/:id/test-endpoint
 * @access  Private
 */
exports.testApiEndpoint = async (req, res, next) => {
  try {
    const { 
      endpointId, 
      params = {}, 
      headers = {}, 
      body = {},
      credentialId
    } = req.body;
    
    // Get the API template
    const apiTemplate = await ApiTemplate.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (!apiTemplate) {
      return res.status(404).json({
        success: false,
        message: 'API Template not found'
      });
    }
    
    // Find the requested endpoint in the template
    const endpoint = apiTemplate.endpoints.find(e => e._id.toString() === endpointId);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        message: 'Endpoint not found in template'
      });
    }
    
    // Get credentials if provided
    let credentials = null;
    if (credentialId) {
      credentials = await Credential.findOne({
        _id: credentialId,
        organizationId: req.user.organizationId
      });
      
      if (!credentials) {
        return res.status(404).json({
          success: false,
          message: 'Credentials not found'
        });
      }
    }
    
    // Execute the API call
    const result = await apiExecutionService.executeApiCall(
      apiTemplate,
      endpoint,
      params,
      headers,
      body,
      credentials
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export API template as OpenAPI specification
 * @route   GET /api/v1/api-templates/:id/export/openapi
 * @access  Private
 */
exports.exportAsOpenAPI = async (req, res, next) => {
  try {
    const apiTemplate = await ApiTemplate.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (!apiTemplate) {
      return res.status(404).json({
        success: false,
        message: 'API Template not found'
      });
    }
    
    // Convert template to OpenAPI format
    const openApiSpec = apiExecutionService.convertToOpenAPI(apiTemplate);
    
    res.status(200).json({
      success: true,
      data: openApiSpec
    });
  } catch (error) {
    next(error);
  }
};