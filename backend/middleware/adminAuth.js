const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is an admin token
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type for admin access'
      });
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.id)
      .select('-password -twoFactorSecret')
      .populate('createdBy', 'name email');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found, authorization denied'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is deactivated'
      });
    }

    // Add admin to request object
    req.admin = admin;
    req.token = token;

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in admin authentication'
    });
  }
};

// Permission checking middleware
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check specific permission
    if (!req.admin.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You don't have permission to ${action} ${resource}`
      });
    }

    next();
  };
};

module.exports = adminAuth;
module.exports.checkPermission = checkPermission;