import React, { useState } from "react";
import "../styles/AuthForm.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleLogin from "./GoogleLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";

const AuthForm = ({ type }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    image: null, // Changed from empty string to null for file upload
  });
  const [previewImage, setPreviewImage] = useState(null);
  const { handleLogin, handleSignup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });

      // Create preview for the image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === "login") {
        const response = await handleLogin(formData);
        if (response.loggedInUser.userData.token) {
          setFormData({
            email: "",
            password: "",
            name: "",
            confirmPassword: "",
            image: null,
          });
          setPreviewImage(null);
          navigate("/");
        }
      } else if (type === "signup") {
        if (
          !formData.name ||
          !formData.email ||
          !formData.password ||
          !formData.confirmPassword ||
          !formData.image
        ) {
          alert("All fields are required");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          alert("Passwords don't match");
          return;
        }

        // Create FormData object for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("image", formData.image);

        // Add headers for FormData
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
        const response = await handleSignup(formDataToSend, config);
        if (response?.signInUser?.success) {
          setFormData({
            email: "",
            password: "",
            name: "",
            confirmPassword: "",
            image: null,
          });
          setPreviewImage(null);
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setFormData({
        email: "",
        password: "",
        name: "",
        confirmPassword: "",
        image: null,
      });
      setPreviewImage(null);
    }
  };

  return (
    <div className="register-area">
      <div className="register">
        <h1 className="register-heading">
          {type === "login" ? "Sign In" : "Sign Up"}
        </h1>
        <div className="register-box">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {type === "signup" && (
              <input
                type="text"
                id="fullname"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            )}
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              placeholder="password"
              required
              onChange={handleChange}
            />
            {type === "signup" && (
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm password"
                required
                onChange={handleChange}
              />
            )}
            {type === "signup" && (
              <div className="image-upload-section">
                <input
                  type="file"
                  id="image-upload"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
                {previewImage && (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                  </div>
                )}
              </div>
            )}

            {type === "login" && (
              <Link
                to={"/forgot-password"}
                className="forgot-password-to-reset"
              >
                forgot password
              </Link>
            )}

            <button type="submit">
              {type === "login" ? "Login" : "Signup"}
            </button>
          </form>
        </div>
        <p>
          {type === "login"
            ? "You don't have account?"
            : "Already have an account?"}
        </p>
        {type === "signup" ? (
          <Link to={"/login"} className="register-link">
            Login
          </Link>
        ) : (
          <Link to={"/signup"} className="register-link">
            Register
          </Link>
        )}
      </div>
      <p className="or-class">or</p>
      <div className="google">
        <p className="google-para"></p>
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin></GoogleLogin>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default AuthForm;
