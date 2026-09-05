import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HiUpload } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { addPropertyStyles as s } from "../../assets/dummyStyles.js";

const AddProperty = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    area: "",
    pinCode: "",
    propertyType: "flat",
    bhk: "",
    bathrooms: "",
    areaSize: "",
    furnishing: "unfurnished",
    status: "sale",
    amenities: [],
    securityDeposit: "",
    maintenance: "",
  });

  const commonAmenities = [
    "Parking",
    "Pool",
    "Gym",
    "Security",
    "Wifi",
    "Power Backup",
    "Club House",
    "Garden",
  ];

  // Text input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  // Image file select & max 10 images limit verification
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      setError("You can only upload up to 10 images only");
      return;
    }

    setImages((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  // Remove previewed image item
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit new property listing (multipart/form-data via POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "amenities") {
        formData[key].forEach((a) => {
          data.append("amenities", a);
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    images.forEach((img) => {
      data.append("images", img);
    });

    try {
      await axios.post(`${API_URL}/api/property`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add the property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.outerContainer}>
      <div className={s.innerContainer}>
        <div className={s.header}>
          <h1 className={s.heading}>List Your Property</h1>
          <p className={s.subheading}>
            Fill in the details below to reach thousands of potential buyers
          </p>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          {error && <div className={s.error}>{error}</div>}

          {/* Section 1: Content and Description */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderLargeMargin}`}>
              <div className={s.sectionBar} />
              <h3 className={s.sectionTitle}>Content and Description</h3>
            </div>

            <div className={s.contentGroupLarge}>
              <div>
                <label className={s.label}>Property Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Luxurious 3BHK Apartment in Downtown"
                  required
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>Detailed Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property highlights..."
                  required
                  className={`${s.input} ${s.textarea}`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Property Details */}
          <div className={s.twoColumnGrid}>
            <div>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar} />
                <h3 className={s.sectionTitle}>Property Details</h3>
              </div>

              <div className={s.contentGroupMedium}>
                <div>
                  <label className={s.labelSmallMargin}>Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className={`${s.input} ${s.select}`}
                  >
                    <option value="flat">Flat</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className={s.gridThreeCol}>
                  <div>
                    <label className={s.labelSmallMargin}>BHK</label>
                    <input
                      type="number"
                      name="bhk"
                      value={formData.bhk}
                      onChange={handleInputChange}
                      placeholder="e.g. 3"
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 2"
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Area (sq.ft)</label>
                    <input
                      type="number"
                      name="areaSize"
                      value={formData.areaSize}
                      onChange={handleInputChange}
                      placeholder="1500"
                      required
                      className={s.input}
                    />
                  </div>
                </div>

                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>Furnishing</label>
                    <select
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi furnished">Semi-Furnished</option>
                      <option value="fully furnished">Fully Furnished</option>
                    </select>
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>Listing Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`${s.input} ${s.select}`}
                    >
                      <option value="sale">For Sale</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing and Location */}
            <div>
              <div
                className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}
              >
                <div className={s.sectionBar} />
                <h3 className={s.sectionTitle}>Pricing and Location</h3>
              </div>

              <div className={s.contentGroupSmall}>
                <div>
                  <label className={s.labelSmallMargin}>Price (USD)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 500000"
                    required
                    className={s.input}
                  />
                </div>

                <div className={s.gridTwoCol}>
                  <div>
                    <label className={s.labelSmallMargin}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city name"
                      required
                      className={s.input}
                    />
                  </div>

                  <div>
                    <label className={s.labelSmallMargin}>ZIP Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 10001"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      className={s.input}
                    />
                  </div>
                </div>

                <div>
                  <label className={s.labelSmallMargin}>Specific Area</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Enter neighborhood or area"
                    className={s.input}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities Checkbox Grid */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar} />
              <h3 className={s.sectionTitle}>Amenities</h3>
            </div>

            <div className={s.amenitiesGrid}>
              {commonAmenities.map((amenity) => {
                const isChecked = formData.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`${s.amenityLabelBase} ${
                      isChecked ? s.amenityLabelActive : s.amenityLabelInactive
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAmenityChange(amenity)}
                      className={s.amenityCheckbox}
                    />
                    <span
                      className={`${s.amenityTextBase} ${
                        isChecked ? s.amenityTextActive : s.amenityTextInactive
                      }`}
                    >
                      {amenity}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 5: Property Images Upload */}
          <div className={s.section}>
            <div className={`${s.sectionHeader} ${s.sectionHeaderSmallMargin}`}>
              <div className={s.sectionBar} />
              <h3 className={s.sectionTitle}>Property Images</h3>
            </div>

            <div className={s.uploadArea}>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <div className={s.uploadIconWrapper}>
                <HiUpload size={40} style={{ color: "#64748b" }} />
              </div>
              <h4 className={s.uploadTitle}>
                Click to upload or drag and drop
              </h4>
              <p className={s.uploadSubtext}>
                Upload up to 10 high quality images (PNG or JPG)
              </p>
            </div>

            {/* Uploaded Images Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className={s.previewsGrid}>
                {imagePreviews.map((src, i) => (
                  <div key={i} className={s.previewItem}>
                    <img
                      src={src}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className={s.removeButton}
                      style={{ transform: "rotate(45deg)" }}
                    >
                      <HiUpload size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 10 && (
                  <div className={s.addMoreBox}>
                    <input
                      type="file"
                      multiple
                      onChange={handleImageChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <HiUpload size={20} style={{ color: "#64748b" }} />
                    <span className={s.addMoreText}>Add More</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className={s.footerButtons}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={s.cancelButton}
            >
              Cancel
            </button>

            <button type="submit" disabled={loading} className={s.submitButton}>
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
