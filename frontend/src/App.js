import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import Sales from "./pages/sales";
import Reports from "./pages/reports";
import Clients from "./pages/clients";
import SaleProduct from "./pages/saleProduct";
import { setupInterceptors } from "./api";
import SessionExpiredModal from "./components/sessionExpiredModal";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import ResetExpired from "./pages/resetExpired";
import { AuthProvider } from "./context/authContext"; // ✅ Auth Context Provider

function App() {
  const [sessionExpired, setSessionExpired] = useState(false);

  // ✅ Setup interceptors
  useEffect(() => {
    setupInterceptors(setSessionExpired);
  }, []);

  // ✅ Log and handle session expiration
  useEffect(() => {
    if (sessionExpired) {
      console.log("🔁 sessionExpired:", sessionExpired);
    }
  }, [sessionExpired]);

  return (
    <AuthProvider>
      <Router>
        <SessionExpiredModal
          sessionExpired={sessionExpired}
          onAcknowledge={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-expired" element={<ResetExpired />} />
          <Route path="/sales/new" element={<Layout><SaleProduct /></Layout>} />
          <Route path="/sale/edit/:saleId" element={<Layout><SaleProduct /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/sales" element={<Layout><Sales /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
