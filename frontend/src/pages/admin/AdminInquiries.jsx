import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineAnnotation,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { adminInquiriesStyles as s } from "../../assets/dummyStyles.js";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchInquiries = async () => {
    if (!token) return;

    setLoading(true);
    try {
      console.log("fetching inquiries");
      const response = await axios.get(`${API_URL}/api/admin/inquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("inquiries response", response.data);

      if (response.data?.success) {
        setInquiries(response.data.inquiries);
      }
      setLoading(false);
    } catch (err) {
      console.error("failed to load inquiries", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load inquiries",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [token]);

  // Loading Screen
  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  // Error Screen with Retry Button
  if (error) {
    return (
      <div className="error-container p-8 text-center text-[#dc2626]">
        <h3>Error loading inquiries</h3>
        <p>{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

return (
    <>
      <div className={s.headerContainer}>
        <h1 className={s.headerTitle}>Platform Inquiries</h1>
        <p className={s.headerSubtitle}>
          Review communication between buyers and seller
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}>
            <HiOutlineAnnotation size={48} className="mx-auto" />
          </div>
          <h2>No inquiries found</h2>
          <p className={s.emptyText}>
            There are no inquiries recorded on the platform yet
          </p>
        </div>
      ) : (
        <div className={s.listContainer}>
          {inquiries.map((inq) => (
            <div key={inq._id} className={s.inquiryCard}>
              {/* Card Top Section: Property Information */}
              <div className={s.cardTopSection}>
                <div className={s.propertyInfoWrapper}>
                  <div className={s.propertyIconWrapper}>
                    <HiOutlineHome size={24} />
                  </div>
                  <div className={s.propertyTextWrapper}>
                    <div className={s.propertyTitle}>
                      {inq.property?.title || "Unknown Property"}
                    </div>
                    <div className={s.propertyId}>
                      Property ID: {inq.property?._id}
                    </div>
                  </div>
                </div>

                <div className={s.dateWrapper}>
                  <HiOutlineCalendar className={s.dateIcon} />
                  <span>
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Details Grid: Buyer and Seller Info */}
              <div className={s.detailsGrid}>
                {/* Buyer Column */}
                <div className={s.detailCard}>
                  <div className={s.detailLabel}>Buyer Details</div>
                  <div className={s.detailName}>
                    {inq.buyer?.name || "N/A"}
                  </div>
                  <div className={s.detailEmail}>
                    {inq.buyer?.email || "N/A"}
                  </div>
                </div>

                {/* Seller Column */}
                <div className={s.detailCard}>
                  <div className={s.detailLabel}>Seller Details</div>
                  <div className={s.detailName}>
                    {inq.seller?.name || "N/A"}
                  </div>
                  <div className={s.detailEmail}>
                    {inq.seller?.email || "N/A"}
                  </div>
                </div>
              </div>

              {/* Inquiry Message Container */}
              <div className={s.messageContainer}>
                <div className={s.messageHeader || s.messageContainer}>
                  <HiOutlineAnnotation />
                  <span>Message:</span>
                </div>
                <p className={s.messagetext}>"{inq.message}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminInquiries;
