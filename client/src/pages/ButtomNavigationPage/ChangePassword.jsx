import React, { useState } from "react";
import "../../styles/ButtomNavigationStyle/ChangePassword.css";
import { changePasswordFunction } from "../../context/ProfileFunction";
import { useNavigate } from "react-router-dom";
function ChangePassword() {
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await changePasswordFunction({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
        confirmPassword: password.confirmPassword,
      });
      if (response.success) {
        navigate("/profile");
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.log("Data pass failed", error);
    }
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
                type="password"
                placeholder="Current password"
                required
                name="currentPassword"
                id="currentPassword"
                value={password.currentPassword}
                onChange={(e) =>
                  setPassword({ ...password, currentPassword: e.target.value })
                }
              />
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={password.newPassword}
                required
                placeholder="New password"
                onChange={(e) =>
                  setPassword({ ...password, newPassword: e.target.value })
                }
              />
              <input
                type="passsword"
                name="confirmPassword"
                id="confirmPassword"
                value={password.confirmPassword}
                required
                placeholder="Confirm password"
                onChange={(e) =>
                  setPassword({ ...password, confirmPassword: e.target.value })
                }
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
