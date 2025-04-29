import React from "react";
import "../../styles/ButtomNavigationStyle/DeleteAccountModal.css";

function DeleteAccountModal({ onClose }) {
  return (
    <div className="delete-area">
      <div className="delete">
        <div className="delete-heading">
          <h1>Delete Account</h1>
        </div>
        <div className="delete-para">
          <p>Do you want to delete your account?</p>
        </div>
        <div className="delete-buttons">
          <button className="delete-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-confirm" onClick={onClose}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
