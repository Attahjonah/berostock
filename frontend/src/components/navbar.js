import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.logoSection}>
        <img
          src="https://res.cloudinary.com/dfcbhd3oo/image/upload/v1748471990/benyrose_logo_ro38vw.jpg"
          alt="BeRoStock Logo"
          style={styles.logo}
        />
        <h2 style={styles.title}>BeRoStock</h2>
      </div>

      <ul style={styles.menu}>
        <li><Link to="/" style={linkStyle(pathname === "/")}>Login</Link></li>
        <li><Link to="/dashboard" style={linkStyle(pathname === "/dashboard")}>Dashboard</Link></li>
        <li><Link to="/products" style={linkStyle(pathname === "/products")}>Products</Link></li>
        <li><Link to="/sales" style={linkStyle(pathname === "/sales")}>Sales</Link></li>
        <li><Link to="/reports" style={linkStyle(pathname === "/reports")}>Reports</Link></li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e3a8a",
    color: "#fff",
    padding: "10px 20px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: 0,
  },
  menu: {
    display: "flex",
    gap: "20px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
};

const linkStyle = (isActive) => ({
  color: isActive ? "#facc15" : "#fff",
  textDecoration: "none",
  fontWeight: isActive ? "bold" : "normal",
});

export default Navbar;
