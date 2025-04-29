import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiFolder, FiFile, FiEdit2, FiUpload } from "react-icons/fi";
import "../styles/Button.css";

const Button = ({
  onFolderCreate,
  //   onFileCreate,
  onNoteCreate,
  onFileUpload,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFileUpload(e.target.files);
      setIsOpen(false);
    }
  };

  return (
    <div className="plus-btn" ref={buttonRef}>
      {/* Floating Action Button */}
      <button
        className="plus-btn__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Create or upload"
      >
        <FiPlus size={24} />
      </button>

      {/* Menu (appears above button when open) */}
      <div className={`plus-btn__menu ${isOpen ? "plus-btn__menu--open" : ""}`}>
        <button
          className="plus-btn__item plus-btn__item--folder"
          onClick={() => {
            onFolderCreate();
            setIsOpen(false);
          }}
        >
          <FiFolder className="plus-btn__icon" />
          <span>Folder</span>
        </button>
        {/* <button
          className="plus-btn__item plus-btn__item--file"
          onClick={() => {
            onFileCreate();
            setIsOpen(false);
          }}
        >
          <FiFile className="plus-btn__icon" />
          <span>File</span>
        </button> */}
        <button
          className="plus-btn__item plus-btn__item--note"
          onClick={() => {
            onNoteCreate();
            setIsOpen(false);
          }}
        >
          <FiEdit2 className="plus-btn__icon" />
          <span>Note</span>
        </button>
        <button
          className="plus-btn__item plus-btn__item--upload"
          onClick={handleUploadClick}
        >
          <FiUpload className="plus-btn__icon" />
          <span>Upload</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="plus-btn__file-input"
        multiple
      />
    </div>
  );
};

export default Button;
