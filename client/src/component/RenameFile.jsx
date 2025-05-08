import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../styles/componentStyle/RenameFile.css";

const RenameFile = ({ file, onRename, onCancel }) => {
  const originalName = file.name || file.title || file.entityName;
  const [editedName, setEditedName] = useState(
    originalName.includes(".")
      ? originalName.substring(0, originalName.lastIndexOf("."))
      : originalName
  );
  const inputRef = useRef(null);

  // Focus and select when mounted
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleSubmit = () => {
    const trimmedName = editedName.trim();
    if (trimmedName && trimmedName !== originalName) {
      // Preserve extension if exists
      const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf("."))
        : "";

      onRename(trimmedName + extension);
    } else {
      onCancel();
    }
  };

  return (
    <div className="rename-container">
      <input
        ref={inputRef}
        type="text"
        value={editedName}
        onChange={handleChange}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="rename-input"
      />
      {originalName.includes(".") && (
        <span className="extension-preview">
          {originalName.substring(originalName.lastIndexOf("."))}
        </span>
      )}
    </div>
  );
};

RenameFile.propTypes = {
  file: PropTypes.object.isRequired,
  onRename: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default RenameFile;
