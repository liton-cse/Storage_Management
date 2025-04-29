import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PiGreaterThanBold } from "react-icons/pi";
import { RxAvatar } from "react-icons/rx";
import { IoSettingsOutline } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { RiLogoutCircleRLine } from "react-icons/ri";
import "../../styles/ButtomNavigationStyle/Profile.css";
import LogoutModal from "./LogoutModal";

const Profile = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const closeModal = () => {
    setShowLogoutModal(false);
  };
  return (
    <div className="profile-area">
      <div className="profile">
        <div className="profile-image">
          <img src="/mypic.jpg" alt="profile pic" />
        </div>
        <div className="profile-name">Liton Miah</div>
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
        {showLogoutModal && <LogoutModal onClose={closeModal} />}
      </div>
    </div>
  );
};

export default Profile;
