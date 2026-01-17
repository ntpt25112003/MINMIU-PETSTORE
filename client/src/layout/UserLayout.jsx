import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Heading from "../components/header/Heading";
import UserNav from "./UserNav";
import Footer from "../components/footer/Footer";
import "./UserLayout.css";

export default function UserLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // Guard - redirect if not user role or not authenticated
  if (!user || !token || (user.role && user.role !== "user")) {
    return <Navigate to="/" replace />;
  }

  // Layout
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Heading />
      <div className="ul-container">
        <UserNav />
        <main className="ul-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
