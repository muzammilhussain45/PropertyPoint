import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineSupport,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { pendingApprovalStyles as s } from "../../assets/dummyStyles.js";



const PendingApproval = () => {
  const {logout, user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-polling user verification status every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshUser]);

  // Manual status refresh handler
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className={s.container}>
      <div className={s.iconCircle}>
        <HiOutlineClock size={48} />
      </div>

      <h1 className={s.heading}>Approval Pending</h1>

      <p className={s.description}>
        Hello {user?.name}, your seller account is currently under review by our
        administration team. Approval usually takes less than 24 hours. You will
        gain full access to your dashboard once you have verified.
      </p>

      <div className={s.buttonGroup}>
        <a href="/properties" className={s.browseButton}>
          Browse Properties
        </a>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className={`${s.refreshButtonBase} ${
            refreshing ? s.refreshButtonDisabled : s.refreshButtonEnabled
          }`}
        >
          <HiOutlineRefresh
            size={20}
            className={refreshing ? "animate-spin" : ""}
          />
          <span>{refreshing ? "Checking..." : "Check Status Now"}</span>
        </button>
      </div>

      <div className={s.supportContainer}>
        <HiOutlineSupport size={18} />
        <span>Need help?</span>
        <Link to="/contact" className={s.supportLink}>
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;