// RecentFilesList.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  deleteActionFunction,
  favouriteActionFunction,
} from "../context/ActionFunction";
import FileViewerModal from "./FileViewerModal";
import FileItem from "../component/FileItem";
import "../styles/RecentFile.css";

const RecentFilesList = () => {
  const { recentData, searchResults, clearSearch } = useAuth();
  const [files, setFiles] = useState([]);
  const [actionData, setActionData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const navigate = useNavigate();
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const location = useLocation();

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
  }, [recentData]);

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

  const handleActionClick = (entityId, entityType, storedId, actionType) => {
    setActiveMenuId(null); // Close the menu

    // Set action data that will be processed in useEffect
    setActionData({ entityId, entityType, storedId, actionType });
  };

  // This useEffect handles the actual actions
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

  const handleFileOpen = async (file) => {
    try {
      trackFileAccess(file._id);
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
          navigate(`/folder/${file.entityId}`);
          break;
        default:
          downloadFile(file);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const trackFileAccess = (fileId) => {
    console.log("Tracked file access:", fileId);
  };

  const downloadFile = async (file) => {
    console.log("Downloading file:", file.entityName);
  };

  return (
    <div className="recent-files-container">
      <h1 className="recent-header">Recent</h1>
      {searchResults && searchResults.length > 0
        ? searchResults.map((file) => (
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
          ))
        : files.map((file) => (
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
