import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const API_URL = "http://localhost:8081/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    userName: "",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : null;

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.EC === 0) {
        setUser(response.data.DT);
        setEditData({
          userName: response.data.DT.userName,
          phoneNumber: response.data.DT.phoneNumber
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setMessage("");
      setError("");

      if (!editData.userName || !editData.phoneNumber) {
        setError("All fields are required!");
        return;
      }

      const response = await axios.put(
        `${API_URL}/user/update-info`,
        {
          userName: editData.userName,
          phoneNumber: editData.phoneNumber
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.EC === 0) {
        setUser(response.data.DT);
        setIsEditing(false);
        setMessage("Information updated successfully!");
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        storedUser.userName = response.data.DT.userName;
        localStorage.setItem("user", JSON.stringify(storedUser));

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setError(response.data.EM || "Failed to update information");
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      setError(error.response?.data?.EM || "Error updating information");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage("");
    setError("");
    setEditData({
      userName: user?.userName,
      phoneNumber: user?.phoneNumber
    });
  };

  if (loading) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-page">
        <h2>Edit Information</h2>
            <div className="profile-section">
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                {!isEditing ? (
                    <div className="info-display">
                        <div className="info-row">
                            <label>Username</label>
                            <span>{user?.userName}</span>
                        </div>
                        <div className="info-row">
                            <label>Phone Number</label>
                            <span>{user?.phoneNumber}</span>
                        </div>
                        <button className="edit-btn" onClick={() => setIsEditing(true)}>
                            Edit Information
                        </button>
                    </div>
                ) : (
                    <div className="info-edit">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                            type="text"
                            name="userName"
                            value={editData.userName}
                            onChange={handleChange}
                            placeholder="Enter username"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                            type="text"
                            name="phoneNumber"
                            value={editData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            />
                        </div>
                        <div className="button-group">
                            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            <button className="save-btn" onClick={handleSave}>Save</button>
                            
                        </div>
                    </div>
                )}
            </div>
    </div>
  );
}
