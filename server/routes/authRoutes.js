import express from "express";
import {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  googleAuth,
  updateProfile,
  deleteAccount,
  getProfile,
  changePassword,
} from "../controllers/authController.js";
import { ProfileUpload } from "../utils/userMulterConfig.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", ProfileUpload.single("avatar"), signup);
router.post("/login", login);
router.put(
  `/update/profile`,
  authenticate,
  ProfileUpload.single("avatar"),
  updateProfile
);
router.put("/change/password", authenticate, changePassword);
router.get("/profile", authenticate, getProfile);
router.delete("/delete/profile", authenticate, deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth);

export default router;
