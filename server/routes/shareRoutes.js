// routes/share.routes.js
import express from "express";
import { getSharedContent } from "../controllers/shareController.js";
const router = express.Router();

router.get("/shared/:entityType/:id", getSharedContent);

export default router;
