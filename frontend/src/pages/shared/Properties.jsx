import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineFilter,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiLocationMarker,
  HiFilter,
  HiViewGrid,
  HiViewList,
  HiX,
  HiSearch,
  HiAdjustments,
} from "react-icons/hi";

import Navbar from "../../components/common/Navbar.jsx";
import PropertyCard from "../../components/common/PropertyCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import API_URL from "../../config.js";
import { propertiesStyles as s } from "../../assets/dummyStyles.js";

const Properties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [filters, setFilters] = useState({
    city: "",
    propertyType: [],
    bhk: "",
    maxPrice: 500000,
    amenities: [],
    furnishing: [],
    sort: "latest",
  });

  const propertyTypes = [
    { label: "Flat/Apartment", value: "flat" },
    { label: "Independent House/Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];
  const bhkOptions = ["1", "2", "3", "4", "5+"];
  const furnishingOptions = [
    { label: "Furnished", value: "furnished" },
    { label: "Semi-Furnished", value: "semi-furnished" },
    { label: "Unfurnished", value: "unfurnished" },
  ];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get("city") || "";
    const type = queryParams.get("type") || "";
    const bhk = queryParams.get("bhk") || "";

    const initialFilters = {
      ...filters,
      city,
      propertyType: type ? [type] : [],
      bhk,
    };

    setFilters(initialFilters);
    fetchProperties(initialFilters);

    if (user) {
      fetchWishlist();
    }
  }, [location.search, user]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = response.data
        .filter((item) => item.property)
        .map((item) => String(item.property._id));
      setWishlistedIds(ids);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const handleToggleWishlist = async (propertyId) => {
    try {
      const isWishlisted = wishlistedIds.includes(propertyId);
      if (isWishlisted) {
        await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistedIds((prev) => prev.filter((id) => id !== propertyId));
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${propertyId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setWishlistedIds((prev) => [...prev, propertyId]);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.propertyType.length > 0)
        params.append("propertyType", currentFilters.propertyType.join(","));
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.maxPrice)
        params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.furnishing && currentFilters.furnishing.length > 0)
        params.append("furnishing", currentFilters.furnishing.join(","));
      if (currentFilters.sort) params.append("sort", currentFilters.sort);

      const res = await axios.get(
        `${API_URL}/api/property?${params.toString()}`,
      );
      const propertiesData = res.data.properties || res.data || [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setError(null);
    } catch (err) {
      setError("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimer = useRef(null);

  const debouncedFetch = (updatedFilters) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchProperties(updatedFilters);
    }, 500);
  };

  const handleCheckboxChange = (category, value) => {
    const current = [...(filters[category] || [])];
    const index = current.indexOf(value);
    if (index === -1) {
      current.push(value);
    } else {
      current.splice(index, 1);
    }
    const updatedFilters = { ...filters, [category]: current };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const updatedFilters = { ...filters, maxPrice: value };
    setFilters(updatedFilters);
    debouncedFetch(updatedFilters);
  };

  const handleBhkSelect = (value) => {
    const updatedFilters = {
      ...filters,
      bhk: filters.bhk === value ? "" : value,
    };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const updatedFilters = { ...filters, sort: newSort };
    setFilters(updatedFilters);
    fetchProperties(updatedFilters);
  };

  const applyFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchProperties(filters);
  };

  const resetFilters = () => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    const reset = {
      city: "",
      propertyType: [],
      bhk: "",
      maxPrice: 500000,
      amenities: [],
      furnishing: [],
      sort: "latest",
    };
    setFilters(reset);
    navigate("/properties");
    fetchProperties(reset);
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  return (
    <div className={s.pageContainer}>
      <Navbar />

      <div className={s.container}>
        {/* Mobile Filter Toggle Button */}
        <div className={s.mobileFilterButtonWrapper}>
          <button
            onClick={() => setShowMobileFilter(true)}
            className={s.mobileFilterButton}
          >
            <HiFilter /> Show Filter & Search
          </button>
        </div>

        <div className={s.layout}>
          {/* Sidebar Filters */}
          <aside
            className={`${s.sidebar} ${
              showMobileFilters ? s.sidebarVisible : s.sidebarHidden
            }`}
          >
            <div className={s.sidebarHeader}>
              <div className={s.sidebarTitleWrapper}>
                <HiFilter className={s.sidebarTitleIcon} />
                <h2 className={s.sidebarTitle}>Filters</h2>
              </div>
              <div className={s.sidebarHeaderActions}>
                <button onClick={resetFilters} className={s.resetButton}>
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className={s.closeMobileFilters}
                >
                  <HiX />
                </button>
              </div>
            </div>

            <div className={s.filtersScrollArea}>
              {/* City / Location Search */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Location</label>
                <div className={s.searchInputWrapper}>
                  <HiSearch className={s.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by city"
                    value={filters.city}
                    onChange={(e) => {
                      const updatedFilters = {
                        ...filters,
                        city: e.target.value,
                      };
                      setFilters(updatedFilters);
                      debouncedFetch(updatedFilters);
                    }}
                    className={s.searchInput}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className={s.filterSection}>
                <div className={s.priceHeader}>
                  <label className={s.filterLabel}>Price Range</label>
                  <span className={s.priceValue}>
                    ${filters.maxPrice.toLocaleString("en-US")}
                  </span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="500000"
                  step="1000"
                  value={filters.maxPrice}
                  onChange={handlePriceChange}
                  className={s.priceSlider}
                />
                <div className={s.priceLabels}>
                  <span>$300</span>
                  <span>$500,000</span>
                </div>
              </div>

              {/* Property Type Checkboxes */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Property Type</label>
                <div className={s.checkboxGroup}>
                  {propertyTypes.map((type) => (
                    <label key={type.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.propertyType.includes(type.value)}
                        onChange={() =>
                          handleCheckboxChange("propertyType", type.value)
                        }
                        className={s.checkbox}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Bedrooms (BHK) Filter */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Bedrooms</label>
                <div className={s.bhkGroup}>
                  {bhkOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleBhkSelect(option)}
                      className={`${s.bhkButton} ${
                        filters.bhk === option
                          ? s.bhkButtonActive
                          : s.bhkButtonInactive
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing Filter */}
              <div className={s.filterSection}>
                <label className={s.filterLabel}>Furnishing</label>
                <div className={s.checkboxGroup}>
                  {furnishingOptions.map((option) => (
                    <label key={option.value} className={s.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={filters.furnishing.includes(option.value)}
                        onChange={() =>
                          handleCheckboxChange("furnishing", option.value)
                        }
                        className={s.checkbox}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className={s.mainContent}>
            <div className={s.contentHeader}>
              <div>
                <span className={s.resultCount}>
                  Showing{" "}
                  <strong className={s.resultCountStrong}>
                    {loading ? "..." : properties.length}
                  </strong>{" "}
                  Properties
                </span>
              </div>

              <div className={s.headerControls}>
                {/* View Mode Toggle (Grid / List) */}
                <div className={s.viewModeToggle}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`${s.viewModeButton} ${
                      viewMode === "grid"
                        ? s.viewModeActive
                        : s.viewModeInactive
                    }`}
                  >
                    <HiViewGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`${s.viewModeButton} ${
                      viewMode === "list"
                        ? s.viewModeActive
                        : s.viewModeInactive
                    }`}
                  >
                    <HiViewList size={20} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className={s.sortControl}>
                  <span className={s.sortLabel}>Sort:</span>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className={s.sortSelect}
                  >
                    <option value="latest">Latest</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Display Conditions */}
            {loading ? (
              // 1. Loading Skeleton Grid
              <div className={s.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={s.skeletonCard} />
                ))}
              </div>
            ) : error ? (
              // 2. Error View
              <div className={s.errorContainer}>
                <HiX size={48} className={s.errorIcon} />
                <h3 className={s.errorTitle}>{error}</h3>
                <button onClick={applyFilters} className={s.errorButton}>
                  Try Again
                </button>
              </div>
            ) : properties.length === 0 ? (
              // 3. Empty State View
              <div className={s.emptyContainer}>
                <div className={s.emptyIconWrapper}>
                  <HiAdjustments size={32} className={s.emptyIcon} />
                </div>
                <h2 className={s.emptyTitle}>No Properties Found</h2>
                <p className={s.emptyText}>Broaden your search criteria</p>
                <button onClick={resetFilters} className={s.emptyButton}>
                  Clear All
                </button>
              </div>
            ) : (
              // 4. Property Cards Listing (Grid or List View)
              <div
                className={`${s.propertyList} ${
                  viewMode === "grid" ? s.propertyListGrid : s.propertyListList
                }`}
              >
                {properties
                  .filter((property) => property)
                  .map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                      isWishlisted={wishlistedIds.includes(
                        String(property._id),
                      )}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileFilters && (
        <div
          onClick={() => setShowMobileFilters(false)}
          className={s.mobileOverlay}
        />
      )}
    </div>
  );
};
export default Properties;
