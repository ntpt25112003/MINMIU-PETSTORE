import React, { useEffect, useState } from "react";
import "./SignupModal.css";

export default function SignupModal({ open, onClose, onGoLogin }) {
  const [form, setForm] = useState({
    userName: "",
    phoneNumber: "",
    password: "",
    agree: false,
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
    if (!form.agree) {
      setError("Please agree to the Terms and Conditions.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Remove spaces from phone number and convert to number
      const phoneNumber = form.phoneNumber.replace(/\s/g, "");
      
      const response = await fetch("http://localhost:8081/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: form.userName,
          phoneNumber: parseInt(phoneNumber),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (data.EC === 0) {
        // Sign up successful
        alert("Account created successfully! Please log in.");
        onClose?.();
        setForm({ userName: "", phoneNumber: "", password: "", agree: false });
        if (onGoLogin) {
          onGoLogin();
        }
      } else {
        setError(data.EM || "Sign up failed!");
      }
    } catch (err) {
      setError("Connection error!");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suOverlay" onMouseDown={onClose}>
      <div className="suCard" onMouseDown={(e) => e.stopPropagation()}>
        <button className="suClose" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="suTitle">Create an account</h2>
        <p className="suSubtitle">Enter your details below</p>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <form className="suForm" onSubmit={onSubmit}>
          <label className="suField">
            <span>User Name</span>
            <input
              type="text"
              name="userName"
              value={form.userName}
              onChange={onChange}
              // placeholder="Enter your user name"
              required
            />
          </label>

          <label className="suField">
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

          <label className="suField">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="suAgree">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={onChange}
            />
            <span>
              I agree to the{" "}
              <a
                className="suLink"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Terms & Conditions (demo)");
                }}
              >
                Term and Conditions
              </a>
            </span>
          </label>

          <button className="suBtn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="suBottom">
            <span>Already have an account ?</span>
            <button type="button" className="suLinkBtn" onClick={onGoLogin} >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
