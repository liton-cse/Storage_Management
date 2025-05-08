// RecentFilesList.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  copyActionFunction,
  deleteActionFunction,
  favouriteActionFunction,
  renameActionFunction,
} from "../context/ActionFunction";
import FileViewerModal from "./FileViewerModal";
import FileItem from "../component/FileItem";
import "../styles/RecentFile.css";
import RenameFile from "../component/RenameFile";
import ShareModal from "../component/ShareModal";
const RecentFilesList = ({ data }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { recentData, searchResults, clearSearch } = useAuth();
  const [files, setFiles] = useState([]);
  const [actionData, setActionData] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [clickTimeout, setClickTimeout] = useState(null);
  const [refreshPage, setRreshPage] = useState(false);
  const navigate = useNavigate();
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const location = useLocation();
  const [renamingFile, setRenamingFile] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    clearSearch();
  }, [location.pathname, clearSearch]);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const response = await recentData();
        if (response.success) {
          setFiles(response.message);
        }
      } catch (error) {
        console.log(`Recent is not found ${error}`);
      }
    };
    fetchRecentData();
    setRreshPage(false);
  }, [recentData, data, refreshPage]);

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

  //action Data are store in state...
  const handleActionClick = (
    entityId,
    entityType,
    storedId,
    file,
    actionType
  ) => {
    setActiveMenuId(null); // Close the menu
    if (actionType === "rename") {
      setRenamingFile({ entityId, entityType, storedId });
    } else if (actionType === "share") {
      if (file.historyId) {
        setSelectedItem({
          id: file._id,
          name: file.name || file.title || file.entityName,
          entityType: file.entityType,
        });
        setIsShareModalOpen(true);
      } else {
        setSelectedItem({
          id: file._id,
          name: file.entityName,
          entityType: "history",
        });
        setIsShareModalOpen(true);
      }
    } else {
      // Set action data for other actions
      setActionData({ entityId, entityType, storedId, actionType });
    }
  };

  const handleRename = async (newName) => {
    if (!renamingFile) return;

    try {
      const response = await renameActionFunction(
        renamingFile.entityType,
        renamingFile.entityId,
        renamingFile.storedId,
        newName
      );

      setFiles(
        files.map((f) =>
          f._id === renamingFile.entityId ? response.message : f
        )
      );
      setRenamingFile(null); // Close the rename input
      setRreshPage(true);
    } catch (error) {
      console.error("Rename failed:", error);
    }
  };

  useEffect(() => {
    if (!actionData) return;
    const handleAction = async () => {
      try {
        if (actionData.actionType === "delete") {
          await deleteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          setFiles((prevFiles) =>
            prevFiles.filter((file) => file._id !== actionData.entityId)
          );
        } else if (actionData.actionType === "favorite") {
          await favouriteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          setFiles((prevFiles) =>
            prevFiles.map((file) =>
              file._id === actionData.entityId
                ? { ...file, isFavorite: !file.isFavorite }
                : file
            )
          );
        } else if (actionData.actionType === "copy") {
          const response = await copyActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          const result = response.message;
          setFiles((prevFiles) => [result, ...prevFiles]);
          setRreshPage(true);
        }
      } catch (error) {
        console.error(`${actionData.actionType} action failed:`, error);
        // You might want to set an error state here
      } finally {
        setActionData(null); // Reset action data
      }
    };

    handleAction();
  }, [actionData]);

  const handleFileDoubleClick = async (file) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    try {
      trackFileAccess(file._id);
      switch (file.entityType) {
        case "pdf":
          // Always open PDF in new tab/window (mobile will handle with native viewer)
          window.open(`${baseUrl}/${file.path}`, "_blank");
          break;
        case "image":
          setCurrentFile(file);
          setIsViewerOpen(true);
          break;
        case "note":
          navigate(`/notes/${file.entityId}`);
          break;
        case "folder":
          navigate(`/folder/${file.entityId}`);
          break;
        default:
          downloadFile(file);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const handleFileClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }
    setClickTimeout(
      setTimeout(() => {
        // Single click actions (if any) go here
        setClickTimeout(null);
      }, 300)
    );
  };

  const trackFileAccess = (fileId) => {
    console.log("Tracked file access:", fileId);
  };

  const downloadFile = async (file) => {
    console.log("Downloading file:", file.entityName);
  };

  if (!files) {
    return (
      <div className="pdf-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="pdf-container">
        <div className="error-state">No Recent File</div>
      </div>
    );
  }

  return (
    <div className="recent-files-container">
      <h1 className="recent-header">Recent</h1>

      {/* Render ShareModal once outside the map */}
      {selectedItem && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          entityType={selectedItem.entityType}
          entityId={selectedItem.id}
        />
      )}

      {searchResults && searchResults.length > 0
        ? searchResults.map((file) =>
            renamingFile?.entityId === file._id ? (
              <RenameFile
                key={`rename-${file._id}`}
                file={file}
                onRename={handleRename}
                onCancel={() => setRenamingFile(null)}
              />
            ) : (
              <FileItem
                key={`file-${file._id}`}
                file={file}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                onActionClick={handleActionClick}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                menuRefs={menuRefs}
                buttonRefs={buttonRefs}
              />
            )
          )
        : files?.map(
            (file) =>
              file &&
              file._id &&
              (renamingFile?.entityId === file._id ? (
                <RenameFile
                  key={`rename-${file._id}`}
                  file={file}
                  onRename={handleRename}
                  onCancel={() => setRenamingFile(null)}
                />
              ) : (
                <FileItem
                  key={`file-${file._id}`}
                  file={file}
                  onClick={() => handleFileClick(file)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  onActionClick={handleActionClick}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  menuRefs={menuRefs}
                  buttonRefs={buttonRefs}
                />
              ))
          )}
      {/*  file modal viewer... */}
      {isViewerOpen && (
        <FileViewerModal
          file={currentFile}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default RecentFilesList;
