// FileItem.js
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import fileIcons from "../assets/fileIcons.json";
import { FcFolder } from "react-icons/fc";
import { FaImage } from "react-icons/fa";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import FileActionsMenu from "./FileActionsMenu";
import "../styles/componentStyle/FileItem.css";
// import "../styles/FileItem.css";

const iconComponents = {
  BsFileEarmarkPdfFill: BsFileEarmarkPdfFill,
  FaImage: FaImage,
  FcFolder: FcFolder,
  CustomNote: () => <img src="/note.png" alt="note" className="note-icon" />,
};

const FileItem = ({
  file,
  onClick,
  onDoubleClick,
  onActionClick,
  activeMenuId,
  setActiveMenuId,
  menuRefs,
  buttonRefs,
  showActions = true,
}) => {
  const [lastTap, setLastTap] = useState(0);
  const tapTimeout = useRef(null);
  const isTouchDevice = useRef(false);
  const getFileIcon = (type) => {
    const iconConfig = fileIcons[type] || fileIcons.folder;
    const IconComponent = iconComponents[iconConfig.component];
    return (
      <div className={`file-icon file-icon-${type}`}>
        <IconComponent style={{ color: iconConfig.color }} />
      </div>
    );
  };

  const getMenuStyle = (fileId) => {
    if (!menuRefs.current[fileId]) return {};
    const menuElement = menuRefs.current[fileId];
    const buttonElement = buttonRefs.current[fileId];
    if (!menuElement || !buttonElement) return {};

    const menuRect = menuElement.getBoundingClientRect();
    const buttonRect = buttonElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (buttonRect.bottom + menuRect.height > windowHeight) {
      return { bottom: "100%", top: "auto", marginBottom: "4px" };
    }
    return {};
  };

  const toggleMenu = (fileId, event) => {
    event.stopPropagation();
    setActiveMenuId(activeMenuId === fileId ? null : fileId);
  };
  // Detect touch device on component mount
  useEffect(() => {
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleInteraction = (e) => {
    if (isTouchDevice.current) {
      handleTouch(e);
    } else {
      handleClick(e);
    }
  };

  const handleTouch = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    if (tapLength < 300 && tapLength > 0) {
      // Double tap
      e.preventDefault();
      onDoubleClick && onDoubleClick();
      setLastTap(0);
    } else {
      // Single tap
      setLastTap(currentTime);
      tapTimeout.current = setTimeout(() => {
        onClick && onClick();
        setLastTap(0);
      }, 300);
    }
  };

  const handleClick = () => {
    // For non-touch devices, just handle single click
    onClick && onClick();
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
    };
  }, []);

  return (
    <div
      className="file-item"
      onClick={handleInteraction}
      onDoubleClick={!isTouchDevice.current ? onDoubleClick : undefined}
    >
      <div className="file-info">
        {getFileIcon(file?.entityType)}
        <div className="file-meta">
          {/* {file.entityType === "folder" && (
            <span className="file-name">{file.name}</span>
          )} */}
          <span
            className="file-name"
            title={
              file?.historyId ? file?.name || file?.title : file?.entityName
            }
          >
            {file?.historyId ? file?.name || file?.title : file?.entityName}
          </span>
          <span className="file-date">{file?.formattedDate}</span>
        </div>
      </div>

      {showActions && (
        <div className="file-actions" onClick={(e) => e.stopPropagation()}>
          <button
            ref={(el) => (buttonRefs.current[file?._id] = el)}
            className="action-button"
            onClick={(e) => toggleMenu(file?._id, e)}
            aria-label="File actions"
          >
            ⋮
          </button>

          {activeMenuId === file._id && (
            <FileActionsMenu
              file={file}
              onActionClick={onActionClick}
              menuStyle={getMenuStyle(file._id)}
              menuRef={(el) => (menuRefs.current[file._id] = el)}
            />
          )}
        </div>
      )}
    </div>
  );
};

FileItem.propTypes = {
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    entityName: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    isFavorite: PropTypes.bool,
    // Add other file properties as needed
  }).isRequired,
  onFileClick: PropTypes.func.isRequired,
  onActionClick: PropTypes.func,
  activeMenuId: PropTypes.string,
  setActiveMenuId: PropTypes.func,
  menuRefs: PropTypes.object,
  buttonRefs: PropTypes.object,
  showActions: PropTypes.bool,
};

FileItem.defaultProps = {
  onActionClick: () => {},
  menuRefs: { current: {} },
  buttonRefs: { current: {} },
  showActions: true,
};

export default FileItem;
