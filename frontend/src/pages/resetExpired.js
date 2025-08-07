import React from "react";
import { Link } from "react-router-dom";

const ResetExpired = () => {
  return (
    <div className="max-w-md mx-auto p-6 mt-20 bg-white shadow-md rounded-md text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Reset Link Expired</h2>
      <p className="text-gray-700 mb-6">
        Your password reset link has expired or is invalid. Please try again.
      </p>
      <Link
        to="/forgot-password"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Request New Link
      </Link>
    </div>
  );
};

export default ResetExpired;
