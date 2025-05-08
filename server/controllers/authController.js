import User from "../models/User.js";
import { Note, File, Folder, History } from "../models/Storage.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { oauth2Client } from "../utils/googleClient.js";
import path from "path";
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
      avatar: req.file.path,
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
//@Update Get User Profile
//@method: get
//@endpoint: api/auth/get/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal server Error" });
  }
};

//@Update User Profile
//@method: put
//@endpoint: api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id; // Assuming you have authentication middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    // Handle image upload if provided
    if (req.file) {
      // Delete old image if exists
      if (user.avatar) {
        fs.unlink(user.avatar, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      user.avatar = req.file.path;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.image,
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
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Delete all associated data first
    await Note.deleteMany({ user: userId });

    // Delete user's files and their physical files
    const userFiles = await File.find({ user: userId });
    for (const file of userFiles) {
      if (file.filePath) {
        try {
          const fullPath = path.join(process.cwd(), file.filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (fileError) {
          console.error("Error deleting file:", fileError);
        }
      }
    }
    await File.deleteMany({ user: userId });

    await History.deleteMany({ user: userId });

    // 2. Handle avatar deletion - only for local files
    if (user.avatar && !user.avatar.startsWith("http")) {
      try {
        // Extract just the filename from the path
        const avatarFilename = path.basename(user.avatar);
        const avatarPath = path.join(
          process.cwd(),
          "uploads",
          "avatars",
          avatarFilename
        );

        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      } catch (avatarError) {
        console.error("Error deleting avatar:", avatarError);
      }
    }

    // 3. Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
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

    // 1. Better user validation
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if user has a password set (might be OAuth user)
    if (!user.password) {
      return res.status(400).json({
        message: "Password change not allowed for this account type",
      });
    }

    // 3. Validate current password exists
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    // 4. Compare passwords
    const isPasswordMatch = await user.matchPassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // 5. Validate new passwords
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // 6. Check if new password is different
    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // 7. Update password
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

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // 1. Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // 2. Verify ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Use ticket.payload directly
    const { email, name, picture, sub: googleId } = ticket.payload;

    // 3. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // 4. Generate JWT token
    const token = generateToken(user._id);

    // 5. Return response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);

    if (error.message && error.message.includes("invalid_grant")) {
      return res.status(400).json({
        error: "Invalid authorization code. Please try signing in again.",
      });
    }

    res.status(500).json({
      error: "Authentication failed. Please try again later.",
    });
  }
};
