import React, { useState, useRef, useEffect } from "react";
import { IoCamera } from "react-icons/io5";
import "../../styles/ButtomNavigationStyle/EditProfile.css";
import {
  EditProfileFunction,
  getProfileFunction,
} from "../../context/ProfileFunction";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;
  const [profileData, setProfileData] = useState({
    avatarFile: null, // Store File object directly
    avatarUrl: "", // For displaying existing avatar
    name: "",
  });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getProfileFunction();
        if (result.success) {
          setProfileData({
            avatarFile: null,
            avatarUrl: result.message.avatar || "",
            name: result.message.name || "",
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        avatarFile: file, // Store File object directly
        avatarUrl: URL.createObjectURL(file), // Create preview URL
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Append the File object directly if it exists
      if (profileData.avatarFile) {
        formData.append("avatar", profileData.avatarFile);
      }

      formData.append("name", profileData.name);

      // No need for custom headers - axios will set multipart headers automatically
      const result = await EditProfileFunction(formData);

      if (result.success) {
        navigate(`/profile`);
      }
    } catch (error) {
      console.log("Failed to update profile", error);
    }
  };

  return (
    <div className="edit-profile-area">
      <form className="edit-profile" onSubmit={handleSubmit}>
        <div className="edit-profile-heading">
          <h1>Edit Profile</h1>
        </div>

        <div className="edit-profile-image" onClick={handleImageClick}>
          {profileData.avatarUrl ? (
            profileData.avatarUrl.startsWith("http") ||
            profileData.avatarUrl.startsWith("blob:") ? (
              // Either OAuth provider URL or local preview
              <img src={profileData.avatarUrl} alt="profile" />
            ) : (
              // Local server path
              <img
                src={`${API_BASE_URL}/profile_picture/${profileData.avatarUrl.replace(
                  /^profile_picture[\\/]/,
                  ""
                )}`}
                alt="Profile"
              />
            )
          ) : (
            // Default image
            <img src="/default-profile.jpg" alt="Profile" />
          )}
          <div className="camera-icon">
            <IoCamera />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            name="avatar"
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
        <div className="edit-profile-show-name">
          <h1>{profileData.name}</h1>
        </div>
        <div className="edit-profile-username">
          <input
            type="text"
            placeholder="Username"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
            required
          />
        </div>

        <div className="edit-profile-save-change-button">
          <button type="submit">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
