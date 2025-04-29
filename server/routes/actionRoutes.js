import express from "express";
import {
  toggleFavourite,
  renameEntity,
  copyEntity,
  deleteEntity,
  duplicateEntity,
  shareEntity,
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
router.put("/rename/:entityType/:entityId", authenticate, renameEntity);

// POST /api/entities/:entityType/:entityId/copy
// Required body: { targetFolderId?: string }
router.post("/copy/:entityType/:entityId", authenticate, copyEntity);

// DELETE /api/entities/:entityType/:entityId
router.delete(
  "/delete/:entityType/:entityId/:storedId",
  authenticate,
  deleteEntity
);

// POST /api/entities/:entityType/:entityId/duplicate
router.post("/duplicate/:entityType/:entityId", authenticate, duplicateEntity);

// POST /api/share/:entityType/:entityId
// Body: { shareMethod?: 'whatsapp'|'telegram'|'messenger', recipientId?: string }
router.post("/share/:entityType/:entityId", authenticate, shareEntity);

export default router;
