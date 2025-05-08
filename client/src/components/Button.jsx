import React, { useState, useRef, useEffect } from "react";
import { FiPlus, FiFolder, FiFile, FiEdit2, FiUpload } from "react-icons/fi";
import "../styles/Button.css";
import UploadModal from "../component/UploadModal";
import { useNavigate } from "react-router-dom";
const Button = ({ onFolderCreate, onNoteCreate, onFileUpload }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [folderValue, setFolderValue] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteTextArea, setNoteTextArea] = useState("");
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModalOpen = (type) => {
    setModalType(type);
    setIsMenuOpen(false);
  };

  const handleModalClose = () => {
    setModalType(null);
    setFolderValue("");
    setNoteTitle("");
    setNoteTextArea("");
    setIsMenuOpen(false);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();

    // Validate based on modal type
    if (modalType === "folder") {
      if (!folderValue.trim()) {
        console.error("Folder name cannot be empty");
        return;
      }

      onFolderCreate(folderValue);
    } else if (modalType === "note") {
      if (!noteTitle.trim() || !noteTextArea.trim()) {
        console.error("Note title and content cannot be empty");
        return;
      }
      console.log("Creating note:", {
        title: noteTitle,
        content: noteTextArea,
      });
      onNoteCreate(noteTitle, noteTextArea);
    }

    handleModalClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
    setIsMenuOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };
  const handleCreateNote = () => {
    navigate(`/notepad`);
  };

  return (
    <div className="plus-btn" ref={buttonRef}>
      {/* Floating Action Button */}
      <button
        className="plus-btn__trigger"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Create or upload"
      >
        <FiPlus size={24} />
      </button>

      {/* Menu (appears above button when open) */}
      <div
        className={`plus-btn__menu ${isMenuOpen ? "plus-btn__menu--open" : ""}`}
      >
        <button
          className="plus-btn__item plus-btn__item--folder"
          onClick={() => handleModalOpen("folder")}
        >
          <FiFolder className="plus-btn__icon" />
          <span>Folder</span>
        </button>
        <button
          className="plus-btn__item plus-btn__item--note"
          onClick={handleCreateNote}
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
        className="floating-button__file-input"
        multiple
      />

      {/* Folder Modal */}
      <UploadModal
        isOpen={modalType === "folder"}
        onClose={handleModalClose}
        title="Create New Folder"
        onSubmit={handleModalSubmit}
      >
        <input
          type="text"
          name="name"
          value={folderValue}
          onChange={(e) => setFolderValue(e.target.value)}
          placeholder="Folder name"
          className="modal-folder-input"
          autoFocus
        />
      </UploadModal>

      {/* Note Modal */}
      {/* <UploadModal
        isOpen={modalType === "note"}
        onClose={handleModalClose}
        title="Create New Note"
        onSubmit={handleModalSubmit}
      >
        <div className="modal-note-area">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Folder name"
            className="modal-note-title"
            autoFocus
          />
          <textarea
            value={noteTextArea}
            onChange={(e) => setNoteTextArea(e.target.value)}
            placeholder="Note content"
            className="modal-note-text-area"
            rows={5}
            autoFocus
          />
        </div>
      </UploadModal> */}
    </div>
  );
};

export default Button;
