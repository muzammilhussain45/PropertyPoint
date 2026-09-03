import React, { useState, useEffect } from "react";
import axios from "axios";
import {

  HiOutlineCheckCircle,
  HiOutlineTicket,
  HiOutlineLibrary,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { adminDashboardStyles as s } from "../../assets/dummyStyles";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setStats(response.data.stats);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load admin dashboard stats", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Admin dashboard mounted");
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: HiOutlineUserGroup,
      color: "#0d9488",
      bg: "#ccfbf1",
    },
    {
      title: "Total Properties",
      value: stats.totalProperties || 0,
      icon: HiOutlineLibrary,
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      title: "Active Listings",
      value: stats.activeListings || 0,
      icon: HiOutlineTicket,
      color: "#3b82f6",
      bg: "#dbeafe",
    },
    {
      title: "Sold Properties",
      value: stats.soldProperties || 0,
      icon: HiOutlineCheckCircle,
      color: "#10b981",
      bg: "#dcfce7",
    },
  ];

  const systemServices = [
    "Database",
    "Media Storage",
    "Auth Service",
    "API Gateway",
  ];

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader} />
      </div>
    );
  }

  return (
    <>
      <div className={s.headerContainer}>
        <div>
          <h1 className={s.pageTitle}>Admin Overview</h1>
          <p className={s.pageSubtitle}>
            Welcome back administrator, here is today's summary
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            window.location.reload();
          }}
          className={s.refreshButton}
        >
          Refresh
        </button>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className={s.statsGrid}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={s.statCard}>
              <div
                className={s.statIconContainer}
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                <Icon size={22} />
              </div>
              <div className={s.statTitle}>{card.title}</div>
              <div className={s.statValue}>
                {card.value?.toLocaleString() || 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Grid: System Health & Admin Tools */}
      <div className={s.secondGrid}>
        {/* System Health Card */}
        <div className={s.systemHealthCard}>
          <h3 className={s.systemHealthTitle}>System Health</h3>
          <div className={s.servicesContainer}>
            {systemServices.map((service, i) => (
              <div key={i} className={s.serviceItem}>
                <div className={s.serviceName}>{service}</div>
                <div className={s.statusContainer}>
                  <span className={s.statusDot} />
                  <span className={s.statusText}>Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Quick Tools Card */}
        <div className={s.adminToolsCard}>
          <h3 className={s.adminToolsTitle}>Admin Tools</h3>
          <p className={s.adminToolsDesc}>
            Quickly manage platform resources and tasks
          </p>

          <div className={s.adminToolsButtonsContainer}>
            <button type="button" className={s.adminToolButton}>
              System Logs
            </button>
            <button type="button" className={s.adminToolButton}>
              DB Backup
            </button>
            <button type="button" className={s.adminToolButton}>
              Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
