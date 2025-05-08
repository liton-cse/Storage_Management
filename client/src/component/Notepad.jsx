import React, { useState, useEffect } from "react";
import "../styles/componentStyle/Notepad.css";
import { useNavigate, useParams } from "react-router-dom";
import { createNote, getNoteById, updateNote } from "../context/MenuFunction";
function NotePad() {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch note data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchNote = async () => {
        try {
          const note = await getNoteById(id);
          if (note.success) {
            const data = note.message[0];
            setNoteTitle(data.title);
            setNoteContent(data.description);
          }
        } catch (error) {
          console.error("Failed to fetch note:", error);
        }
      };
      fetchNote();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Update existing note
        await updateNote(id, noteTitle, noteContent);
      } else {
        // Create new note
        await createNote(noteTitle, noteContent);
      }
      navigate("/notes"); // Redirect to notes list after save
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div className="notepad-area">
      <div className="notepad">
        <form onSubmit={handleSubmit}>
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
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Note content"
              className="modal-note-text-area"
              rows={5}
              autoFocus
            />
          </div>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default NotePad;
