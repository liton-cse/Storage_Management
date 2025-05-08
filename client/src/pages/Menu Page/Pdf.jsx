import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  copyActionFunction,
  deleteActionFunction,
  favouriteActionFunction,
  renameActionFunction,
} from "../../context/ActionFunction";
import { getPdfFunction } from "../../context/MenuFunction";
import FileItem from "../../component/FileItem";
import FileViewerModal from "../../components/FileViewerModal";
import "../../styles/menuStyle/Pdf.css";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { createFolderFunction, uploadFile } from "../../context/MenuFunction";
import RenameFile from "../../component/RenameFile";
import ShareModal from "../../component/ShareModal";
function PdfFile() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const { searchResults, clearSearch } = useAuth();
  const [pdfs, setPdfs] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionData, setActionData] = useState(null);
  const [clickTimeout, setClickTimeout] = useState(null);
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const location = useLocation();
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
        const apiCall = getPdfFunction();
        const response = await apiCall;
        if (response.success) {
          setPdfs(response.message);
        } else {
          setError("Failed to load folder contents");
        }
      } catch (error) {
        console.error("Error fetching folder contents:", error);
        setError("Error loading folder contents");
      } finally {
        setLoading(false);
        setRefreshTrigger(false);
      }
    };

    fetchFolderContents();
  }, [refreshTrigger]);

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

      setPdfs(
        pdfs.map((f) =>
          f._id === renamingFile.entityId ? response.message : f
        )
      );
      setRenamingFile(null); // Close the rename input
      setRefreshTrigger(true);
    } catch (error) {
      console.error("Rename failed:", error);
    }
  };

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
            setPdfs((prevFiles) =>
              prevFiles.filter(
                (file) =>
                  file._id !== actionData.storedId && // remove the folder itself
                  file.folder !== actionData.storedId // remove files with this folderId
              )
            );
          } else {
            // For non-folder entities, just remove the matching ID
            setPdfs((prevFiles) =>
              prevFiles.filter((file) => file._id !== actionData.storedId)
            );
          }
        } else if (actionData.actionType === "favorite") {
          await favouriteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          setPdfs((prevFiles) =>
            prevFiles.map((file) =>
              file._id === actionData.storedId
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
          setPdfs((prevFiles) => [result, ...prevFiles]);
          setRefreshTrigger(true);
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
  const handleFileDoubleClick = async (file) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    try {
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
      <div className="pdf-container">
        <div className="loading-state">Loading Pdfs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-container">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  //Handling a file Uploading
  const handleCreateFolder = async (folderName) => {
    try {
      const response = await createFolderFunction(folderName);
      if (response.success) {
        setRefreshTrigger((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateNote = async () => {};

  const handleFileUpload = async (files) => {
    try {
      // 1. Create FormData object
      const formData = new FormData();

      // 2. Append each file to FormData
      Array.from(files).forEach((file) => {
        formData.append("files", file); // 'files' should match your backend expectation
      });
      const response = await uploadFile(formData);
      if (response.success) {
        setRefreshTrigger((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="pdf-container">
      <div className="pdf">
        <div className="pdf-header">
          <h1>PDF</h1>
        </div>
        {/* Render ShareModal once outside the map */}
        {selectedItem && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            entityType={selectedItem.entityType}
            entityId={selectedItem.id}
          />
        )}

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="files-grid">
            {searchResults.map((file) =>
              renamingFile?.storedId === file?._id ? (
                <RenameFile
                  key={file?._id}
                  file={file}
                  onRename={handleRename}
                  onCancel={() => setRenamingFile(null)}
                />
              ) : (
                <FileItem
                  key={file?._id}
                  file={file}
                  onClick={handleFileClick}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  onActionClick={handleActionClick}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  menuRefs={menuRefs}
                  buttonRefs={buttonRefs}
                />
              )
            )}
          </div>
        )}
        {/* Normal Contents */}
        {(!searchResults || searchResults?.length === 0) &&
          (pdfs?.length === 0 ? (
            <div className="empty-state">This folder is empty</div>
          ) : (
            <div className="files-grid">
              {pdfs?.map(
                (file) =>
                  file &&
                  file._id &&
                  (renamingFile?.storedId === file._id ? (
                    <RenameFile
                      key={file?._id}
                      file={file}
                      onRename={handleRename}
                      onCancel={() => setRenamingFile(null)}
                    />
                  ) : (
                    <FileItem
                      key={file?._id}
                      file={file}
                      onClick={handleFileClick}
                      onDoubleClick={() => handleFileDoubleClick(file)}
                      onActionClick={handleActionClick}
                      activeMenuId={activeMenuId}
                      setActiveMenuId={setActiveMenuId}
                      menuRefs={menuRefs}
                      buttonRefs={buttonRefs}
                    />
                  ))
              )}
            </div>
          ))}

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
          <Button
            onFolderCreate={handleCreateFolder}
            onNoteCreate={handleCreateNote}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
}

export default PdfFile;
