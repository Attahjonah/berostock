import React from "react";

const Dashboard = () => {
  // Dummy data (replace with real API calls later)
  const user = JSON.parse(localStorage.getItem("user")) || { firstName: "User", role: "staff" };

  const stats = [
    { label: "Total Products", value: 120, color: "#2563eb" },
    { label: "Total Sales", value: 45, color: "#059669" },
    { label: "Total Clients", value: 35, color: "#d97706" },
    { label: "Low Stock Items", value: 4, color: "#dc2626" },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Welcome, {user.firstName}! 👋</h2>
      <p style={styles.subheading}>Role: <strong>{user.role}</strong></p>

      <div style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <div key={index} style={{ ...styles.card, background: stat.color }}>
            <h3 style={styles.statValue}>{stat.value}</h3>
            <p style={styles.statLabel}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  subheading: {
    marginBottom: "2rem",
    color: "#4b5563",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    color: "#fff",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "1rem",
    opacity: 0.9,
  },
};

export default Dashboard;
