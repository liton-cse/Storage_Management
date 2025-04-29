import React from "react";
import "../styles/FileViewerModal.css";

const FileViewerModal = ({ file, onClose }) => {
  if (!file) return null;
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const renderContent = () => {
    switch (file.entityType) {
      case "pdf":
        return (
          <iframe
            src={`${baseUrl}/${file.path}`}
            title={file.entityName}
            className="pdf-viewer"
          />
        );
      case "image":
        return (
          <div className="image-viewer">
            <img src={`${baseUrl}/${file.path}`} alt={file.entityName} />
          </div>
        );
      default:
        return <div>Unsupported file type for preview</div>;
    }
  };

  return (
    <div className="file-viewer-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h3>{file.historyId ? file.name : file.entityName}</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{renderContent()}</div>
        <div className="modal-footer">
          <span className="file-date">Last accessed: {file.formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
