import React from "react";
import "../styles/footer.css";
import { FaHome, FaUser, FaHeart, FaCalendarAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Footer = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Only render the footer if the user is logged in
  if (!user) {
    return null; // Return nothing if there's no user
  }

  return (
    <div className="buttom-nav-area">
      <div className="buttom-nav">
        <div
          className={`buttom-nav-item ${
            location.pathname === "/home" ? "active" : ""
          }`}
        >
          <FaHome />
          <Link to="/home">Home</Link>
        </div>
        <div
          className={`buttom-nav-item ${
            location.pathname === "/favorite" ? "active" : ""
          }`}
        >
          <FaHeart />
          <Link to="/favorite">Favorite</Link>
        </div>
        <div
          className={`buttom-nav-item ${
            location.pathname === "/calendar" ? "active" : ""
          }`}
        >
          <FaCalendarAlt />
          <Link to="/calendar">Calendar</Link>
        </div>
        <div
          className={`buttom-nav-item ${
            location.pathname === "/profile" ? "active" : ""
          }`}
        >
          <FaUser />
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
