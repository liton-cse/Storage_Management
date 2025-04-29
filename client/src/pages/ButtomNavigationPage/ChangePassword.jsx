import React, { useState } from "react";
import "../../styles/ButtomNavigationStyle/ChangePassword.css";
function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <div className="change-password-area">
      <div className="change-password-setting">
        <div className="change-password-heading">
          <h1>Change Password</h1>
        </div>
        <div className="change-password-form">
          <form onSubmit={handleSubmit}>
            <div className="change-password-input-box">
              <input
                type="text"
                placeholder="Current password"
                required
                name="currentPassword"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="text"
                name="newPassword"
                id="newPassword"
                value={newPassword}
                required
                placeholder="New password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="text"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                required
                placeholder="Confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="change-password-button">
              <button type="submit"> Save Change</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
