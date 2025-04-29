import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { sendResetCode } = useAuth();
  // const [message, setMessage] = useState();
  // const [error, setError] = useState();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendResetCode(email);
      console.log(response);
      if (response.success) {
        setEmail("");
        navigate("/verify-reset-code", { state: { email } });
        // setMessage(response.message.message);
      }
    } catch (error) {
      // setError(error);
      console.error("Authentication failed:", error);
    }
  };

  return (
    <div className="forgot-password-area">
      {/* {message && <p>{message}</p>}
      {error && <p>{error}</p>} */}
      <div className="forgot-password">
        <h1 className="forgot-password-heading">Forgot Password</h1>
        <div className="forgot-password-form-box">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send Reset Code</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
