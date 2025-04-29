import React, { useState, useRef } from "react";
import { IoCamera } from "react-icons/io5";
import "../../styles/ButtomNavigationStyle/EditProfile.css";

function EditProfile() {
  const [profileImage, setProfileImage] = useState("/mypic.jpg");
  const [username, setUsername] = useState("");
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Profile updated:", { username, profileImage });
    // Add your API call or state management logic here
  };

  return (
    <div className="edit-profile-area">
      <form className="edit-profile" onSubmit={handleSubmit}>
        <div className="edit-profile-heading">
          <h1>Edit Profile</h1>
        </div>

        <div className="edit-profile-image" onClick={handleImageClick}>
          <img
            src={profileImage}
            alt="profile"
            onError={(e) => {
              e.target.src = "/default-profile.jpg"; // Fallback image
            }}
          />
          <div className="camera-icon">
            <IoCamera />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>

        <div className="edit-profile-username">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
