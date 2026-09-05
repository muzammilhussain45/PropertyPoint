import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlineTrash,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/common/PropertyCard";
import { API_URL } from "../../config";
import {myPropertiesStyles as s} from "../../assets/dummyStyles.js";

const MyProperties = () => {
  const { token } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch properties belonging to the logged-in seller
  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/property/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const props = Array.isArray(response.data)
        ? response.data
        : response.data?.properties || [];

      setProperties(props);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load your properties", err);
      setError("Failed to load your properties");
      setLoading(false);
    }
  };

  useEffect(() => {
    
      fetchMyProperties();
    
  }, []);

  // Delete property handler
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/property/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete that particular property");
    }
  };

  // Update status handler (available / sold)
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_URL}/api/property/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getAvailableStatus = (p) => {
    return "sale";
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader} />
      </div>
    );
  }

  return (
    <div className={s.fadeIn}>
      <div className={s.fadeIn}>
        {/* Header Section */}
        <div className={s.header}>
          <div>
            <h1 className={s.heading}>My Listings</h1>
            <p className={s.subheading}>
              Manage your listed properties and their status
            </p>
          </div>

          <Link to="/add-property" className={s.addButton}>
            Add New Listing
          </Link>
        </div>

        {/* Property Grid / Empty State */}
        <div className={s.content}>
          {!Array.isArray(properties) || properties.length === 0 ? (
            <div className={s.emptyCard}>
              <div className={s.emptyIconWrapper}>
                <HiOutlineLibrary size={40} style={{ color: "#94a3b8" }} />
              </div>
              <h2 className={s.emptyTitle}>No Property Listed</h2>
              <p className={s.emptyText}>
                Start your journey by adding your first property listing
              </p>
              <Link to="/add-property" className={s.emptyButton}> 
                Add your first listing
              </Link>
            </div>
          ) : (
            <div className={s.grid}>
              {properties.map((p) => (
                <PropertyCard
                  key={p._id}
                  property={p}
                  renderActions={() => (
                    <>
                      <div className={s.actionContainer}>
                        {/* Status Select Dropdown */}
                        <div className={s.selectWrapper}>
                          <select
                            value={
                              p.status === "sale" ? "available" : p.status
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "available") {
                                updateStatus(p._id, getAvailableStatus(p));
                              } else if (val === "sold") {
                                updateStatus(p._id, val);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`${s.select} ${
                              p.status === "sold"
                                ? s.selectSold
                                : s.selectAvailable
                            }`}
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                          </select>

                          <div className={s.selectIcon}>
                            <HiOutlineCheckCircle size={14} />
                          </div>
                        </div>

                        {/* Edit Button */}
                        <Link
                          to={`/edit-property/${p._id}`}
                          className={s.editButton}
                        >
                          <HiOutlinePencilAlt size={14} />
                          <span>Edit</span>
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p._id);
                          }}
                          className={s.deleteButton}
                          title="Delete Property"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </div>
                    </>
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProperties; 