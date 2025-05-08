import React from "react";
import "../../styles/ButtomNavigationStyle/LogoutModal.css";

function LogoutModal({ onClose, onConfirm }) {
  return (
    <div className="logout-area">
      <div className="logout">
        <div className="logout-heading">
          <h1>Logout</h1>
        </div>
        <div className="logout-para">
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="logout-buttons">
          <button className="logout-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="logout-confirm" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
