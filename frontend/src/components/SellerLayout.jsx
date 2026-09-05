import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SellerSidebar from "./SellerSidebar";
import DashboardNavbar from "./DashboardNavbar";
import PendingApproval from "../pages/seller/PendingApproval";
import {sellerLayoutStyles as s} from "../assets/dummyStyles.js";


const SellerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Public paths accessible even if seller approval is pending
  const isPublicDashboardRoute = ["/contact", "/profile"].includes(
    location.pathname
  );

  return (
    <div className={s.container}>
      <SellerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={s.contentWrapper}>
        <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={s.main}>
          {user?.isApproved || isPublicDashboardRoute ? (
            <Outlet />
          ) : (
            <PendingApproval />
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;