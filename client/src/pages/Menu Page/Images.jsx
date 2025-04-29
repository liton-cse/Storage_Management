import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteActionFunction,
  favouriteActionFunction,
} from "../../context/ActionFunction";
import { getImagesFunction } from "../../context/MenuFunction";
import FileItem from "../../component/FileItem";
import FileViewerModal from "../../components/FileViewerModal";
import "../../styles/menuStyle/Images.css";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
function ImagesFile() {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionData, setActionData] = useState(null);
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const { searchResults, clearSearch } = useAuth();
  const location = useLocation();

  //clean the searching data..
  useEffect(() => {
    clearSearch();
  }, [location.pathname, clearSearch]);

  // Fetch folder contents
  useEffect(() => {
    const fetchFolderContents = async () => {
      try {
        setLoading(true);
        // Conditionally choose which API to call
        const apiCall = getImagesFunction();
        const response = await apiCall;
        if (response.success) {
          setImages(response.message);
        } else {
          setError("Failed to load folder contents");
        }
      } catch (error) {
        console.error("Error fetching folder contents:", error);
        setError("Error loading folder contents");
      } finally {
        setLoading(false);
      }
    };

    fetchFolderContents();
  }, []);

  // Handle click outside menu
  useEffect(() => {
    const handleGlobalClick = (event) => {
      const clickedOutside =
        Object.values(menuRefs.current).every(
          (menuRef) => !menuRef?.contains(event.target)
        ) &&
        Object.values(buttonRefs.current).every(
          (buttonRef) => !buttonRef?.contains(event.target)
        );

      if (clickedOutside) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  // Process actions (delete, favorite, etc.)
  useEffect(() => {
    if (!actionData) return;

    const handleAction = async () => {
      try {
        if (actionData.actionType === "delete") {
          // First delete the entity itself
          await deleteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );

          if (actionData.entityType === "folder") {
            // If deleting a folder, also remove all files that belong to this folder
            console.log(actionData.entityType);
            setImages((prevFiles) =>
              prevFiles.filter(
                (file) =>
                  file._id !== actionData.storedId && // remove the folder itself
                  file.folder !== actionData.storedId // remove files with this folderId
              )
            );
          } else {
            // For non-folder entities, just remove the matching ID
            setImages((prevFiles) =>
              prevFiles.filter((file) => file._id !== actionData.storedId)
            );
          }
        } else if (actionData.actionType === "favorite") {
          await favouriteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          setImages((prevFiles) =>
            prevFiles.map((file) =>
              file._id === actionData.storedId
                ? { ...file, isFavorite: !file.isFavorite }
                : file
            )
          );
        }
      } catch (error) {
        console.error(`${actionData.actionType} action failed:`, error);
        setError(`Failed to ${actionData.actionType} file`);
      } finally {
        setActionData(null);
      }
    };

    handleAction();
  }, [actionData]);

  // Handle file opening
  const handleFileOpen = async (file) => {
    try {
      switch (file.entityType) {
        case "pdf":
        case "image":
          setCurrentFile(file);
          setIsViewerOpen(true);
          break;
        case "note":
          navigate(`/notes/${file._id}`);
          break;
        case "folder":
          navigate(`/folder/${file._id}`);
          break;
        default:
          downloadFile(file);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      setError("Failed to open file");
    }
  };

  // Handle file actions
  const handleActionClick = (entityId, entityType, storedId, actionType) => {
    setActiveMenuId(null);
    setActionData({ entityId, entityType, storedId, actionType });
  };

  // Handle file download
  const downloadFile = async (file) => {
    try {
      console.log("Downloading file:", file.entityName);
      // Implement actual download logic
      // window.open(`/api/files/download/${file._id}`, '_blank');
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="images-container">
        <div className="loading-state">Loading Images...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="images-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }
  return (
    <div className="images-container">
      <div className="images">
        <div className="images-header">
          <h1>Images</h1>
        </div>
        {searchResults && searchResults.length > 0 ? (
          <div className="files-grid">
            {searchResults.map((file) => (
              <FileItem
                key={file._id}
                file={file}
                onFileClick={handleFileOpen}
                onActionClick={handleActionClick}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                menuRefs={menuRefs}
                buttonRefs={buttonRefs}
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="empty-state">This Pdf File is empty</div>
        ) : (
          <div className="files-grid">
            {images.map((file) => (
              <FileItem
                key={file._id}
                file={file}
                onFileClick={handleFileOpen}
                onActionClick={handleActionClick}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                menuRefs={menuRefs}
                buttonRefs={buttonRefs}
              />
            ))}
          </div>
        )}
        {/* modal view */}

        {isViewerOpen && (
          <FileViewerModal
            file={currentFile}
            onClose={() => setIsViewerOpen(false)}
          />
        )}

        {/* Error toast */}
        {error && (
          <div className="error-toast" onClick={() => setError(null)}>
            {error} ×
          </div>
        )}

        <div>
          <Button />
        </div>
      </div>
    </div>
  );
}

export default ImagesFile;
