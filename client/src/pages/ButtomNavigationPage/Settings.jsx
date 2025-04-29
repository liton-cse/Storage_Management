import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PiGreaterThanBold } from "react-icons/pi";
import { CiLock } from "react-icons/ci";
import { IoMdHammer } from "react-icons/io";
import { MdPrivacyTip } from "react-icons/md";
import { AiFillInfoCircle } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import "../../styles/ButtomNavigationStyle/Setting.css";
import DeleteAccountModal from "./DeleteAccountModal";

function Setting() {
  const [showDeleteModal, setShowLogoutModal] = useState(false);
  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };
  const closeModal = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="setting-area">
      <div className="setting">
        <div className="settign-heading">
          <h1>Settings</h1>
        </div>
        <div className="setting-action">
          <div className="change-password">
            <Link to="/change/password">
              <div className="action-left">
                <CiLock />
                <span>Change Password</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
          <div className="terms-condition">
            <Link to="/terms/condition">
              <div className="action-left">
                <IoMdHammer />
                <span>Terms & Condition</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
          <div className="privacy-policy">
            <Link to="/privacy/policy">
              <div className="action-left">
                <MdPrivacyTip />
                <span>Privacy Policy</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
          <div className="about-us">
            <Link to="/about">
              <div className="action-left">
                <AiFillInfoCircle />
                <span>About Us</span>
              </div>
              <div className="action-right">
                <PiGreaterThanBold />
              </div>
            </Link>
          </div>
        </div>
        <div className="delete-account" onClick={handleDeleteAccount}>
          <button aria-label="delete">
            <AiOutlineDelete className="logout-icon" />
            <span>Delete Account</span>
          </button>
        </div>
        {showDeleteModal && <DeleteAccountModal onClose={closeModal} />}
      </div>
    </div>
  );
}

export default Setting;
