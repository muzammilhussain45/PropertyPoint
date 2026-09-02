import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  HiChevronRight,
  HiChevronLeft,
  HiLocationMarker,
  HiHeart,
  HiOutlineHeart,
  HiX,
  HiBadgeCheck,
  HiChatAlt,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiCollection,
  HiOutlineViewGrid,
  HiCalendar,
} from "react-icons/hi";

import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import { API_URL } from "../../config";
import { propertyDetailsStyles as s } from "../../assets/dummyStyles.js";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [inquiryStatus, setInquiryStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () =>
    setLightboxIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length,
    );

  // Fetch Property Details & Wishlist Check
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/api/property/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setProperty(response.data.property);
        setSimilarProperties(response.data.similarProperties || []);

        if (user && user.role === "buyer") {
          const wishResponse = await axios.get(`${API_URL}/api/wishlist`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const found = wishResponse.data.some(
            (item) => item.property?._id === id,
          );
          setIsInWishlist(found);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load property details");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, user, token]);

  // Wishlist Toggle Handler
  const handleWishlistToggle = async () => {
    if (!user) {
      return navigate("/login");
    }

    try {
      if (isInWishlist) {
        await axios.delete(`${API_URL}/api/wishlist/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsInWishlist(false);
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setIsInWishlist(true);
      }
    } catch (err) {
      alert("Failed to update wishlist");
    }
  };

  // Inquiry Form Submission Handler
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only the buyer can send the inquiry");
      return;
    }
    setInquiryStatus({ ...inquiryStatus, loading: true });
    try {
      await axios.post(
        `${API_URL}/api/inquiry`,
        {
          propertyId: id,
          message: inquiry.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setInquiryStatus({ loading: false, success: true, error: null });
      setInquiry({ ...inquiry, message: "" });
    } catch (err) {
      setInquiryStatus({
        loading: false,
        success: false,
        error: "Failed to send inquiry to the seller",
      });
    }
  };

  // Start Chat Handler
  const handleChatStart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      alert("Only the buyer can start a chat with the seller");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          propertyId: id,
          sellerId: property.seller?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const chat = response.data;
      await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: chat._id,
          text: `Interested in ${property.title}`,
          image: property.images?.[0] || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/chat-message", { state: { chat } });
    } catch (err) {
      console.error("error starting the chat", err);
      alert("Failed to start chat");
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  // Error Screen
  if (error || !property) {
    return (
      <div
        className="container"
        style={{ padding: "4rem", textAlign: "center" }}
      >
        {error || "Property not found"}
      </div>
    );
  }

  const stats = [
    {
      label: "Bedrooms",
      value: property.bhk || 0,
      icon: HiOutlineHome,
    },
    {
      label: "Bathrooms",
      value:
        property.bathrooms || Math.max(1, (parseInt(property.bhk) || 1) - 1),
      icon: HiOutlineUserGroup,
    },
    {
      label: "Furnishing",
      value: property.furnishing || "N/A",
      icon: HiCollection,
    },
    {
      label: "Living Area",
      value: `${property.areaSize} sqft`,
      icon: HiOutlineViewGrid,
    },
    {
      label: "Type",
      value: property.propertyType,
      icon: HiCalendar,
    },
  ];

  const propertySpecs = [
    {
      label: "Property ID",
      value: property._id.slice(-8).toUpperCase(),
    },
    {
      label: "Added On",
      value: new Date(property.createdAt).toLocaleDateString(),
    },
    { label: "Property Type", value: property.propertyType },
    { label: "Status", value: `For ${property.status}` },
  ];

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        {/* Breadcrumb Navigation */}
        <nav className={s.breadcrumbs}>
          <Link to="/" className={s.breadcrumbLink}>
            Home
          </Link>
          <HiChevronRight />
          <Link to="/properties" className={s.breadcrumbLink}>
            Listings
          </Link>
          <HiChevronRight />
          <span className={s.breadcrumbCurrent}>{property.title}</span>
        </nav>

        <div className={s.galleryContainer}>
          <div
            className={s.galleryGrid}
            style={{
              gridTemplateColumns:
                property.images.length > 1 ? "repeat(4, 1fr)" : "1fr",
              gridTemplateRows:
                property.images.length > 1 ? "repeat(2, 180px)" : "400px",
            }}
          >
            {/* Main Featured Image */}

            <div
              className={s.galleryMainItem(property.images.length > 1)}
              onClick={() => openLightbox(0)}
            >
              <img
                src={property.images[0]}
                alt={property.title || "Property"}
                className={s.galleryImage}
              />
            </div>

            {/* Side Grid Images (1 to 4) */}
            {property.images &&
              property.images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className={s.gallerySideItem}
                  onClick={() => openLightbox(idx + 1)}
                >
                  <img src={img} alt="image" className={s.galleryImage} />
                  {idx === 3 && property.images.length > 5 && (
                    <div className={s.galleryMoreOverlay}>
                      +{property.images.length - 5}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Mobile Horizontal Carousel / Slider */}
          <div className={s.mobileSliderContainer}>
            <div className={s.mobileSliderTrack}>
              {property.images &&
                property.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={s.mobileSliderWrapper}
                    onClick={() => openLightbox(idx)}
                  >
                    <img
                      src={img}
                      alt="images"
                      className={s.mobileSlideImage}
                    />
                    <div className={s.mobileSlideCounter}>
                      {idx + 1} / {property.images.length}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Lightbox */}
        {lightboxIndex !== null && (
          <div className={s.lightboxOverlay} onClick={closeLightbox}>
            <button className={s.lightboxCloseBtn} onClick={closeLightbox}>
              <HiX size={24} className={s.lightboxCloseIcon} />
            </button>

            <div
              className={s.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={property.images[lightboxIndex]}
                alt="images"
                className={s.lightboxImage}
              />

              {property.images && property.images.length > 1 && (
                <>
                  <button className={s.lightboxPrevBtn} onClick={prevImage}>
                    <HiChevronLeft size={30} />
                  </button>
                  <button className={s.lightboxNextBtn} onClick={nextImage}>
                    <HiChevronRight size={30} />
                  </button>
                </>
              )}

              <div className={s.lightboxCounter}>
                {lightboxIndex + 1} / {property.images?.length}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className={s.detailsLayout}>
          {/* Information Column (Left) */}
          <div className={s.infoColumn}>
            <div className={s.infoHeader}>
              <div className={s.titleWrapper}>
                <div className={s.badgeWrapper}>
                  <span className={s.premiumBadge}>Premium</span>
                </div>
                <h1 className={s.propertyTitle}>{property.title}</h1>
                <p className={s.propertyLocation}>
                  <HiLocationMarker className={s.locationIcon} />
                  <span className={s.locationText}>
                    {property.area}, {property.city}, USA
                  </span>
                </p>
              </div>

              {/* Wishlist Button */}
              <div className={s.actionButtons}>
                {(!user || user.role === "buyer") && (
                  <button
                    onClick={handleWishlistToggle}
                    className={s.wishlistButton(isInWishlist)}
                  >
                    {isInWishlist ? (
                      <HiHeart size={26} fill="#ef4444" />
                    ) : (
                      <HiOutlineHeart size={26} />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className={s.statsGrid}>
              {stats.map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <div key={i} className={s.statCard}>
                    <StatIcon size={18} className={s.statIcon} />
                    <div className={s.statValue}>{stat.value}</div>
                    <div className={s.statLabel}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div className={s.descriptionSection}>
              <h3 className={s.sectionTitle}>Description</h3>
              <p className={s.descriptionText}>
                {property.description ||
                  "No description available for this property"}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className={s.amenitiesSection}>
              <h3 className={s.sectionTitle}>Amenities</h3>
              <div className={s.amenitiesGrid}>
                {(property.amenities?.length
                  ? property.amenities
                  : ["Parking", "Security", "Water Supply", "Power Backup"]
                ).map((amn, i) => (
                  <div key={index} className={s.amenityItem}>
                    <HiBadgeCheck size={18} className={s.amenityIcon} />
                    <span className={s.amenityText}>{amn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column (Right) */}
          <div className={s.sidebarColumn}>
            {/* Price Card */}
            <div
              className={s.priceCard}
              style={{ background: "var(--primary)" }}
            >
              <div className={s.priceCardLabel}>
                {property.status?.toLowerCase() === "rent"
                  ? "Rental Details"
                  : "Listing Price"}
              </div>

              <div className={s.priceCardValue}>
                {property.status?.toLowerCase() === "rent"
                  ? `$${Number(property.price).toLocaleString("en-US")}`
                  : formattedPrice}
                {property.status?.toLowerCase() === "rent" && (
                  <span className={s.priceCardPeriod}> /month</span>
                )}
              </div>

              {/* Rent-Specific Breakdown */}
              {property.status?.toLowerCase() === "rent" && (
                <div className={s.rentDetails}>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Security Deposit</span>
                    <span className={s.rentDetailValue}>
                      $
                      {Number(property.securityDeposit || 0).toLocaleString(
                        "en-US",
                      )}
                    </span>
                  </div>
                  <div className={s.rentDetailRow}>
                    <span className={s.rentDetailLabel}>Maintenance</span>
                    <span className={s.rentDetailValue}>
                      $
                      {Number(property.maintenance || 0).toLocaleString(
                        "en-US",
                      )}{" "}
                      / month
                    </span>
                  </div>
                </div>
              )}

              <div className={s.priceCardAvailability}>
                Available for:{" "}
                {property.status?.toLowerCase() === "rent" ? "Rent" : "Sale"}
              </div>
            </div>

            {/* seller and contact*/}

            <div className={s.sellerCard}>
              <div className={s.sellerInfo}>
                <div className={s.sellerAvatar}>
                  <img
                    src={
                      property.seller?.profilePic ||
                      `https://ui-avatars.com/api/?name=${property.seller?.name || "Seller"}&background=0d6e59&color=fff`
                    }
                    alt="Agent"
                    className={s.sellerAvatarImage}
                  />
                </div>
                <div className={s.sellerDetails}>
                  <div className={s.sellerNameLink}>
                    <h4 className={s.sellerName}>
                      {property.seller?.name || "Seller"}
                    </h4>
                  </div>
                  <div className={s.sellerVerifiedBadge}>
                    <HiBadgeCheck className={s.verifiedIcon} /> Verified Seller
                  </div>
                </div>
              </div>

              <div className={s.chatButtonWrapper}>
                <button className={s.chatButton} onClick={handleChatStart}>
                  <HiChatAlt /> Chat
                </button>
              </div>

              {/* Inquiry Form */}
              <h4 className={s.inquiryFormTitle}>Inquire</h4>
              <form onSubmit={handleInquirySubmit}>
                {user?.role === "buyer" ? (
                  <>
                    <textarea
                      placeholder="Your Message..."
                      value={inquiry.message}
                      onChange={(e) =>
                        setInquiry({ ...inquiry, message: e.target.value })
                      }
                      className={s.inquiryTextarea}
                      required
                    />
                    <button
                      type="submit"
                      className={s.inquirySubmitButton}
                      disabled={inquiryStatus.loading}
                    >
                      {inquiryStatus.loading ? "Sending..." : "Send Inquiry"}
                    </button>
                    {inquiryStatus.success && (
                      <p className={s.inquirySuccessMessage}>Inquiry sent!</p>
                    )}
                  </>
                ) : (
                  <div className={s.inquiryDisabledMessage}>
                    <p className={s.inquiryDisabledText}>
                      {user
                        ? "Only buyers can send inquiries."
                        : "Please login as a buyer to send inquiries."}
                    </p>
                    {!user && (
                      <Link to="/login" className={s.inquiryLoginButton}>
                        Login
                      </Link>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Additional Specs */}
        <div className={s.additionalDetails}>
          <h3 className={s.detailsTitle}>Property Details</h3>
          <div className={s.detailsGrid}>
            {propertySpecs.map((detail, i) => (
              <div key={i} className={s.detailRow}>
                <span className={s.detailLabel}>{detail.label}</span>
                <span className={s.detailValue}>{detail.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Properties Section */}
        <section className={s.similarSection}>
          <div className={s.similarHeader}>
            <div>
              <h2 className={s.similarTitle}>Similar Properties</h2>
              <p className={s.similarSubtitle}>
                Listings you might like in {property.city}
              </p>
            </div>
            <Link to="/properties" className={s.similarAllLink}>
              All Listings <HiChevronRight />
            </Link>
          </div>

          <div className={s.similarGrid}>
            {similarProperties.length > 0 ? (
              similarProperties
                .slice(0, 3)
                .map((p) => <PropertyCard key={p._id} property={p} />)
            ) : (
              <div className={s.similarEmptyState}>
                No similar properties found in this location
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PropertyDetails;