import Inquiry from '../models/inquiry.model.js';
import Property from '../models/property.model.js';


//buyer send inquiry 
export const sendInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    const property = await Property.findById(propertyId).populate('seller');
    if (!property || !property.seller) {
      return res.status(404).json({ success: false, message: 'Property or seller not found' });
    }

    const inquiry = await Inquiry.create({
      property: property._id,
      buyer: req.user._id,
      seller: property.seller._id,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ seller: req.user._id })
      .populate('buyer', 'name email phone')
      .populate('property', 'title price images city')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBuyerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyer: req.user._id })
      .populate('property', 'title price images city')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    // Only the receiving seller can mark their inquiry as read
    if (inquiry.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    inquiry.isRead = true;
    await inquiry.save();

    return res.json({
      success: true,
      message: 'Marked as read',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};