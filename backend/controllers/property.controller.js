import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

export const addProperty = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        imageUrls.push(result.secure_url);
      }
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      city: req.body.city,
      area: req.body.area,
      pinCode: req.body.pinCode,
      propertyType: req.body.propertyType,
      bhk: req.body.bhk ? String(req.body.bhk) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      areaSize: req.body.areaSize ? Number(req.body.areaSize) : undefined,
      furnishing: req.body.furnishing,
      status: req.body.status,
      images: imageUrls,
      seller: req.user._id,
      amenities: req.body.amenities
        ? Array.isArray(req.body.amenities)
          ? req.body.amenities
          : (() => {
              try {
                return JSON.parse(req.body.amenities);
              } catch (e) {
                return req.body.amenities.split(",");
              }
            })()
        : [],
    });

    return res.json({ success: true, property });
  } catch (error) {
    console.error("Error adding property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id });
    return res.json({ success: true, properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PROPERTY
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const fields = [
      "title",
      "description",
      "price",
      "city",
      "area",
      "pinCode",
      "propertyType",
      "bhk",
      "bathrooms",
      "areaSize",
      "furnishing",
      "status",
      "amenities",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "amenities" && typeof req.body[field] === "string") {
          try {
            property[field] = JSON.parse(req.body[field]);
          } catch (e) {
            property[field] = req.body[field].split(",");
          }
        } else {
          property[field] = req.body[field];
        }
      }
    });

    if (req.body.existingImages) {
      try {
        const existing = JSON.parse(req.body.existingImages);
        property.images = Array.isArray(existing) ? existing : property.images;
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
      }
    } // deleting existing images

    //upload new image if exist the old one
    if (req.files && req.files.length > 0) {
      let newImages = [];
      for (let file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "properties");
        newImages.push(result.secure_url);
      }
      property.images = [...property.images, ...newImages];
    }

    await property.save();

    res.json({
      success: true,
      message: "Property updated",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    //check the user is the owner of the property
    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this property",
      });
    }

    //delete image from cloudinary

    for (let imageUrl of property.images) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`properties/${publicId}`);
    }

    // await Property.deleteOne({ _id: req.params.id });
    await property.deleteOne();

    return res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePropertyStatus = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    //check the user is the owner of the property
    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this property",
      });
    }

    property.status = req.body.status;
    await property.save();

    return res.json({
      success: true,
      message: "Property status updated successfully",
      property,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL PROPERTIES
export const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      area,
      pinCode,
      propertyType,
      bhk,
      furnishing,
      status,
      minPrice,
      maxPrice,
      amenities,
      sort,
      seller,
    } = req.query;

    let query = {
      status: "sale",
    };

    if (seller) query.seller = seller;
    if (city) query.city = new RegExp(city, "i");
    if (area) query.area = new RegExp(area, "i");
    if (pinCode) query.pinCode = pinCode;

    if (propertyType) {
      query.propertyType = { $in: propertyType.toLowerCase().split(",") };
    }
    if (bhk) {
      if (bhk === "5+") {
        query.bhk = { $gte: "5" };
      } else {
        query.bhk = bhk;
      }
    }
    if (furnishing) {
      const furnishingArray = furnishing.split(",");
      query.furnishing = {
        $in: furnishingArray.map((f) => new RegExp(`^${f.trim()}$`, "i")),
      };
    }
    if (status) query.status = status;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(minPrice)) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    if (amenities) {
      query.amenities = {
        $in: amenities.split(",").map((a) => a.trim()),
      };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };
    if (sort === "latest") sortOption = { createdAt: -1 };

    const properties = await Property.find(query)
      .populate("seller", "name phone profilePic")
      .sort(sortOption);

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching properties",
      error: error.message,
    });
  }
};

export const getPropertyDetails = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "seller",
      "name email phone profilePic",
    );

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    //unique view by tracking id
    let visitorId = req.ip;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        visitorId = decoded.id;
      } catch (err) {}
    }

    const isSellerChecking = visitorId === property.seller._id.toString();

    // only increment the view if not seller but if he edit then increases the view
    if (!isSellerChecking && !property.viewedBy.includes(visitorId)) {
      property.views += 1;
      property.viewedBy.push(visitorId);
      await property.save();
    }

    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      city: property.city,
      propertyType: property.propertyType,
      status: property.status,
    })
      .limit(4)
      .select("title price images city area propertyType bhk areaSize status");

    return res.json({
      success: true,
      property,
      similarProperties,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalProperties = await Property.countDocuments({ seller: sellerId });
    const activeListing = await Property.countDocuments({
      seller: sellerId,
      status: "sale",
    });
    const soldProperties = await Property.countDocuments({
      seller: sellerId,
      status: "sold",
    });

    const totalInquiries = await Inquiry.countDocuments({ seller: sellerId });

    const viewsData = await Property.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalViews = viewsData.length > 0 ? viewsData[0].totalViews : 0;

    return res.json({
      success: true,
      stats: {
        totalProperties,
        activeListing,
        soldProperties,
        totalInquiries,
        totalViews,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPropertyCounts = async (req, res) => {
  try {
    //GET PROPERTY COUNTS BY TYPE
    const counts = await Property.aggregate([
      { $match: { status: "sale" } },
      { $group: { _id: "$propertyType", count: { $sum: 1 } } },
    ]);

    const formattedCounts = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return res.json({
      success: true,
      counts: formattedCounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching counts",
    });
  }
};
