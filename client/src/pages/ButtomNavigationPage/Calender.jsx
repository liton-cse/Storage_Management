import React, { useState, useEffect } from "react";
import "../../styles/ButtomNavigationStyle/Calender.css";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // Separate state for viewed month/year
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dropdownDate, setDropdownDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );

  // Function to fetch events for the selected date
  const fetchEvents = async (date) => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual API endpoint
      // const response = await fetch(
      //   `/api/events?date=${date.toISOString().split("T")[0]}`
      // );
      // const data = await response.json();
      // setEvents(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
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
  }, [selectedDate]);

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

  return (
    <div className="calender-area">
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
          <h3>Events on {selectedDate.toDateString()}</h3>
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <li key={event.id}>{event.title}</li>
              ))}
            </ul>
          ) : (
            <p>No events scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
