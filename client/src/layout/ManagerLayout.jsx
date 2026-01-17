import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Heading from "../components/header/Heading";
import ManagerNav from "./ManagerNav";
import Footer from "../components/footer/Footer";
import "./ManagerLayout.css";

export default function ManagerLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Guard
  if (!user || user.role !== "manager") {
    return <Navigate to="/" replace />;
  }

  // Layout
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Heading isManager={true} />
      <div className="ml-container">
        <ManagerNav />
        <main className="ml-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
