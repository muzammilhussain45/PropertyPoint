import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineExternalLink,
  HiOutlineTrash,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import PropertyCard from "../../components/common/PropertyCard";
import { API_URL } from "../../config";
import { adminPropertiesStyles as s } from "../../assets/dummyStyles.js";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Fetch properties for moderation
  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/properties`, {
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
      console.error("Failed to load the properties", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle deleting a property
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This action is permanent and cannot be undone."
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/admin/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProperties(properties.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete property");
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className={s.loaderFullPage }>
        <div className={s.loader } />
      </div>
    );
  }

  return (
    <>
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Property Moderation</h1>
        <p className={s.pageSubtitle}>
          Review and manage all properties across the platform
        </p>
      </div>

      <div className={s.headerContainer}>
        {" "}
        {properties.length === 0 ? (
          <div className={s.emptyStateCard}>
            No properties pending moderation
          </div>
        ) : (
          <div className={s.propertiesGrid}>
            {properties.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                renderAction={() => (
                  <div className={s.actionWrapper}>
                    {/* Seller Information */}
                    <div className={s.sellerInfo}>
                      <div className={s.sellerName}>
                        Seller: {p.seller?.name || "Unknown"}
                      </div>
                      <div className={s.sellerEmail}>
                        {p.seller?.email}
                      </div>
                    </div>

                    {/* Action Buttons: View & Delete */}
                    <div className={s.buttonGroup}>
                      <Link
                        to={`/property/${p._id}`}
                        className={s.viewLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <HiOutlineExternalLink size={16} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        className={s.deleteButton}
                        title="Delete property"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                )}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProperties;