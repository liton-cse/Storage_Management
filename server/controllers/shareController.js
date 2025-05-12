// controllers/share.controller.js
import { File, Note, History } from "../models/Storage.js";

// Unified public access endpoint
export const getSharedContent = async (req, res) => {
  try {
    const { entityType, id } = req.params;

    let entity;
    switch (entityType) {
      case "files":
        entity = await File.findOne({ _id: id });
        break;
      case "notes":
        entity = await Note.findOne({ _id: id });
        break;
      case "historys":
        entity = await History.findOne({ _id: id });
        break;
      default:
        return res.status(400).json({ error: "Invalid entity type" });
    }

    if (!entity) {
      return res.status(404).json({ error: "Content not found or not shared" });
    }

    // For files
    if (entityType === "files") {
      res.set({
        "Content-Type": entity.mimetype,
        "Content-Length": entity.size,
        "Content-Disposition": `inline; filename="${entity.name}"`,
      });
      return res.send(entity.buffer);
    }

    // For notes/history
    res.json({
      type: entityType,
      data: entity,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
