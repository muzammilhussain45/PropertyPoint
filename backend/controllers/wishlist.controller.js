import Wishlist from "../models/wishlist.models.js";

export const addWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const existing = await Wishlist.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already in the wishlist",
      });
    }

    await Wishlist.create({
      user: req.user._id,
      property: propertyId,
    });

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const data = await Wishlist.find({ user: req.user._id }).populate(
      "property",
    );
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const removeWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
