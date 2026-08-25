import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faPaw,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import socket from "../../../services/socket.js";
import "./UserAppointments.css";

const API_BASE = "http://localhost:8081/api";

export default function UserAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  // Real-Time Socket.IO: Live update when appointment status changes
  useEffect(() => {
    const handleRealtimeAppointmentUpdate = (data) => {
      console.log("⚡ [Socket.IO User] Appointment updated:", data);
      fetchMyAppointments();
    };

    socket.on("appointment_created", handleRealtimeAppointmentUpdate);
    socket.on("appointment_status_updated", handleRealtimeAppointmentUpdate);
    socket.on("appointment_cancelled", handleRealtimeAppointmentUpdate);

    return () => {
      socket.off("appointment_created", handleRealtimeAppointmentUpdate);
      socket.off("appointment_status_updated", handleRealtimeAppointmentUpdate);
      socket.off("appointment_cancelled", handleRealtimeAppointmentUpdate);
    };
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/user/appointments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.errCode === 0) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      console.error("fetchMyAppointments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await axios.put(
        `${API_BASE}/user/appointment/${id}/cancel`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data?.errCode === 0) {
        alert("Appointment cancelled successfully!");
        fetchMyAppointments();
      } else {
        alert(res.data?.errMessage || "Cannot cancel appointment!");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleOpenAIChat = () => {
    window.dispatchEvent(new CustomEvent("open-booking-chat"));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className="status-badge confirmed">Confirmed</span>;
      case "completed":
        return <span className="status-badge completed">Completed</span>;
      case "cancelled":
        return <span className="status-badge cancelled">Cancelled</span>;
      default:
        return <span className="status-badge confirmed">Pending</span>;
    }
  };

  return (
    <div className="user-appt-container">
      <div className="user-appt-header">
        <h2>
          <FontAwesomeIcon icon={faCalendarAlt} style={{ color: "#ff7e5f" }} />
          My Booked Appointments
        </h2>
        <button className="btn-new-appt" onClick={handleOpenAIChat}>
          <FontAwesomeIcon icon={faPlus} /> Book New Appointment with AI
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          Loading your appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-appts-box">
          <div className="empty-icon-lg">🐾</div>
          <h3>You have no appointments yet</h3>
          <p>Click the button below to have our AI Assistant help you book a quick appointment!</p>
          <button className="btn-new-appt" style={{ margin: "16px auto 0" }} onClick={handleOpenAIChat}>
            <FontAwesomeIcon icon={faPlus} /> Book Appointment Now
          </button>
        </div>
      ) : (
        <div className="user-appt-list">
          {appointments.map((appt) => (
            <div key={appt.id} className="user-appt-card">
              <div className="card-top">
                <span className="card-code">#MM-{appt.id}</span>
                {getStatusBadge(appt.status)}
              </div>

              <div className="card-body-info">
                <div className="info-row">
                  <span className="label">Service:</span>
                  <span className="val" style={{ color: "#e65100" }}>{appt.serviceType}</span>
                </div>
                <div className="info-row">
                  <span className="label">Pet:</span>
                  <span className="val">{appt.petName} ({appt.petType} {appt.petBreed ? `- ${appt.petBreed}` : ""})</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="val">{appt.appointmentDate}</span>
                </div>
                <div className="info-row">
                  <span className="label">Time Slot:</span>
                  <span className="val">{appt.appointmentTime}</span>
                </div>
                <div className="info-row">
                  <span className="label">Estimated Fee:</span>
                  <span className="val" style={{ color: "#e11d48" }}>{formatCurrency(appt.estimatedPrice)}</span>
                </div>
                {appt.symptoms && (
                  <div className="info-row">
                    <span className="label">Notes:</span>
                    <span className="val" style={{ fontSize: "12.5px", color: "#64748b" }}>{appt.symptoms}</span>
                  </div>
                )}
              </div>

              <div className="card-footer-actions">
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>MinMiu Veterinary Clinic</span>
                {appt.status !== "completed" && appt.status !== "cancelled" && (
                  <button className="btn-cancel-appt" onClick={() => handleCancel(appt.id)}>
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
