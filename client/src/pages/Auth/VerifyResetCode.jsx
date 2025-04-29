import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/VerifyResetCode.css";

const VerifyResetCode = () => {
  const [resetCode, setResetCode] = useState("");
  const { verifyUserCode, sendResetCode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await verifyUserCode(email, resetCode);
      console.log(response);
      if (response.success) {
        navigate("/reset-password", { state: { email } });
        setResetCode("");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const handleResendCode = async () => {
    await sendResetCode(email);
    setResetCode("");
  };

  return (
    <div className="verify-reset-code-area">
      <div className="verify-reset-code">
        <h1 className="verify-reset-code-header">Verify Reset Code</h1>
        <div className="verify-reset-code-box">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Reset Code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
            />
            <button type="submit">Verify</button>
          </form>
        </div>
        <div className="verify">
          <button className="resend-button" onClick={handleResendCode}>
            resend code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
