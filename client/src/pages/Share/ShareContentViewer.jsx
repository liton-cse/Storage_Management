// SharedContentViewer.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/ShareStyle/ShareContent.css";

import { getShareContentFunction } from "../../context/ShareFunction";

function SharedContentViewer() {
  const { entityType, id } = useParams();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await getShareContentFunction(entityType, id);
        if (entityType === "files") {
          // Handle file content
          const blob = new Blob([response.message], {
            type: response.headers["content-type"],
          });
          const url = URL.createObjectURL(blob);
          setContent({ type: "file", url });
        } else {
          // Handle notes/history
          setContent({ type: entityType, data: response.message });
        }
      } catch (err) {
        setError(err?.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [entityType, id]);

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="shared-content-area">
      {content.type === "file" ? (
        <div className="file-content-viewer">
          <img
            src={content.url}
            alt="Shared file"
            onError={() => setError("Failed to display image")}
            style={{ maxWidth: "100%", maxHeight: "80vh" }}
          />
          <div className="file-action-button">
            <button onClick={() => window.open(content.url, "_blank")}>
              Open in new tab
            </button>
          </div>
        </div>
      ) : (
        <div className="note-content-viewer">
          <h1>{content.data.title || content.data.entityName}</h1>
          <div className="note-content">
            {content.type === "notes" ? (
              <p>{content.data.description}</p>
            ) : (
              <pre>{JSON.stringify(content.data, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default SharedContentViewer;
