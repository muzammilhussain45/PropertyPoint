import User from '../models/user.model.js';
import Property from '../models/property.models.js';
import Inquiry from '../models/inquiry.model.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isBlocked = !user.isBlocked;

    await user.save();

    return res.json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => { 
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('seller', 'name email');
    return res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('property', 'title price')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const activeListing = await Property.countDocuments({ status: 'sale' });
    const soldProperties = await Property.countDocuments({ status: 'sold' });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        activeListing,
        soldProperties,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPendingSeller = async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: 'seller',
      isApproved: false,
    }).select('-password');

    return res.json({
      success: true,
      count: pendingSellers.length,
      pendingSellers,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const approveSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found or user is not a seller',
      });
    }

    seller.isApproved = true;
    await seller.save();

    return res.json({
      success: true,
      message: 'Seller approved successfully',
      seller,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};