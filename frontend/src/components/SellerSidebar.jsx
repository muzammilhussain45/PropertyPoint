import { NavLink } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineHome,
  HiOutlineAnnotation,
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineSupport,
  HiOutlineLogout,
  HiOutlineClipboardList,
  HiOutlineChartBar,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";
import { sellerSidebarStyles as s } from "../assets/dummyStyles.js";

const SellerSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/dashboard" },
    {
      name: "My Listings",
      icon: HiOutlineClipboardList,
      path: "/my-properties",
    },
    { name: "Leads", icon: HiOutlineChartBar, path: "/inquiries" },
    { name: "Messages", icon: HiOutlineViewGrid, path: "/chat-messages" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
    { name: "Support", icon: HiOutlineSupport, path: "/contact" },
  ];

  return (
    <>
      <div
        className={`${s.backdrop} ${
          isOpen ? s.backdropVisible : s.backdropHidden
        }`}
        onClick={onClose}
      />

      <aside
        className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}
      >
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} />
        </div>

        <nav className={s.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `${s.navLink} ${
                    isActive ? s.navLinkActive : s.navLinkInactive
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={s.logoutContainer}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className={s.logoutButton}
          >
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;
