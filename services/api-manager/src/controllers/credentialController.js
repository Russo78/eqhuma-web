// src/controllers/credentialController.js
const Credential = require('../models/Credential');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Get all credentials
 * @route   GET /api/v1/credentials
 * @access  Private
 */
exports.getAllCredentials = asyncHandler(async (req, res) => {
  // Extract query parameters for filtering and pagination
  const { 
    page = 1, 
    limit = 10, 
    status, 
    type,
    search,
    sort = '-createdAt'
  } = req.query;
  
  // Build query
  const query = { organizationId: req.user.organizationId };
  
  // Add status filter if provided
  if (status) {
    query.status = status;
  }
  
  // Add type filter if provided
  if (type) {
    query.type = type;
  }
  
  // Add text search if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Execute query with pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    select: '-apiKey -oauth2.clientSecret -oauth2.accessToken -oauth2.refreshToken -basic.password -custom -encryptionIV',
    populate: [
      { path: 'apiTemplateIds', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]
  };
  
  const credentials = await Credential.paginate(query, options);
  
  res.status(200).json({
    success: true,
    count: credentials.totalDocs,
    totalPages: credentials.totalPages,
    page: credentials.page,
    limit: credentials.limit,
    data: credentials.docs
  });
});

/**
 * @desc    Get single credential
 * @route   GET /api/v1/credentials/:id
 * @access  Private
 */
exports.getCredential = asyncHandler(async (req, res) => {
  // Don't return sensitive fields
  const credential = await Credential.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  })
  .select('-apiKey -oauth2.clientSecret -oauth2.accessToken -oauth2.refreshToken -basic.password -custom -encryptionIV')
  .populate([
    { path: 'apiTemplateIds', select: 'name' },
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' }
  ]);
  
  if (!credential) {
    return res.status(404).json({
      success: false,
      message: 'Credential not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: credential
  });
});

/**
 * @desc    Create new credential
 * @route   POST /api/v1/credentials
 * @access  Private
 */
exports.createCredential = asyncHandler(async (req, res) => {
  // Add user and organization info
  req.body.createdBy = req.user.id;
  req.body.updatedBy = req.user.id;
  req.body.organizationId = req.user.organizationId;
  
  // Create new credential
  const credential = await Credential.create(req.body);
  
  // Don't return sensitive fields in response
  const safeCredential = await Credential.findById(credential._id)
    .select('-apiKey -oauth2.clientSecret -oauth2.accessToken -oauth2.refreshToken -basic.password -custom -encryptionIV');
  
  res.status(201).json({
    success: true,
    data: safeCredential
  });
});

/**
 * @desc    Update credential
 * @route   PUT /api/v1/credentials/:id
 * @access  Private
 */
exports.updateCredential = asyncHandler(async (req, res) => {
  // Add updatedBy field
  req.body.updatedBy = req.user.id;
  
  // Find the existing credential first
  const existingCredential = await Credential.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });
  
  if (!existingCredential) {
    return res.status(404).json({
      success: false,
      message: 'Credential not found'
    });
  }
  
  // Update the credential
  // We need to handle sensitive fields carefully - if they're not provided in the request,
  // we should keep the existing values to avoid overwriting with empty values
  
  // For API key type
  if (req.body.type === 'api_key' && !req.body.apiKey) {
    // If updating an API key credential but no new key provided, preserve existing key
    delete req.body.apiKey;
  }
  
  // For OAuth2 type
  if (req.body.type === 'oauth2') {
    if (!req.body.oauth2) {
      req.body.oauth2 = {};
    }
    
    if (!req.body.oauth2.clientSecret) {
      delete req.body.oauth2.clientSecret;
    }
    if (!req.body.oauth2.accessToken) {
      delete req.body.oauth2.accessToken;
    }
    if (!req.body.oauth2.refreshToken) {
      delete req.body.oauth2.refreshToken;
    }
  }
  
  // For Basic Auth type
  if (req.body.type === 'basic') {
    if (!req.body.basic) {
      req.body.basic = {};
    }
    
    if (!req.body.basic.password) {
      delete req.body.basic.password;
    }
  }
  
  // Update the credential
  const updatedCredential = await Credential.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-apiKey -oauth2.clientSecret -oauth2.accessToken -oauth2.refreshToken -basic.password -custom -encryptionIV');
  
  res.status(200).json({
    success: true,
    data: updatedCredential
  });
});

/**
 * @desc    Delete credential
 * @route   DELETE /api/v1/credentials/:id
 * @access  Private
 */
exports.deleteCredential = asyncHandler(async (req, res) => {
  const credential = await Credential.findOne({
    _id: req.params.id,
    organizationId: req.user.organizationId
  });
  
  if (!credential) {
    return res.status(404).json({
      success: false,
      message: 'Credential not found'
    });
  }
  
  // Check if any API instances are using this credential
  const ApiInstance = require('../models/ApiInstance');
  const instances = await ApiInstance.countDocuments({ credentialId: credential._id });
  
  if (instances > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete credential with ${instances} active API instances`
    });
  }
  
  await credential.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});