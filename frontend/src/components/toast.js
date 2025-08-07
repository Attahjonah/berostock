import React from "react";
import "./toast.css";

const Toast = ({ message, type }) => {
  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default Toast;
