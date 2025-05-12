// routes/share.routes.js
import express from "express";
import { getSharedContent } from "../controllers/shareController.js";
const router = express.Router();

router.get("/:entityType/:id", getSharedContent);

export default router;
