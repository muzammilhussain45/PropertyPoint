import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlineMail, HiOutlinePhone, HiOutlineClock } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { adminContactsStyles as s } from "../../assets/dummyStyles.js";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setContacts(response.data.contacts);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load the contacts", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <div className={s.container}>
        <h1 className={s.heading}>Contact Requests</h1>
        <p className={s.subheading}>
          Read and manage inquiries from platform users
        </p>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <h2 className={s.cardTitle}>Inbox ({contacts.length})</h2>
        </div>

        {contacts.length === 0 ? (
          <div className={s.emptyState}>
            <HiOutlineMail size={48} className={s.emptyIcon} />
            <p>No contact message yet inbox is clear</p>
          </div>
        ) : (
          <div className={s.contactList}>
            {contacts.map((contact, index) => (
              <div
                key={contact._id}
                className={s.contactItem(index, contacts.length)}
              >
                <div className={s.contactHeader}>
                  <div className="flex gap-5">
                    {/* Avatar with dynamic role styling and first letter initial */}
                    <div className={s.avatarWrapper(contact.role)}>
                      {contact.name
                        ? contact.name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div>
                      <div className={s.nameBadgeContainer}>
                        <h3 className={s.name}>{contact.name}</h3>

                        <span className={s.roleBadge(contact.role)}>
                          {contact.role}
                        </span>
                      </div>
                      {/* Contact Meta Details: Email, Phone & Date */}
                      <div className={s.contactDetails}>
                        <div className={s.detailItem}>
                          <HiOutlineMail size={16} />
                          <span>{contact.email}</span>
                        </div>

                        {contact.phone && (
                          <div className={s.detailItem}>
                            <HiOutlinePhone size={16} />
                            <span>{contact.phone}</span>
                          </div>
                        )}

                        <div className={s.detailItem}>
                          <HiOutlineClock size={16} />
                          <span>
                            {new Date(contact.createdAt).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Body Box */}
                <div className={s.messageBox}>{contact.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminContacts;
