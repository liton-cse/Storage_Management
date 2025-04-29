// routes/favoritesRoutes.js
import express from "express";
import { getFavoriteItems } from "../controllers/navigationButtomController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/favorites
router.get("/favorite", authenticate, getFavoriteItems);

export default router;
