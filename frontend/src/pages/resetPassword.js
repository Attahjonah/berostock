import React, { useState } from "react";
import { AuthAPI } from "../api";
import { useNavigate } from "react-router-dom";
import "../pages/resetPassword.css"; // Import CSS

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await AuthAPI.post("/auth/reset-password", formData);

      const loginRes = await AuthAPI.post("/auth/login", {
        email: formData.email,
        password: formData.new_password,
      });

      localStorage.setItem("token", loginRes.data.accessToken);
      localStorage.setItem("refreshToken", loginRes.data.refreshToken);

      setMessage("Password reset successful! Redirecting...");
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-form" onSubmit={handleSubmit}>
        <div className="logo-container">
          <img
            src="https://res.cloudinary.com/dfcbhd3oo/image/upload/v1748471990/benyrose_logo_ro38vw.jpg"
            alt="Logo"
            className="logo-img"
          />
        </div>

        <h2>Reset Your Password</h2>

        {message && <p className="message">{message}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="code"
          placeholder="Reset Code"
          required
          value={formData.code}
          onChange={handleChange}
        />

        <div className="password-group">
          <input
            type={showPassword ? "text" : "password"}
            name="new_password"
            placeholder="New Password"
            required
            value={formData.new_password}
            onChange={handleChange}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          name="confirm_new_password"
          placeholder="Confirm Password"
          required
          value={formData.confirm_new_password}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
