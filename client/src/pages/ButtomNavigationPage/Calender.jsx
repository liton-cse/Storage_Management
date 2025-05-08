import React, { useState, useEffect, useRef } from "react";
import "../../styles/ButtomNavigationStyle/Calender.css";
import { calanderFinction } from "../../context/CalanderFunction";
import { useNavigate } from "react-router-dom";
import FileItem from "../../component/FileItem";
import FileViewerModal from "../../components/FileViewerModal";
import {
  copyActionFunction,
  deleteActionFunction,
  favouriteActionFunction,
  renameActionFunction,
} from "../../context/ActionFunction";
import Button from "../../components/Button";
import { createFolderFunction, uploadFile } from "../../context/MenuFunction";
import RenameFile from "../../component/RenameFile";
import ShareModal from "../../component/ShareModal";

const Calendar = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // Separate state for viewed month/year
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  const calendarRef = useRef(null);
  const [dropdownDate, setDropdownDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
  const [currentFile, setCurrentFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionData, setActionData] = useState(null);
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const navigate = useNavigate();
  const [renamingFile, setRenamingFile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to fetch events for the selected date
  const fetchEvents = async (date) => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual API endpoint
      const formattedDate = date.toLocaleDateString("en-CA", {
        timeZone: "Asia/Dhaka",
      });
      const response = await calanderFinction(formattedDate);
      const data = response.message;
      setEvents(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
      setRefreshTrigger(false);
    }
  };
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

      setEvents(
        events.map((f) =>
          f._id === renamingFile.entityId ? response.message : f
        )
      );
      setRenamingFile(null); // Close the rename input
      setRefreshTrigger(true);
    } catch (error) {
      console.error("Rename failed:", error);
    }
  };

  // Handle date selection
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDropdownDate(
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
    setShowCalendar(false);
    fetchEvents(date);
  };

  // Handle dropdown date change
  const handleDropdownDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      setViewDate(newDate); // Also update the view to show this month
      setDropdownDate(
        newDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
      fetchEvents(newDate);
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
            setEvents((prevFiles) =>
              prevFiles.filter(
                (file) =>
                  file._id !== actionData.storedId && // remove the folder itself
                  file.folder !== actionData.storedId // remove files with this folderId
              )
            );
          } else {
            // For non-folder entities, just remove the matching ID
            setEvents((prevFiles) =>
              prevFiles.filter((file) => file._id !== actionData.storedId)
            );
          }
        } else if (actionData.actionType === "favorite") {
          await favouriteActionFunction(
            actionData.entityType,
            actionData.entityId,
            actionData.storedId
          );
          setEvents((prevFiles) =>
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
          setEvents((prevFiles) => [result, ...prevFiles]);
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

  // Change viewed month
  const changeMonth = (increment) => {
    const newViewDate = new Date(viewDate);
    newViewDate.setMonth(newViewDate.getMonth() + increment);
    setViewDate(newViewDate);
  };

  // Change viewed year
  const changeYear = (increment) => {
    const newViewDate = new Date(viewDate);
    newViewDate.setFullYear(newViewDate.getFullYear() + increment);
    setViewDate(newViewDate);
  };

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate, refreshTrigger]);

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

  // Render the calendar grid
  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const weeks = [];
    let day = 1;
    let nextMonthDay = 1;

    for (let i = 0; i < 6; i++) {
      if (day > daysInMonth) break;
      const days = [];

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          const prevDay = daysInPrevMonth - (firstDay - j - 1);
          const date = new Date(year, month - 1, prevDay);
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          days.push(
            <td
              key={`prev-${j}`}
              className={`other-month ${isSelected ? "selected" : ""}`}
              onClick={() => handleDateClick(date)}
            >
              <div className="day-number">{prevDay}</div>
            </td>
          );
        } else if (day > daysInMonth) {
          const date = new Date(year, month + 1, nextMonthDay);
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          days.push(
            <td
              key={`next-${j}`}
              className={`other-month ${isSelected ? "selected" : ""}`}
              onClick={() => handleDateClick(date)}
            >
              <div className="day-number">{nextMonthDay}</div>
            </td>
          );
          nextMonthDay++;
        } else {
          const date = new Date(year, month, day);
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          const hasEvents = events.some(
            (event) =>
              new Date(event.date).toDateString() === date.toDateString()
          );

          days.push(
            <td
              key={day}
              className={`${isSelected ? "selected" : ""} ${
                hasEvents ? "has-events" : ""
              }`}
              onClick={() => handleDateClick(date)}
            >
              <div className="day-number">{day}</div>
              {hasEvents && <div className="event-indicator"></div>}
            </td>
          );
          day++;
        }
      }
      weeks.push(<tr key={i}>{days}</tr>);
    }
    return weeks;
  };

  //Handling a file Uploading
  const handleCreateFolder = async (folderName) => {
    try {
      const response = await createFolderFunction(folderName);
      if (response.success) {
        navigate(`/home`);
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
        navigate(`/home`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="calender-area" ref={calendarRef}>
      <div className="calendar-container">
        <div className="dropdown-container">
          <div
            className="dropdown-display"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {dropdownDate}
            <span className={`dropdown-arrow ${showCalendar ? "up" : "down"}`}>
              ▼
            </span>
          </div>
          <input
            type="date"
            className="date-input"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDropdownDateChange}
          />
        </div>

        {showCalendar && (
          <div className="calendar-popup">
            <div className="calendar-header">
              <button onClick={() => changeYear(-1)}>«</button>
              <button onClick={() => changeMonth(-1)}>‹</button>
              <h2>
                {viewDate.toLocaleString("default", { month: "long" })}{" "}
                {viewDate.getFullYear()}
              </h2>
              <button onClick={() => changeMonth(1)}>›</button>
              <button onClick={() => changeYear(1)}>»</button>
            </div>

            <table className="calendar-grid">
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <th key={day}>{day}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>{renderCalendar()}</tbody>
            </table>
          </div>
        )}

        {loading && <div className="loading">Loading events...</div>}
        {error && <div className="error">Error: {error}</div>}

        <div className="events-list">
          <h3>Files on {selectedDate.toDateString()}</h3>
          {/* Render ShareModal once outside the map */}
          {selectedItem && (
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              entityType={selectedItem.entityType}
              entityId={selectedItem.id}
            />
          )}
          {events?.length > 0 ? (
            <div className="files-grid">
              {events.map((file) =>
                file && file._id ? (
                  renamingFile?.storedId === file._id ? (
                    <RenameFile
                      key={file._id}
                      file={file}
                      onRename={handleRename}
                      onCancel={() => setRenamingFile(null)}
                    />
                  ) : (
                    <FileItem
                      key={file._id}
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
                ) : null
              )}
            </div>
          ) : (
            <div className="empty-state">No files found</div>
          )}
        </div>

        {/* modal */}
        {isViewerOpen && (
          <FileViewerModal
            file={currentFile}
            onClose={() => setIsViewerOpen(false)}
          />
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
};

export default Calendar;
