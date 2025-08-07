import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api";
import "./forgotPassword.css";

// Use this if you're importing a local image
// import logo from "../assets/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await AuthAPI.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setMessage(res.data.message || "If this email exists, a reset link has been sent.");
      setTimeout(() => navigate("/reset-password"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">

        {/* Logo at the top */}
        <div className="logo-container">
          <img
            src="https://res.cloudinary.com/dfcbhd3oo/image/upload/v1748471990/benyrose_logo_ro38vw.jpg"
            alt="Logo"
            className="logo-img"
          />
        </div>

        <h2 className="forgot-password-title">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
