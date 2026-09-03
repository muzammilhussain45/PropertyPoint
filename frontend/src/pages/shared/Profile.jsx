import React, { useState } from "react";
import axios from "axios";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiCheck,
  HiX,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import { API_URL } from "../../config";
import { profileStyles as s } from "../../assets/dummyStyles.js";

const Profile = () => {
  const { user, setUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Handle text input changes (including 10-digit limitation for phone)
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle profile image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveProfilePic(false);
    }
  };

  // Update profile handler (multipart/form-data via PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("address", formData.address);

      if (imageFile) {
        data.append("profilePic", imageFile);
      }

      if (removeProfilePic) {
        data.append("removeProfilePic", true);
      }

      const response = await axios.put(`${API_URL}/api/user/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.containerWrapper(user?.role)}>
      {/* Show Navbar only if the user is not a seller */}
      {user?.role !== "seller" && <Navbar />}

      <div className={s.mainContainer(user?.role)}>
        <header className={s.header}>
          <h1 className={s.pageTitle}>Personal Profile</h1>
          <p className={s.pageSubtitle}>
            Manage your personal information and account settings
          </p>
        </header>

        <div className={s.card}>
          <div className={s.profileHeader}>
            {/* Avatar Section */}
            <div className={s.avatarSection}>
              <div className={s.avatarWrapper}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className={s.avatarImage}
                  />
                ) : !removeProfilePic && user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="pic"
                    className={s.avatarImage}
                  />
                ) : (
                  <span className={s.avatarPlaceholder}>
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                )}
              </div>

              {/* Editing Controls for Avatar */}
              {isEditing && (
                <>
                  <label className={s.uploadButton}>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <HiOutlineUser size={20} />
                  </label>

                  {(imagePreview ||
                    (!removeProfilePic && user?.profilePic)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setRemoveProfilePic(true);
                      }}
                      className={s.removeButton}
                      title="Remove profile picture"
                    >
                      <HiX size={20} />
                    </button>
                  )}
                </>
              )}
            </div>

            <div>
              <h2 className={s.userName}>{user?.name}</h2>
              <span className={s.roleBadge}>{user?.role?.toUpperCase()}</span>
            </div>
          </div>

          {error && <div className={s.errorMessage}>{error}</div>}

          {/* Profile Form (Edit Mode vs View Mode) */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className={s.editForm}>
              <div>
                <label className={s.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern="\d*"
                  placeholder="Enter 10 digits phone number"
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your full address"
                  className={s.textarea}
                />
              </div>

              <div className={s.formActions}>
                <button
                  type="submit"
                  disabled={loading}
                  className={s.saveButton}
                >
                  <HiCheck size={20} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setImagePreview(null);
                    setImageFile(null);
                    setRemoveProfilePic(false);
                  }}
                  className={s.cancelButton}
                >
                  <HiX size={20} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode Information Display */
            <div className={s.infoSection}>
              {/* Email Item */}
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlineMail size={24} />
                </div>
                <div>
                  <div className={s.infoLabel}>Email Address</div>
                  <div className={s.infoValue}>{user?.email}</div>
                </div>
              </div>

              {/* Phone Item */}
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlinePhone size={24} />
                </div>
                <div>
                  <div className={s.infoLabel}>Phone Number</div>
                  <div className={s.infoValue}>
                    {user?.phone || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Address Item */}
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlineLocationMarker size={24} />
                </div>
                <div>
                  <div className={s.infoLabel}>Location / Address</div>
                  <div className={s.infoValue}>
                    {user?.address || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className={s.editButtonWrapper}>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={s.editProfileButton}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
