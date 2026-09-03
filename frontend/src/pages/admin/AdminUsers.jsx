import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useEffect as useEffectHook,
} from "react";
import axios from "axios";
import {
  HiOutlineFilter,
  HiOutlineMail,
  HiOutlineIdentification,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineTrash,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { adminUsersStyles as s } from "../../assets/dummyStyles.js";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [openFilter, setOpenFilter] = useState(false);

  const { token } = useAuth();
  const filterRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setUsers(response.data.users);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load users", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffectHook(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setOpenFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  // Block / Unblock User Action
  const handleBlock = async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/admin/users/${id}/block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.success) {
        setUsers(
          users.map((u) =>
            u._id === id ? { ...u, isBlocked: response.data.isBlocked } : u,
          ),
        );
      }
    } catch (err) {
      alert("Operation failed");
    }
  };

  // Delete User Action
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );
  }

  return (
    <>
      <div className={s.containerHeader}>
        <div>
          <h1 className={s.headerTitle}>User Management</h1>
          <p className={s.headerSubtitle}>
            Monitor platform users and access levels
          </p>
        </div>

        {/* Role Filter Dropdown */}
        <div className={s.filterWrapper} ref={filterRef}>
          <button
            onClick={() => setOpenFilter((prev) => !prev)}
            className={s.filterButton}
          >
            <HiOutlineFilter size={18} />
            <span>Filter</span>
          </button>

          {openFilter && (
            <div className={s.filterDropdown}>
              <button
                onClick={() => {
                  setRoleFilter("all");
                  setOpenFilter(false);
                }}
                className={s.filterOption(roleFilter === "all")}
              >
                All Users
              </button>
              <button
                onClick={() => {
                  setRoleFilter("buyer");
                  setOpenFilter(false);
                }}
                className={s.filterOption(roleFilter === "buyer")}
              >
                Buyer
              </button>
              <button
                onClick={() => {
                  setRoleFilter("seller");
                  setOpenFilter(false);
                }}
                className={s.filterOption(roleFilter === "seller")}
              >
                Seller
              </button>
              <button
                onClick={() => {
                  setRoleFilter("admin");
                  setOpenFilter(false);
                }}
                className={s.filterOption(roleFilter === "admin")}
              >
                Admin
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={s.cardContainer}>
        <div className={s.cardHeader}>
          <div className={s.cardTitleRow}>
            <h2 className={s.cardTitle}>Platform Users</h2>
            <div className={s.userCount}>
              Showing{" "}
              <span className={s.userCountSpan}>{filteredUsers.length}</span>{" "}
              users
            </div>
          </div>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead className={s.thead}>
              <tr className={s.tableRow}>
                <th className={s.thUserInfo}>User Info</th>
                <th className={s.thRole}>Role</th>
                <th className={s.thContact}>Contact Details</th>
                <th className={s.thStatus}>Account Status</th>
                <th className={s.thActions}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className={s.tableRow}>
                    {/* User Identity Column */}
                    <td className={s.tdUserInfo}>
                      <div className="flex items-center gap-4">
                        <div className={s.userAvatar}>
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className={s.userInfoName}>{user.name}</div>
                          <div className={s.userInfoId}>
                            ID: {user._id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className={s.tdRole}>
                      <span className={s.roleBadge}>{user.role}</span>
                    </td>

                    {/* Contact Details Column */}
                    <td className={s.tdContact}>
                      <div className={s.contactWrapper}>
                        <div className={s.contactEmail}>
                          <HiOutlineMail color="#64748b" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className={s.contactPhone}>
                            <HiOutlineIdentification color="#64748b" />{" "}
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className={s.tdStatus}>
                      {user.isBlocked ? (
                        <span className={s.statusBadgeBlocked}>
                          <HiOutlineLockClosed size={14} /> Suspended
                        </span>
                      ) : (
                        <span className={s.statusBadgeActive}>
                          <HiOutlineLockOpen size={14} /> Active
                        </span>
                      )}
                    </td>

                    {/* Action Buttons Column */}
                    <td className={s.tdActions}>
                      <div className={s.actionsWrapper}>
                        <button
                          onClick={() => handleBlock(user._id)}
                          className={s.blockButton(user.isBlocked)}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? (
                            <HiOutlineLockOpen size={18} />
                          ) : (
                            <HiOutlineLockClosed size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(user._id)}
                          className={s.deleteButton}
                          title="Delete User"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={s.emptyState}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
