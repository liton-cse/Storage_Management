import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../styles/ShareStyle/ShareContent.css";
import { getShareContentFunction } from "../../context/ShareFunction";

const SharedContentViewer = () => {
  const { entityType, id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || "";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getShareContentFunction(entityType, id);
        setContent(response.message);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [entityType, id]);

  if (loading) return <div className="share-loading-spinner">Loading...</div>;
  if (error) return <div className="share-error-message">{error}</div>;
  if (!content) return <div className="share-no-content">No content available</div>;

  const fullFilePath = content?.path
    ? `${API_BASE_URL}${
        content.path.startsWith("/") ? content.path : `/${content.path}`
      }`
    : "";

  const renderContent = () => {
    switch (content.entityType) {
      case "image":
        return (
          <div className="share-image-container">
            <a
              href={fullFilePath}
              alt={content.name}
              onClick={() => setIsImageModalOpen(true)}
              className="share-clickable-image"
              onError={() => setError("Failed to load image")}
            >
              Show Image
            </a>
            {isImageModalOpen && (
              <div
                className="share-modal-overlay"
                onClick={() => setIsImageModalOpen(false)}
              >
                <div
                  className="share-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={fullFilePath}
                    alt="Preview"
                    className="share-modal-image"
                  />
                  <button
                    className="close-button"
                    onClick={() => setIsImageModalOpen(false)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "pdf":
        return (
          <div className="share-pdf-launcher">
            <a
              href={fullFilePath}
              target="_blank"
              rel="noopener noreferrer"
              className="share-open-pdf-link"
            >
              Open PDF in New Tab
            </a>
            <a
              href={fullFilePath}
              download={content.name}
              className="share-download-button"
            >
              Download PDF
            </a>
          </div>
        );
      case "note":
        return (
          <div className="share-note-notepad">
            <h2>{content.details.noteTitle || "Untitled Note"}</h2>
            <pre className="share-note-body">{content.details.noteDescription}</pre>
          </div>
        );
      default:
        return <div className="share-unsupported-type">Unsupported content type</div>;
    }
  };

  return <div className="shared-content-viewer">{renderContent()}</div>;
};

export default SharedContentViewer;
