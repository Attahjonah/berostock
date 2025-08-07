import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="sidebar">
        {/* TOP SECTION: Logo + Nav */}
        <div className="top-section">
          <div className="logo-container">
            <img
              src="https://res.cloudinary.com/dfcbhd3oo/image/upload/v1748471990/benyrose_logo_ro38vw.jpg"
              alt="BeRoStock Logo"
              className="logo-image"
            />
            <span className="logo-text">BeRoStock</span>
          </div>

          <nav>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Products
            </NavLink>
            <NavLink
              to="/sales"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Sales
            </NavLink>
            <NavLink
              to="/clients"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Clients
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Reports
            </NavLink>
          </nav>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: "220px", padding: "2rem", width: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
