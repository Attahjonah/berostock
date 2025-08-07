import React, { useState } from "react";
//import { format } from "date-fns";
import "./reports.css";
import { API } from "../api";

const Reports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDownload = async (type) => {
    try {
      const response = await API.get(`/report/${type}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url);
    } catch (error) {
      alert(`Failed to fetch ${type} summary`);
    }
  };

  const handleCustomDownload = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      const response = await API.get(`/report/custom`, {
        params: { start: startDate, end: endDate },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url);
    } catch (error) {
      alert("Failed to fetch custom summary");
    }
  };

  return (
    <div className="report-page">
      <h2>Sales Report Summary</h2>

      <div className="report-buttons">
        <button onClick={() => handleDownload("daily")}>📅 Daily Report</button>
        <button onClick={() => handleDownload("weekly")}>🗓️ Weekly Report</button>
        <button onClick={() => handleDownload("monthly")}>📆 Monthly Report</button>
        <button onClick={() => handleDownload("yearly")}>📈 Yearly Report</button>
      </div>

      <hr style={{ margin: "2rem 0" }} />

      <div className="custom-report">
        <h3>📊 Custom Date Range Report</h3>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button onClick={handleCustomDownload}>Generate Custom Report</button>
      </div>
    </div>
  );
};

export default Reports;
