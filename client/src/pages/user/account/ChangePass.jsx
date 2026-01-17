import React, { useState } from "react";
import axios from "axios";
import "./ChangePass.css";

const API_URL = "http://localhost:8081/api";

export default function ChangePass() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage("All fields are required!");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/user/change-password`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.EC === 0) {
        setMessage("Password changed successfully!");
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage(response.data.EM || "Failed to change password");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.response?.data?.EM || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="userPageContainer">
        <h2>Change Password</h2>
        <div className="changePassContainer">
            <form onSubmit={handleSubmit} className="changePassForm">
            <div className="formGroup">
                <label>Old password</label>
                <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter your old password"
                />
            </div>

            <div className="formGroup">
                <label>New password</label>
                <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                />
            </div>

            <div className="formGroup">
                <label>Confirm password</label>
                <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                />
            </div>

            {message && (
                <p className={message.includes("successfully") ? "successMessage" : "errorMessage"}>
                {message}
                </p>
            )}

            <button type="submit" className="saveBtn" disabled={loading}>
                {loading ? "Saving..." : "Save"}
            </button>
            </form>
        </div>
    </div>
  );
}
