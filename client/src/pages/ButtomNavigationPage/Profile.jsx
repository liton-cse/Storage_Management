import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiGreaterThanBold } from "react-icons/pi";
import { RxAvatar } from "react-icons/rx";
import { IoSettingsOutline } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { RiLogoutCircleRLine } from "react-icons/ri";
import "../../styles/ButtomNavigationStyle/Profile.css";
import LogoutModal from "./LogoutModal";
import { getProfileFunction } from "../../context/ProfileFunction";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileData, setProfileData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProfileFunction();
        if (response.success) {
          setProfileData((prev) => ({
            ...prev,
            ...response.message,
          }));
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };
  const confirmLogout = async () => {
    try {
      await handleLogout();
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      closeModal();
    }
  };

  const closeModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="profile-area">
      <div className="profile">
        <div className="profile-image">
          {profileData?.avatar?.startsWith("https") ? (
            // OAuth providers (Google/Facebook) - has full URL

            <img
              src={profileData?.avatar}
              alt="profile pic"
              onError={(e) => {
                e.target.src = "/default-profile.png";
              }}
            />
          ) : (
            // Local uploads - needs base URL prefix
            <img
              src={`${API_BASE_URL}/profile_picture/${
                profileData.avatar
                  ? profileData.avatar
                      .replace(/^profile_picture[\\/]/, "") // Remove leading folder reference
                      .replace(/\\/g, "/") // Convert backslashes to forward slashes
                  : "/default-profile.png"
              }`}
              alt="Profile"
              onError={(e) => {
                e.target.src = "/default-profile.png";
              }}
            />
          )}
        </div>
        <div className="profile-name">{profileData.name}</div>
        <div className="profile-action">
          <div className="profile-update">
            <Link to="/edit/profile">
              <div className="action-left">
                <RxAvatar />
                <span>Edit Profile</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
          <div className="profile-setting">
            <Link to="/setting">
              <div className="action-left">
                <IoSettingsOutline />
                <span>Settings</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
          <div className="profile-support">
            <Link to="/support">
              <div className="action-left">
                <BiSupport />
                <span>Support</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
        </div>

        <div className="profile-logout" onClick={handleLogoutClick}>
          <button aria-label="Logout">
            <RiLogoutCircleRLine className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
        {showLogoutModal && (
          <LogoutModal onClose={closeModal} onConfirm={confirmLogout} />
        )}
      </div>
    </div>
  );
};

export default Profile;
