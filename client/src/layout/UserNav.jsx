import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserNav.css";

export default function UserNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Profile",
      path: "/user/profile",
    },
    {
      label: "Change password",
      path: "/user/change-password",
    },
    {
      label: "Address",
      path: "/user/shipping-address",
    },
  ];

  // const accountMenuItems = [
  //   {
  //     label: "Address",
  //     path: "/user/shipping-address",
  //   },
  // ];

  const orderMenuItems = [
    {
      label: "Processing Orders",
      path: "/user/processing-orders",
    },
    {
      label: "Completed Orders",
      path: "/user/completed-orders",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="user-sidebar">
      <div className="user-header">
        <h3>Manage Account</h3>
      </div>

      <div className="user-section">
        <nav className="user-menu">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`user-menu-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* <div className="user-section">
        <h4 className="section-title">Address</h4>
        <nav className="user-menu">
          {accountMenuItems.map((item) => (
            <button
              key={item.path}
              className={`user-menu-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div> */}

      <div className="user-section">
        <div className="user-header">
          <h3>Order Management</h3>
        </div>
        <nav className="user-menu">
          {orderMenuItems.map((item) => (
            <button
              key={item.path}
              className={`user-menu-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button className="user-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
