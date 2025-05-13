import express from "express";
import {
  toggleFavourite,
  renameEntity,
  copyEntity,
  deleteEntity,
  generateShareData,
  shareViaPlatform,
} from "../controllers/actionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUT /api/favorites/:entityType/:entityId - Toggle favorite status
router.put(
  "/favourite/:entityType/:entityId/:storedId",
  authenticate,
  toggleFavourite
);
router.put("/favourite/:entityType/:entityId", authenticate, toggleFavourite);

// Rename entity route
//put.
router.put(
  "/rename/:entityType/:entityId/:storedId",
  authenticate,
  renameEntity
);

// POST /api/entities/:entityType/:entityId/copy
// Required body: { targetFolderId?: string }
router.post("/copy/:entityType/:entityId/:storedId", authenticate, copyEntity);

// DELETE /api/entities/:entityType/:entityId
router.delete(
  "/delete/:entityType/:entityId/:storedId",
  authenticate,
  deleteEntity
);

// for Share data ...

// Generate share data for an entity
router.get("/share/:entityType/:entityId", authenticate, generateShareData);

// Share via specific platform
router.post("/share/:entityType/:entityId", authenticate, shareViaPlatform);
export default router;
