import {
  changePassword,
  deleteAccount,
  EditProfile,
  getProfile,
} from "../utility/api.js";

// Edit profile Function
export const EditProfileFunction = async (formData) => {
  try {
    const response = await EditProfile(formData);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Profile update failed",
    };
  }
};

// Get profile data
export const getProfileFunction = async () => {
  try {
    const response = await getProfile();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch profile",
    };
  }
};

// change password function for change the password of  profile....

export const changePasswordFunction = async (formData) => {
  try {
    const response = await changePassword(formData);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed change the password",
    };
  }
};

//Delete the Account of the user...

export const deleteProfileFunction = async () => {
  try {
    const response = await deleteAccount();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed change the password",
    };
  }
};
