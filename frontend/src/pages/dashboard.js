import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";
import "./dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalClients, setTotalClients] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);

  // ✅ Get current user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const clientRes = await API.get("/clients?page=1&limit=1");
        setTotalClients(clientRes.data.total || 0);

        const productRes = await API.get("/products?page=1&limit=1");
        setTotalProducts(productRes.data.pagination?.totalItems || 0);

        const salesRes = await API.get("/sales/summary");
        setDailySales(salesRes.data.dailyTotalSales || 0);
        setMonthlySales(salesRes.data.monthlyTotalSales || 0);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (num) =>
    "₦" + Number(num).toLocaleString("en-NG", { minimumFractionDigits: 0 });

  return (
    <div className="dashboard">
      <div className="card-container">
        <div className="card">
          <p>Total Products</p>
          <h3>{totalProducts}</h3>
        </div>
        <div className="card">
          <p>Total Clients</p>
          <h3>{totalClients}</h3>
        </div>
        <div className="card">
          <p>Daily Sales</p>
          <h3>{formatCurrency(dailySales)}</h3>
        </div>
        <div className="card">
          <p>Monthly Sales</p>
          <h3>{formatCurrency(monthlySales)}</h3>
        </div>
      </div>

      <div className="quick-actions">
        <div className="actions-container">
          {/* ✅ Only show this if role is admin or manager */}
          {(role === "admin" || role === "manager") && (
            <button onClick={() => navigate("/products")}>➕ Add Product</button>
          )}
          <button onClick={() => navigate("/sales/new")}>💰 Sale Product</button>
          <button onClick={() => navigate("/clients")}>👤 Add Client</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
