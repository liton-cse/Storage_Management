import express from "express";
import {
  createFolder,
  getFolders,
  uploadFile,
  getFilesInFolder,
  createNote,
  getNotes,
  updateNote,
  getStorageStats,
  getHistory,
  getFilesById,
  getImages,
  getPdf,
  searchItems,
} from "../controllers/menuController.js";
import { upload } from "../utils/multerConfiguration.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { checkOwnership } from "../middleware/checkOwnership.js";
import { Folder, File } from "../models/Storage.js";

const router = express.Router();

// Folder Routes
router.post("/folder", authenticate, createFolder);
router.get("/folder", authenticate, getFolders);

// File Routes
router.post(
  "/file/upload",
  authenticate,
  upload.array("files", 10),
  uploadFile
);

// Fixed ownership middleware usage
//Find file in a specific folder..
router.get(
  "/folder/:id/files",
  authenticate,
  checkOwnership(Folder), // No parentheses after checkOwnership
  getFilesInFolder
);
//get file by its id..
router.get(
  "/file/:id",
  authenticate,
  checkOwnership(File), // No parentheses after checkOwnership
  getFilesById
);
// get All image which are not included to another folder....
router.get("/images", authenticate, getImages);

//get All pdf which are not included to another folder...
router.get("/pdf", authenticate, getPdf);

// Note Routes
router.post("/notes", authenticate, createNote);
router.get("/notes", authenticate, getNotes);
router.put("/note/:id", authenticate, updateNote);

// Storage Stats
router.get("/storage/stats", authenticate, getStorageStats);

// History
router.get("/history", authenticate, getHistory);

//For searching content from  any where

router.get("/search", authenticate, searchItems);

export default router;
