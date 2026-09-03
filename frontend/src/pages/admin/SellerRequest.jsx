import  { useState, useEffect } from "react";
import axios from "axios";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { sellerRequestsStyles as s } from "../../assets/dummyStyles.js";


const SellerRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Fetch pending seller registration requests
  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/pending-seller`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setRequests(response.data.pending);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load seller request", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Handle approving a specific seller by MongoDB ID
  const handleApprove = async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/admin/approve-seller/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setRequests(requests.filter((req) => req._id !== id));
        alert("Seller approved successfully");
      }
    } catch (err) {
      alert("Failed to approve the seller");
    }
  };

  // Full Page Loader
  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader } />
      </div>
    );
  }

  return (
    <div className={s.container}>
      {/* Header Container */}
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Seller Verification</h1>
        <p className={s.pageSubtitle}>
          Review and approve new seller registration requests
        </p>
      </div>

      {/* Main Request Card */}
      <div className={s.card}>
        <div className={s.cardInner}>
          <h2 className={s.sectionTitle}>
            Pending Requests ({requests.length})
          </h2>

          {/* Empty State vs. Request Cards Grid */}
          {requests.length === 0 ? (
            <div className={s.emptyState}>
              <HiOutlineCheckCircle
                size={48}
                className={s.emptyStateIcon}
              />
              <p>No pending seller requests at the moment</p>
            </div>
          ) : (
            <div className={s.requestGrid}>
              {requests.map((request) => (
                <div key={request._id} className={s.requestCard}>
                  {/* Request Header */}
                  <div className={s.requestHeader}>
                    <div className={s.avatar}>
                      {request.name ? request.name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <div className={s.requestName}>{request.name}</div>
                      <div className={s.requestDate}>
                        <HiOutlineClock />
                        <span>
                          Joined{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className={s.contactInfo}>
                    <div className={s.contactItem}>
                      <HiOutlineMail size={18} className="text-primary" />{" "}
                      <span>{request.email}</span>
                    </div>

                    {request.phone && (
                      <div className={s.contactItem}>
                        <HiOutlinePhone size={18} className="text-primary" />{" "}
                        <span>{request.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleApprove(request._id)}
                    className={s.approveButton}
                  >
                    <HiOutlineCheckCircle size={20} />
                    <span>Approve Seller</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRequest;