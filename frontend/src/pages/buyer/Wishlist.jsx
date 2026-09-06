import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { HiHeart, HiTrash } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import { wishlistStyles as s } from "../../assets/dummyStyles.js";
import { API_URL } from "../../config.js";

const Wishlist = () => {
  const { token } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlistItems(response.data);
      setLoading(false);
    } catch (err) {
      setError("fail to load wishlist");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (propertyId) => {
    if (!propertyId) {
      alert("Invalid Property ID");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlistItems((prev) =>
        prev.filter((item) => item.property?._id !== propertyId)
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "failed to remove from wish list";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        <div className={s.headingWrapper}>
          <h1 className={s.heading}>Your Wishlist</h1>
          <p className={s.subheading}>Properties you have saved for later.</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiHeart size={40} />
            </div>
            <h2 className={s.emptyTitle}>Your Wishlist is empty</h2>
            <p className={s.emptyText}>
              Start exploring properties and save your favorites
            </p>
            <Link to="/" className={s.browseButton}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className={s.gridContainer}>
            {wishlistItems
              .filter((item) => item.property)
              .map((item) => (
                <PropertyCard
                  key={item._id}
                  property={item.property}
                  renderActions={() => (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(item.property._id);
                      }}
                      className={s.removeButton}
                    >
                      <HiTrash size={18} /> Remove from Wishlist
                    </button>
                  )}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;