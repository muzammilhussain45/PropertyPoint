import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, account no longer exists',
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by an admin',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired',
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please login again',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission.',
      });
    }

    // Sellers must be approved by an admin before they can use seller-only
    // actions (publishing/managing listings, viewing seller dashboards).
    if (req.user.role === 'seller' && !req.user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your seller account is pending admin approval',
      });
    }

    next();
  };
}; 