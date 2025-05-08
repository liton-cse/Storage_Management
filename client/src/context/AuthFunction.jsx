import {
  login,
  signup,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../utility/api.js";

export const signupUser = async (formDataToSend) => {
  try {
    const response = await signup(formDataToSend);
    localStorage.setItem("token", response.data.token);
    return { success: true, userData: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration Failed",
    };
  }
};

export const loginUser = async (data) => {
  try {
    const response = await login(data);
    if (!response.data.token) {
      return {
        success: false,
        message: "Authorization token is not found !",
      };
    }
    localStorage.setItem("token", response.data.token);
    return { success: true, userData: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login Failed",
    };
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

export const sendResetCode = async (email) => {
  try {
    const response = await forgotPassword(email);
    return { success: true, message: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Reset Code Transfer Failed!",
    };
  }
};

export const verifyUserCode = async (email, resetCode) => {
  try {
    const response = await verifyResetCode(email, resetCode);
    return { success: true, message: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Verify Failed",
    };
  }
};

export const resetUserPassword = async (data) => {
  try {
    const response = await resetPassword(data);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Reset Password Failed",
    };
  }
};
