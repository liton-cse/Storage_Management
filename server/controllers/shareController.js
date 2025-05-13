// controllers/share.controller.js
import { File, Note, History } from "../models/Storage.js";
import fs from "fs";
import path from "path";
import mime from "mime-types";
// Unified public access endpoint
export const getSharedContent = async (req, res) => {
  try {
    const { entityType, id } = req.params;
    let entity;

    if (!["file", "note", "history"].includes(entityType)) {
      return res.status(400).json({ error: "Invalid entity type" });
    }

    // Fetch entity
    switch (entityType) {
      case "file":
        entity = await File.findOne({ _id: id }).lean();
        break;
      case "note":
        entity = await Note.findOne({ _id: id }).lean();
        break;
      case "history":
        entity = await History.findOne({ _id: id }).lean();
        break;
    }

    if (!entity) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Handle filesystem-stored files

    if (["image", "pdf"].includes(entity.entityType)) {
      const filePath = path.join(process.cwd(), entity.path);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File missing on server" });
      }
    }

    // Handle non-file entities
    res.json(entity);
  } catch (err) {
    console.error("Error in getSharedContent:", err);
    res.status(500).json({ error: "Server error" });
  }
};
