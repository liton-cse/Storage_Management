import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../styles/componentStyle/Folder.css";
import { getAllFileInFolder, getAllFolder } from "../../context/MenuFunction";
import {
  deleteActionFunction,
  favouriteActionFunction,
} from "../../context/ActionFunction";
import FileItem from "../../component/FileItem";
import FileViewerModal from "../../components/FileViewerModal";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
function Folder() {
  const { searchResults, clearSearch } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionData, setActionData] = useState(null);
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
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
        const apiCall = id ? getAllFileInFolder(id) : getAllFolder();
        const response = await apiCall;
        if (response.success) {
          setContents(response.message);
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
  }, [id]);

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
            setContents((prevFiles) =>
              prevFiles.filter(
                (file) =>
                  file._id !== actionData.storedId && // remove the folder itself
                  file.folder !== actionData.storedId // remove files with this folderId
              )
            );
          } else {
            // For non-folder entities, just remove the matching ID
            setContents((prevFiles) =>
              prevFiles.filter((file) => file._id !== actionData.storedId)
            );
          }
        } else if (actionData.actionType === "favorite") {
          await favouriteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          setContents((prevFiles) =>
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
      <div className="folder-container">
        <div className="loading-state">Loading folder contents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="folder-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="folder-container">
      {id ? (
        <h1 className="folder-header">Folder Contents</h1>
      ) : (
        <h1 className="folder-header">Folder</h1>
      )}
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
      ) : contents.length === 0 ? (
        <div className="empty-state">This Pdf File is empty</div>
      ) : (
        <div className="files-grid">
          {contents.map((file) => (
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
  );
}

export default Folder;
