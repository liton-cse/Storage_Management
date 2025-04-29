import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { oauth2Client } from "../utils/googleClient.js";
import axios from "axios";
import fs from "fs";
import {
  validateSignup,
  validateLogin,
  validateResetPassword,
} from "../utils/validation.js";

//@Signup function
//@method: post
//endpoint:api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    validateSignup({ name, email, password, confirmPassword });
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Profile image is required" });
    }
    const user = await User.create({
      name,
      email,
      password,
      image: req.file.path,
    });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@Login function
//@method: post
//endpoint:api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    validateLogin({ email, password });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid password!" });
    }
    const token = generateToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//@Update User Profile
//@method: put
//@endpoint: api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id; // Assuming you have authentication middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = password;

    // Handle image upload if provided
    if (req.file) {
      // Delete old image if exists
      if (user.image) {
        fs.unlink(user.image, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      user.image = req.file.path;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    // Delete uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting uploaded image:", err);
      });
    }
    res.status(400).json({ message: error.message });
  }
};

//@Delete User Account
//@method: delete
//@endpoint: api/auth/delete-account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have authentication middleware

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's image if exists
    if (user.image) {
      fs.unlink(user.image, (err) => {
        if (err) console.error("Error deleting user image:", err);
      });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @route   PUT api/auth/change/password
// @desc    Change user password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await user.matchPassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      message: "An error occurred while changing password",
      error: error.message,
    });
  }
};

//forget function
//@method: post
//endpoint:api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      email,
      "Password Reset Code",
      `Your reset code is: ${resetCode}`
    );
    res.status(200).json({ message: "Reset code sent to email" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@Verify Reset Code
//@method:post
//@endpoint:api/auth//verify-code

export const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordToken: resetCode,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    res.status(200).json({ message: "Reset code verified" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@Reset Password Function
//@method: post
//@endpoint: api/auth//reset-password

export const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    validateResetPassword({ password, confirmPassword });

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//@Google sign in Function ..
//@method:get
//@end-point:api/auth/google.

export const googleAuth = async (req, res, next) => {
  //code is get from google to front-end and front-end pass this code by url
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uris:
        "https://storage-management-backend.onrender.com/api/auth/google",
    });
    oauth2Client.setCredentials(tokens);
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    const { email, name } = userRes.data;
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new user...");
      user = await User.create({
        name,
        email,
      });
    }
    const { _id } = user;
    const token = generateToken(_id);
    res.status(200).json({
      message: "success",
      token,
      user,
    });
  } catch (err) {
    console.error(
      "Error during Google OAuth:",
      err.response?.data || err.message
    );
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

/* GET Google Authentication API. */

// export const googleAuth = async (req, res, next) => {
//   const code = req.query.code;
//   console.log(code);
//   try {
//     const googleRes = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(googleRes.tokens);
//     const userRes = await axios.get(
//       `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
//     );
//     const { email, name } = userRes.data;
//     // console.log(userRes);
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//       });
//     }
//     const { _id } = user;
//     // const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
//     //   expiresIn: process.env.JWT_TIMEOUT,
//     // });
//     const token = generateToken(_id);
//     res.status(200).json({
//       message: "success",
//       token,
//       user,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// };
