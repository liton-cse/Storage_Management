// routes/favoritesRoutes.js
import express from "express";
import {
  getCalenderData,
  getFavoriteItems,
} from "../controllers/navigationButtomController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/favorites
router.get("/favorite", authenticate, getFavoriteItems);
router.post("/calendar", authenticate, getCalenderData);

export default router;
