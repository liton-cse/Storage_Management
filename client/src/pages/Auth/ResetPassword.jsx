import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetUserPassword } = useAuth();
  const location = useLocation();
  const { email } = location.state;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await resetUserPassword({
        email,
        password,
        confirmPassword,
      });
      console.log(response);
      if (response.success) {
        setPassword("");
        setConfirmPassword("");
        navigate("/login");
      }
    } catch (error) {
      console.error("Authentication Failed:", error);
    }
  };

  return (
    <div className="reset-password-area">
      <div className="reset-password">
        <h1 className="reset-password-heading">Reset Password</h1>
        <div className="reset-password-form-box">
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
