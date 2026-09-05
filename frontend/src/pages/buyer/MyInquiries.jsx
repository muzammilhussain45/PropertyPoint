import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineChatAlt2,
  HiHome,
  HiUser,
  HiMail,
  HiPhone,
  HiCalendar,
  HiCheckCircle,
  HiExternalLink,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import Navbar from "../../components/common/Navbar";
import {myInquiriesStyles as s} from "../../assets/dummyStyles.js";


const MyInquiries = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSeller = user?.role === "seller";

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;

      try {
        const endpoint = user.role === "seller" ? "seller" : "my";
        const response = await axios.get(
          `${API_URL}/api/inquiry/${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setInquiries(response.data?.inquiries || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching the inquiry:", err);
        setError(
          err.response?.data?.message || "Failed to load inquiry"
        );
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [token, user]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/inquiry/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInquiries((prevInquiries) =>
        prevInquiries.map((inq) =>
          inq._id === id ? { ...inq, isRead: true } : inq
        )
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleStartChat = async (inquiry) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          propertyId: inquiry.property?._id,
          buyerId: inquiry.buyer?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/chat-messages", {
        state: { chat: response.data },
      });
    } catch (err) {
      console.error("Error starting the chat:", err);
      alert("Failed to start the chat. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={
          user?.role !== "seller"
            ? s.bgBgAltMinH
            : s.bgTransparentMinH
        }
      >
        {user?.role !== "seller" && <Navbar />}
        <div className={s.containerPy12TextCenter}>
          <div className={s.cardPremiumPy16Px8}>
            <h2 className={s.textDangerMb4} >Error</h2>
            <p className={s.mb8}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={s.btnPrimary}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        user?.role !== "seller" ? s.bgBgAltMinH : s.bgTransparentHAuto
      }
    >
      {user?.role !== "seller" && <Navbar />}

      <div
        className={`${s.containerFadeIn} ${
          user?.role !== "seller" ? s.py12Pt12 : s.pt0
        }`}
      >
        <div className={s.mb12}>
          <h1 className={s.heading}>
            {isSeller ? "Customer Inquiries" : "My Inquiries"}
          </h1>
          <p className={s.textMuted}>
            {isSeller
              ? "Review and respond to interest in your properties"
              : "Track the status of your property inquiries"}
          </p>
        </div>

        {inquiries.length === 0 ? (
          <div className={s.cardPremiumPy24Px8TextCenter}>
            <div className={s.iconContainer}>
              <HiOutlineChatAlt2 size={40} />
            </div>
            <h2 className={s.mb4}>
              {isSeller ? "No inquiries received" : "No inquiries sent"}
            </h2>
            <p className={s.textMutedMb8}>
              {isSeller
                ? "You haven't received any inquiries yet. Better listings get more attention."
                : "You haven't contacted any seller. Interested in a property? Send an inquiry."}
            </p>
            <Link to="/" className={s.btnPrimary}>
              {isSeller ? "Improve My Listings" : "Discover Properties"}
            </Link>
          </div>
        ) : (
          <div className={s.flexColGap6}>
            {inquiries.map((inq) => (
              <div key={inq._id} className={s.inquiryCard}>
                <div className={s.inquiryMain}>
                  <div className={s.iconWrapper}>
                    <HiHome className={s.iconSize} />
                  </div>

                  <div className={s.flex1}>
                    <div className={s.titleRow}>
                      <h3 className={s.titleText}>
                        {inq.property?.title}
                      </h3>
                      <span
                        className={`${s.badge} ${
                          inq.isRead ? s.badgeRead : s.badgeNew
                        }`}
                      >
                        {inq.isRead ? "Read" : "New"}
                      </span>
                    </div>

                    {isSeller && (
                      <div className={s.buyerInfo}>
                        <div className={s.infoItem}>
                          <HiUser className={s.textMutedSmall} />{" "}
                          <span className={s.fontSemibold}>
                            {inq.buyer?.name}
                          </span>
                        </div>
                        <div className={s.infoItem}>
                           <HiMail className={s.textMutedSmall} />{" "}
                          <span>{inq.buyer?.email}</span>
                        </div>
                        <div className={s.infoItem}>
                           <HiPhone className={s.textMutedSmall} />{" "}
                          <span>{inq.buyer?.phone || "No phone provided"}</span>
                        </div>
                      </div>
                    )}

                    <p className={s.message}>"{inq.message}"</p>

                    <div className={s.meta}>
                      <div className={s.flexItemsCenterGap2}>
                        <HiCalendar size={16} />{" "}
                        <span>
                          {isSeller ? "Received" : "Sent"} on{" "}
                          {new Date(inq.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {!isSeller && (
                        <div className={s.flexItemsCenterGap2}>
                          <HiCheckCircle size={16} />{" "}
                          <span>
                            {inq.isRead
                              ? "Seller viewed"
                              : "Waiting for seller to view it"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={s.actions}>
                  <Link
                    to={`/property/${inq.property?._id}`}
                    className={s.btnOutline}
                  >
                    <HiExternalLink size={16} /> View Property
                  </Link>

                  {isSeller && !inq.isRead && (
                    <button
                      onClick={() => markAsRead(inq._id)}
                      className={s.btnPrimaryWhitespaceNowrap}
                    >
                      Mark as Read
                    </button>
                  )}

                  {isSeller && (
                    <button
                      onClick={() => handleStartChat(inq)}
                      className={s.btnMessage}
                    >
                      <HiOutlineChatAlt2 size={16} /> Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInquiries;