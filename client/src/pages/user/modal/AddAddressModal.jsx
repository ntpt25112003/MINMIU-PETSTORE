import React, { useEffect, useState } from "react";
import "./AddAddressModal.css";
import axios from "axios";

const API_URL = "http://localhost:8081/api";

export default function AddAddressModal({
  open,
  onClose,
  onSave,
  mode = "add",
  address = null,
}) {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && address) {
      setForm({
        fullName: address.fullName || "",
        phoneNumber: address.phoneNumber || "",
        address: address.address || "",
      });
    } else {
      setForm({ fullName: "", phoneNumber: "", address: "" });
    }
  }, [open, mode, address]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.fullName || !form.phoneNumber || !form.address) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        address: form.address,
      };

      const url =
        mode === "edit"
          ? `${API_URL}/user/shipping-address/${address.id}`
          : `${API_URL}/user/shipping-address`;

      const method = mode === "edit" ? "put" : "post";

      const res = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.EC === 0) {
        const savedAddress = res.data.DT; // <-- address mới/đã update từ backend

        // QUAN TRỌNG: trả data về parent để UI update ngay
        onSave?.(savedAddress);

        // optional: bạn có thể đóng ở đây, hoặc để parent đóng
        onClose?.();
      } else {
        alert(res.data.EM || "Failed");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert(error.response?.data?.EM || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addressModalOverlay" onMouseDown={onClose}>
      <div className="addressModalCard" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="addressModalTitle">
          {mode === "edit" ? "Edit Address" : "Add New Address"}
        </h2>

        <form className="addressModalForm" onSubmit={handleSubmit}>
          <div className="formRow">
            <div className="field flex-1">
              <span>FullName</span>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                required
              />
            </div>
            <div className="field flex-1">
              <span>Phone Number</span>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <span>Address</span>
            <textarea
              name="address"
              rows="5"
              value={form.address}
              onChange={onChange}
              required
            />
          </div>

          <div className="addressModalActions">
            <button
              type="button"
              className="cancelBtn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="saveBtn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
