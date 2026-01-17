import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginModal.css";

export default function LoginModal({ open, onClose, onSignUp, onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phoneNumber: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    // khoá scroll khi mở modal
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const phoneNumber = form.phoneNumber.replace(/\s/g, "");

      const response = await fetch("http://localhost:8081/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber, // ✅ giữ dạng string
          password: form.password,
        }),
      });

      const data = await response.json();

      if (data.EC === 0) {
        localStorage.setItem("user", JSON.stringify(data.DT));

        // ✅ JWT token thật từ backend
        localStorage.setItem("token", data.DT.accessToken);

        alert("Login successful!");

        if (data.DT.role === "manager") {
          onClose?.();
          navigate("/manager/allorder");
        } else {
          onLoginSuccess?.(data.DT);
          onClose?.();
        }

        setForm({ phoneNumber: "", password: "", remember: false });
      } else {
        setError(data.EM || "Login failed!");
      }
    } catch (err) {
      setError("Connection error!");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modalClose" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="modalTitle">
          Log in to <span className="brand">MinMiu</span>
        </h2>
        <p className="modalSubtitle">Enter your details below</p>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <form className="modalForm" onSubmit={onSubmit}>
          <label className="field">
            <span>Phone Number</span>
            <input
              type="text"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onChange}
              // placeholder="Enter your phone number"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="row">
            <label className="remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="linkBtn"
              onClick={() => alert("Forgot password (demo)!")}
            >
              Forgot password ?
            </button>
          </div>

          <button className="primaryBtn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="bottomRow">
            <span>Don’t have an account ?</span>
            <button
              type="button"
              className="linkBtn"
              onClick={() => onSignUp?.()}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
