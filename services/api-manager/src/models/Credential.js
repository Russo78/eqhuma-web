// src/models/Credential.js
const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

/**
 * Credential Schema
 * Securely stores API credentials with encryption for sensitive values
 */
const CredentialSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Credential name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['api_key', 'oauth2', 'basic', 'bearer', 'custom'],
    required: [true, 'Credential type is required']
  },
  // For API key, bearer token
  apiKey: {
    type: String,
    select: false // Not returned in query results by default
  },
  // For OAuth2
  oauth2: {
    clientId: {
      type: String,
      select: false
    },
    clientSecret: {
      type: String,
      select: false
    },
    accessToken: {
      type: String,
      select: false
    },
    refreshToken: {
      type: String,
      select: false
    },
    tokenExpiresAt: Date,
    scope: String
  },
  // For Basic Auth
  basic: {
    username: {
      type: String,
      select: false
    },
    password: {
      type: String,
      select: false
    }
  },
  // For custom auth schemes
  custom: {
    type: Schema.Types.Mixed,
    select: false
  },
  // Encryption details
  encryptionIV: {
    type: String,
    select: false
  },
  // Associated API templates this credential can be used with
  apiTemplateIds: [{
    type: Schema.Types.ObjectId,
    ref: 'ApiTemplate'
  }],
  tags: [String],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  organizationId: {
    type: String,
    required: [true, 'Organization ID is required']
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  lastUsed: Date
}, {
  timestamps: true
});

// Index for faster queries
CredentialSchema.index({ organizationId: 1, name: 1 }, { unique: true });
CredentialSchema.index({ status: 1 });
CredentialSchema.index({ 'apiTemplateIds': 1 });

// Encrypt sensitive data before saving
CredentialSchema.pre('save', async function(next) {
  // Only encrypt if one of these fields has been modified
  if (!this.isModified('apiKey') && 
      !this.isModified('oauth2') && 
      !this.isModified('basic') && 
      !this.isModified('custom')) {
    return next();
  }

  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    this.encryptionIV = iv.toString('hex');

    // Create cipher
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(encryptionKey, 'hex'), 
      iv
    );

    // Encrypt apiKey if present
    if (this.apiKey) {
      let encrypted = cipher.update(this.apiKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      this.apiKey = encrypted;
    }

    // Encrypt OAuth2 credentials if present
    if (this.oauth2) {
      if (this.oauth2.clientSecret) {
        const oauthCipher = crypto.createCipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let encryptedSecret = oauthCipher.update(this.oauth2.clientSecret, 'utf8', 'hex');
        encryptedSecret += oauthCipher.final('hex');
        this.oauth2.clientSecret = encryptedSecret;
      }

      if (this.oauth2.accessToken) {
        const tokenCipher = crypto.createCipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let encryptedToken = tokenCipher.update(this.oauth2.accessToken, 'utf8', 'hex');
        encryptedToken += tokenCipher.final('hex');
        this.oauth2.accessToken = encryptedToken;
      }

      if (this.oauth2.refreshToken) {
        const refreshCipher = crypto.createCipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let encryptedRefresh = refreshCipher.update(this.oauth2.refreshToken, 'utf8', 'hex');
        encryptedRefresh += refreshCipher.final('hex');
        this.oauth2.refreshToken = encryptedRefresh;
      }
    }

    // Encrypt Basic Auth credentials if present
    if (this.basic && this.basic.password) {
      const basicCipher = crypto.createCipheriv(
        'aes-256-cbc', 
        Buffer.from(encryptionKey, 'hex'), 
        iv
      );
      let encryptedPassword = basicCipher.update(this.basic.password, 'utf8', 'hex');
      encryptedPassword += basicCipher.final('hex');
      this.basic.password = encryptedPassword;
    }

    // Encrypt custom auth data if present (convert to string first)
    if (this.custom && Object.keys(this.custom).length > 0) {
      const customCipher = crypto.createCipheriv(
        'aes-256-cbc', 
        Buffer.from(encryptionKey, 'hex'), 
        iv
      );
      const customString = JSON.stringify(this.custom);
      let encryptedCustom = customCipher.update(customString, 'utf8', 'hex');
      encryptedCustom += customCipher.final('hex');
      this.custom = encryptedCustom;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt credentials
CredentialSchema.methods.decryptCredentials = function() {
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey || !this.encryptionIV) {
      throw new Error('Missing encryption key or initialization vector');
    }

    const iv = Buffer.from(this.encryptionIV, 'hex');
    
    // Create object to hold decrypted values
    const decrypted = {
      type: this.type
    };

    // Decrypt apiKey if present
    if (this.apiKey) {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc', 
        Buffer.from(encryptionKey, 'hex'), 
        iv
      );
      let decryptedKey = decipher.update(this.apiKey, 'hex', 'utf8');
      decryptedKey += decipher.final('utf8');
      decrypted.apiKey = decryptedKey;
    }

    // Decrypt OAuth2 credentials if present
    if (this.oauth2) {
      decrypted.oauth2 = { ...this.oauth2 }; // Copy non-sensitive fields
      
      if (this.oauth2.clientSecret) {
        const oauthDecipher = crypto.createDecipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let decryptedSecret = oauthDecipher.update(this.oauth2.clientSecret, 'hex', 'utf8');
        decryptedSecret += oauthDecipher.final('utf8');
        decrypted.oauth2.clientSecret = decryptedSecret;
      }

      if (this.oauth2.accessToken) {
        const tokenDecipher = crypto.createDecipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let decryptedToken = tokenDecipher.update(this.oauth2.accessToken, 'hex', 'utf8');
        decryptedToken += tokenDecipher.final('utf8');
        decrypted.oauth2.accessToken = decryptedToken;
      }

      if (this.oauth2.refreshToken) {
        const refreshDecipher = crypto.createDecipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let decryptedRefresh = refreshDecipher.update(this.oauth2.refreshToken, 'hex', 'utf8');
        decryptedRefresh += refreshDecipher.final('utf8');
        decrypted.oauth2.refreshToken = decryptedRefresh;
      }
    }

    // Decrypt Basic Auth credentials if present
    if (this.basic) {
      decrypted.basic = { username: this.basic.username };
      
      if (this.basic.password) {
        const basicDecipher = crypto.createDecipheriv(
          'aes-256-cbc', 
          Buffer.from(encryptionKey, 'hex'), 
          iv
        );
        let decryptedPassword = basicDecipher.update(this.basic.password, 'hex', 'utf8');
        decryptedPassword += basicDecipher.final('utf8');
        decrypted.basic.password = decryptedPassword;
      }
    }

    // Decrypt custom auth data if present
    if (this.custom) {
      const customDecipher = crypto.createDecipheriv(
        'aes-256-cbc', 
        Buffer.from(encryptionKey, 'hex'), 
        iv
      );
      let decryptedCustom = customDecipher.update(this.custom, 'hex', 'utf8');
      decryptedCustom += customDecipher.final('utf8');
      decrypted.custom = JSON.parse(decryptedCustom);
    }

    return decrypted;
  } catch (error) {
    console.error('Error decrypting credentials:', error);
    return null;
  }
};

module.exports = mongoose.model('Credential', CredentialSchema);