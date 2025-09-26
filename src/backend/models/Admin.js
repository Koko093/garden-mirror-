const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'manager', 'staff'],
    default: 'admin'
  },
  permissions: {
    users: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    reservations: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    packages: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    rooms: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    feedback: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    analytics: {
      read: { type: Boolean, default: true }
    },
    system: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false }
    }
  },
  profile: {
    phone: String,
    department: String,
    position: String,
    avatar: String,
    bio: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  sessionTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deviceInfo: String,
    ipAddress: String
  }],
  activityLog: [{
    action: String,
    resource: String,
    resourceId: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ createdAt: -1 });

// Virtual for role-based permissions check
adminSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'super_admin';
});

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        // Super admin has all permissions
        Object.keys(this.permissions).forEach(resource => {
          if (typeof this.permissions[resource] === 'object') {
            Object.keys(this.permissions[resource]).forEach(action => {
              this.permissions[resource][action] = true;
            });
          }
        });
        break;
      
      case 'manager':
        // Manager has most permissions except system-level
        this.permissions.users.write = true;
        this.permissions.users.delete = true;
        this.permissions.packages.write = true;
        this.permissions.packages.delete = true;
        this.permissions.rooms.write = true;
        this.permissions.rooms.delete = true;
        this.permissions.feedback.delete = true;
        break;
      
      case 'staff':
        // Staff has limited permissions
        this.permissions.users.write = false;
        this.permissions.users.delete = false;
        this.permissions.packages.write = false;
        this.permissions.packages.delete = false;
        this.permissions.rooms.write = false;
        this.permissions.rooms.delete = false;
        this.permissions.feedback.delete = false;
        this.permissions.analytics.read = false;
        break;
    }
  }
  next();
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Account lockout methods
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

adminSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 4 hours (stricter for admin)
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 4 * 60 * 60 * 1000 }; // 4 hours
  }
  
  return this.update(updates);
};

adminSchema.methods.resetLoginAttempts = function() {
  return this.update({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Check permission method
adminSchema.methods.hasPermission = function(resource, action) {
  if (this.role === 'super_admin') return true;
  
  return this.permissions[resource] && this.permissions[resource][action];
};

// Log activity method
adminSchema.methods.logActivity = function(action, resource, resourceId, details = {}) {
  this.activityLog.push({
    action,
    resource,
    resourceId,
    details,
    ipAddress: details.ipAddress,
    userAgent: details.userAgent
  });
  
  // Keep only last 1000 activity logs
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }
  
  return this.save();
};

// Static method to find by credentials
adminSchema.statics.findByCredentials = async function(email, password) {
  const admin = await this.findOne({ email, isActive: true }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid admin credentials');
  }
  
  if (admin.isLocked) {
    await admin.incLoginAttempts();
    throw new Error('Admin account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    await admin.incLoginAttempts();
    throw new Error('Invalid admin credentials');
  }
  
  // Reset login attempts on successful login
  if (admin.loginAttempts > 0) {
    await admin.resetLoginAttempts();
  }
  
  // Update last login
  admin.lastLogin = new Date();
  await admin.save();
  
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);