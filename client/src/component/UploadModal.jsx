import React from "react";
import "../styles/componentStyle/UploadModal.css";

const UploadModal = ({ isOpen, onClose, title, children, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-content">{children}</div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-cancel">
              Cancel
            </button>
            <button type="submit" className="modal-submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
