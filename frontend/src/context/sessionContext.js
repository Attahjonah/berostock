// context/sessionContext.js
import React, { createContext, useEffect, useState } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const expired = localStorage.getItem("sessionExpired");
    if (expired === "true") {
      setSessionExpired(true);
    }
  }, []);

  const handleSessionReset = () => {
    setSessionExpired(false);
    localStorage.removeItem("sessionExpired");
    window.location.href = "/"; // Redirect to login
  };

  return (
    <SessionContext.Provider value={{ sessionExpired, handleSessionReset }}>
      {children}
    </SessionContext.Provider>
  );
};
