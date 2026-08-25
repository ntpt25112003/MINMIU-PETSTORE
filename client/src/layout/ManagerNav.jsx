import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ManagerNav.css";

export default function ManagerNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Appointments",
      path: "/manager/appointments",
    },
    {
      label: "All Order",
      path: "/manager/allorder",
    },
    {
      label: "All Product",
      path: "/manager/allproduct",
    },
    {
      label: "Categories",
      path: "/manager/addcategory",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <aside className="mn-sidebar">
      <div className="mn-header">
        <h3>Manage Account</h3>
      </div>

      <nav className="mn-menu">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`mn-menu-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button className="mn-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
