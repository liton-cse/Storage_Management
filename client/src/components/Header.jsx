import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; // Import the search icon
import "../styles/header.css";

const Header = () => {
  const { user, handleLogout, handleSearch } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef(null);

  const fullPath = location.pathname.split("/");
  const lastpath = fullPath[fullPath.length - 1];
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query, lastpath);
      searchInputRef.current.blur();
      setQuery("");
    }
  };

  // Handle key press (Enter key)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };
  // Handle Logout
  const handleLogoutClick = () => {
    handleLogout();
    navigate("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu when the location (route) changes
  useEffect(() => {
    setMenuOpen(false); // Close the menu when the route changes
  }, [location]); // Listen for changes in the location

  return (
    <div className="header-area">
      <div className="header">
        <nav>
          {/* Search Box with Icon */}
          <form className="header-search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search notes, pdfs, images..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              ref={searchInputRef}
            />
            <button type="submit" className="search-button">
              <FaSearch className="search-icon" />
            </button>
          </form>

          {/* ✅ Responsive Menu */}
          <div className="header-menu" ref={menuRef}>
            {/* Hamburger Menu */}
            <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
              <span className={menuOpen ? "open" : ""}></span>
              <span className={menuOpen ? "open" : ""}></span>
              <span className={menuOpen ? "open" : ""}></span>
            </div>

            {/* ✅ Navigation Menu */}
            <ul className={`menu-list ${menuOpen ? "show" : ""}`}>
              {user ? (
                <>
                  <li
                    className={`${
                      location.pathname === "/folder" ? "active" : ""
                    }`}
                  >
                    <Link to="/folder" onClick={() => setMenuOpen(false)}>
                      Folder
                    </Link>
                  </li>
                  <li
                    className={`${
                      location.pathname === "/notes" ? "active" : ""
                    }`}
                  >
                    <Link to="/notes" onClick={() => setMenuOpen(false)}>
                      Notes
                    </Link>
                  </li>
                  <li
                    className={`${
                      location.pathname === "/images" ? "active" : ""
                    }`}
                  >
                    <Link to="/images" onClick={() => setMenuOpen(false)}>
                      Images
                    </Link>
                  </li>
                  <li
                    className={`${
                      location.pathname === "/pdf" ? "active" : ""
                    }`}
                  >
                    <Link to="/pdf" onClick={() => setMenuOpen(false)}>
                      Pdfs
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogoutClick}
                      className="logout-button"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li
                    className={`${
                      location.pathname === "/login" ? "active" : ""
                    }`}
                  >
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                  </li>
                  <li
                    className={`${
                      location.pathname === "/signup" ? "active" : ""
                    }`}
                  >
                    <Link to="/signup" onClick={() => setMenuOpen(false)}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
