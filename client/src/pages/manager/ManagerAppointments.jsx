import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faPaw,
  faUser,
  faSearch,
  faStethoscope,
} from "@fortawesome/free-solid-svg-icons";
import socket from "../../services/socket.js";
import "./ManagerAppointments.css";

const API_BASE = "http://localhost:8081/api";
const FIXED_SLOTS = ["9AM-11AM", "1PM-3PM", "3PM-5PM", "5PM-7PM"];

export default function ManagerAppointments() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [scheduleData, setScheduleData] = useState({});
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule(true);
    fetchAllAppointments();
  }, [selectedDate, statusFilter]);

  // Real-Time Socket.IO: Live updates for manager schedule & appointments
  useEffect(() => {
    socket.emit("join_manager");

    const handleRealtimeAppointmentEvent = (data) => {
      console.log("⚡ [Socket.IO Manager] Real-time appointment event received:", data);
      fetchSchedule(false);
      fetchAllAppointments();
    };

    socket.on("appointment_created", handleRealtimeAppointmentEvent);
    socket.on("appointment_status_updated", handleRealtimeAppointmentEvent);
    socket.on("appointment_cancelled", handleRealtimeAppointmentEvent);
    socket.on("slot_updated", handleRealtimeAppointmentEvent);

    return () => {
      socket.off("appointment_created", handleRealtimeAppointmentEvent);
      socket.off("appointment_status_updated", handleRealtimeAppointmentEvent);
      socket.off("appointment_cancelled", handleRealtimeAppointmentEvent);
      socket.off("slot_updated", handleRealtimeAppointmentEvent);
    };
  }, [selectedDate, statusFilter]);

  const fetchSchedule = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const currentToken = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/manager/appointments/schedule?date=${selectedDate}&status=${statusFilter}`,
        {
          headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
        }
      );
      if (res.data?.errCode === 0) {
        setScheduleData(res.data.schedule || {});
      }
    } catch (err) {
      console.error("fetchSchedule error:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      const currentToken = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/manager/appointments?limit=100`, {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
      });
      if (res.data?.errCode === 0) {
        setAllAppointments(res.data.data || []);
      }
    } catch (err) {
      console.error("fetchAllAppointments error:", err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const currentToken = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/manager/appointment/${id}/status`,
        { status: newStatus },
        { headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {} }
      );
      if (res.data?.errCode === 0) {
        fetchSchedule(false);
        fetchAllAppointments();
      } else {
        alert(res.data?.errMessage || "Cannot update status");
      }
    } catch (err) {
      alert("Connection error: " + err.message);
    }
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

  const filteredAllList = allAppointments.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.customerName?.toLowerCase().includes(term) ||
      app.phoneNumber?.includes(term) ||
      app.petName?.toLowerCase().includes(term) ||
      app.serviceType?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="manager-appt-page">
      {/* Header */}
      <div className="appt-page-header">
        <h2>
          <FontAwesomeIcon icon={faStethoscope} style={{ color: "#ff7e5f" }} />
          Veterinary Clinic & Appointment Management
        </h2>

        {/* Date & Filter controls */}
        <div className="appt-controls">
          <button
            className={`btn-date-quick ${
              selectedDate === new Date().toISOString().split("T")[0] ? "active" : ""
            }`}
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          >
            Today
          </button>
          <button
            className={`btn-date-quick ${
              selectedDate === new Date(Date.now() + 86400000).toISOString().split("T")[0] ? "active" : ""
            }`}
            onClick={() => setSelectedDate(new Date(Date.now() + 86400000).toISOString().split("T")[0])}
          >
            Tomorrow
          </button>

          <div className="date-picker-wrap">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: "#ff7e5f" }} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <select
            className="date-picker-wrap"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px" }}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed / Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* 4 Slots in Day */}
      <div className="slots-schedule-container">
        {FIXED_SLOTS.map((slot) => {
          const list = scheduleData[slot] || [];

          return (
            <div key={slot} className="schedule-slot-card">
              <div className="slot-card-header">
                <h3>
                  <FontAwesomeIcon icon={faClock} /> {slot}
                </h3>
                <span className="slot-count-badge">{list.length} appointment{list.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="slot-card-body">
                {list.length === 0 ? (
                  <div className="slot-empty-state">
                    <div className="empty-icon">🕒</div>
                    <div>No bookings in this time slot</div>
                  </div>
                ) : (
                  list.map((appt) => (
                    <div key={appt.id} className="appointment-item-card">
                      <div className="appt-service-banner">
                        <span className="service-tag">{appt.serviceType}</span>
                        {getStatusBadge(appt.status)}
                      </div>

                      <div className="appt-details-row">
                        <div className="customer-name">
                          <FontAwesomeIcon icon={faUser} style={{ marginRight: 6, color: "#94a3b8" }} />
                          {appt.customerName} - <strong>{appt.phoneNumber}</strong>
                        </div>
                        <div className="pet-info">
                          <FontAwesomeIcon icon={faPaw} style={{ marginRight: 6, color: "#ff7e5f" }} />
                          {appt.petName} ({appt.petType} {appt.petBreed ? `- ${appt.petBreed}` : ""} {appt.petWeight ? `| ${appt.petWeight}` : ""})
                        </div>
                        {appt.symptoms && (
                          <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                            Note: {appt.symptoms}
                          </div>
                        )}
                        <div className="price-val">
                          Est. Fee: {formatCurrency(appt.estimatedPrice)}
                        </div>
                      </div>

                      {/* Action buttons */}
                      {appt.status !== "completed" && appt.status !== "cancelled" && (
                        <div className="appt-actions-row">
                          <button
                            className="btn-appt-action complete"
                            onClick={() => handleUpdateStatus(appt.id, "completed")}
                          >
                            <FontAwesomeIcon icon={faCheckCircle} /> Complete
                          </button>
                          <button
                            className="btn-appt-action cancel"
                            onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                          >
                            <FontAwesomeIcon icon={faTimesCircle} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table view of all appointments */}
      <div className="all-appts-table-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3>📋 All Appointments List</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div className="date-picker-wrap" style={{ width: "260px" }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search customer, phone, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="appt-table">
            <thead>
              <tr>
                <th>Code #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Pet</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Estimated Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllList.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                    No matching appointments found
                  </td>
                </tr>
              ) : (
                filteredAllList.map((app) => (
                  <tr key={app.id}>
                    <td><strong>#MM-{app.id}</strong></td>
                    <td>{app.customerName}</td>
                    <td>{app.phoneNumber}</td>
                    <td>
                      {app.petName} ({app.petType})
                    </td>
                    <td>
                      <span className="service-tag">{app.serviceType}</span>
                    </td>
                    <td>{app.appointmentDate}</td>
                    <td>
                      <strong>{app.appointmentTime}</strong>
                    </td>
                    <td style={{ color: "#e11d48", fontWeight: 700 }}>
                      {formatCurrency(app.estimatedPrice)}
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      {app.status !== "completed" && app.status !== "cancelled" ? (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="btn-appt-action complete"
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            onClick={() => handleUpdateStatus(app.id, "completed")}
                          >
                            Complete
                          </button>
                          <button
                            className="btn-appt-action cancel"
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            onClick={() => handleUpdateStatus(app.id, "cancelled")}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
