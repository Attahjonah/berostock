// components/SessionExpiredModal.js
import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const SessionExpiredModal = ({ sessionExpired, onAcknowledge }) => {
  return (
    <Modal
      isOpen={sessionExpired}
      onRequestClose={onAcknowledge}
      contentLabel="Session Expired"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          padding: "2rem",
          textAlign: "center",
          borderRadius: "8px",
        },
      }}
    >
      <h2>Session Expired</h2>
      <p>Your session has expired. Please log in again.</p>
      <button
        onClick={onAcknowledge}
        style={{
          padding: "10px 20px",
          marginTop: "1rem",
          borderRadius: "4px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </Modal>
  );
};

export default SessionExpiredModal;
