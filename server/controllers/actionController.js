import { Folder, File, Note, History, ShareLog } from "../models/Storage.js";
import {
  performAction,
  getModelByType,
  performRenameAction,
} from "../utils/performAction.js";
import fs from "fs";
import path from "path";
//@ Favorite action - Refactored to use performAction
//@ method: put.
//@end-point: api/favourite/:entityType/:entityId.
export const toggleFavourite = async (req, res) => {
  const { entityType, entityId, storedId } = req.params;

  const model = getModelByType(entityType);
  if (!model) {
    return res.status(400).json({ message: "Invalid entity type" });
  }

  const actionData = {
    userId: req.user._id,
    type: "favorite",
    timestamp: new Date(),
  };

  const preAction = async (entity) => {
    entity.isFavorite = !entity.isFavorite;
    await entity.save();
  };

  return performAction(model, entityId, storedId, actionData, res, preAction);
};

//@ Rename action - Refactored to use performAction
//@method:put
//@end-point:api/rename/:entityType/:entityId/:storedId
export const renameEntity = async (req, res) => {
  const { entityType, entityId, storedId } = req.params;
  const { newName } = req.body;

  // Validate newName exists and is not empty
  if (!newName || typeof newName !== "string" || newName.trim() === "") {
    return res
      .status(400)
      .json({ message: "New name is required and cannot be empty" });
  }

  const model = getModelByType(entityType);
  if (!model) {
    return res.status(400).json({ message: "Invalid entity type" });
  }

  const actionData = {
    userId: req.user._id,
    type: "rename",
    oldName: "", // Will be set in preAction
    timestamp: new Date(),
  };

  const preAction = async (entity) => {
    try {
      // Safely get current name with fallbacks
      const currentName = entity.name || entity.title || entity.entityName;
      if (!currentName) {
        throw new Error("No existing name field found on this entity");
      }

      // Store old name
      actionData.oldName = currentName;

      if (entityType === "file") {
        // Handle file rename with extension preservation
        const lastDotIndex = currentName.lastIndexOf(".");
        const hasExtension = lastDotIndex > 0;
        const extension = hasExtension
          ? currentName.slice(lastDotIndex + 1)
          : "";

        // Remove any extension from the new name if present
        const newNameBase =
          newName.lastIndexOf(".") > 0
            ? newName.substring(0, newName.lastIndexOf("."))
            : newName;

        // Set new name with preserved extension
        entity.name = hasExtension
          ? `${newNameBase}.${extension}`
          : newNameBase;
      } else if (entityType === "note") {
        entity.title = newName;
      } else {
        entity.name = newName;
      }

      await entity.save();
    } catch (error) {
      console.error("Error in preAction:", error);
      throw error; // This will be caught by performAction's try-catch
    }
  };

  return performRenameAction(
    model,
    entityId,
    storedId,
    actionData,
    res,
    preAction
  );
};

//@ Copy action - Kept as standalone due to complex logic
//@method: post
//@endpoint:api/copy/:entityType/:entityId/:storedId

export const copyEntity = async (req, res) => {
  try {
    const { type } = req.body;
    const { entityType, entityId, storedId } = req.params;
    console.log(entityType, entityId, storedId, type);

    // Validate entity type
    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    // Find the original entity
    const entity = await model.findById(storedId);
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }

    // Handle file copy
    if (entityType === "file") {
      try {
        // Generate unique filename
        const ext = path.extname(entity.path);
        const baseName = path.basename(entity.path, ext);
        let newFileName = `${baseName}_copy${ext}`;
        let newPath = path.join(path.dirname(entity.path), newFileName);

        // Ensure unique filename if copy already exists
        let counter = 1;
        while (fs.existsSync(newPath)) {
          newFileName = `${baseName}_copy_${counter}${ext}`;
          newPath = path.join(path.dirname(entity.path), newFileName);
          counter++;
        }

        // Create physical copy
        fs.copyFileSync(entity.path, newPath);

        // Create database record
        const copy = new File({
          userId: req.user._id,
          name: `${entity.name} (Copy)`,
          path: newPath,
          size: entity.size,
          entityType: type,
          isFavorite: entity.isFavorite,
          userId: req.user._id,
          actions: [],
        });
        await copy.save();
        const history = new History({
          userId: req.user._id,
          action: "copy",
          path: entity.path,
          entityName: `${entity.name} (Copy)`,
          entityType: type,
          isFavorite: entity.isFavorite,
          entityId: copy._id,
          details: { fileName: `${entity.name} (Copy)`, fileType: type },
        });
        await history.save();

        // Update the file with the history ID
        copy.historyId = history._id;
        await copy.save();

        return res.status(201).json({
          success: true,
          message: "File copied successfully",
          copy,
        });
      } catch (fileErr) {
        console.error("File copy error:", fileErr);
        return res.status(500).json({
          message: "Error copying file",
          error: fileErr.message,
        });
      }
    } else if (entityType === "folder") {
      try {
        // Create database record
        const copy = new Folder({
          name: `${entity.name} (Copy)`,
          userId: req.user._id, // Associate with authenticated user
          isFavorite: entity.isFavorite,
        });

        const history = new History({
          userId: req.user._id,
          action: "copy",
          entityName: `${entity.name} (Copy)`,
          entityId: copy._id,
          isFavorite: entity.isFavorite,
          entityType: entityType,
          details: { folderName: `${entity.name} (Copy)` },
        });
        await history.save();
        copy.historyId = history._id;
        await copy.save();

        return res.status(201).json({
          success: true,
          message: "Folder copied successfully",
          copy,
        });
      } catch (folderErr) {
        console.error("Folder copy error:", folderErr);
        return res.status(500).json({
          message: "Error copying folder",
          error: folderErr.message,
        });
      }
    } else if (entityType === "note") {
      try {
        // Implement note copying logic here
        // Example:
        const copy = new Note({
          title: `${entity.title} (Copy)`,
          description: entity.description,
          userId: req.user._id,
          isFavorite: entity.isFavorite,
        });
        await copy.save();

        const history = new History({
          userId: req.user._id,
          action: "copy",
          entityName: `${entity.title} (Copy)`,
          entityId: copy._id,
          entityType: entityType,
          isFavorite: entity.isFavorite,
          details: {
            noteTitle: `${entity.title} (Copy)`,
            noteDescription: entity.description,
          },
        });
        await history.save();
        copy.historyId = history._id;
        await copy.save();

        return res.status(201).json({
          success: true,
          message: "Note copied successfully",
          copy,
        });
      } catch (noteErr) {
        console.error("Note copy error:", noteErr);
        return res.status(500).json({
          message: "Error copying note",
          error: noteErr.message,
        });
      }
    } else {
      return res.status(400).json({ message: "Unsupported entity type" });
    }
  } catch (err) {
    console.error("Error in copyEntity:", err);
    return res.status(500).json({
      message: "Server error during copy operation",
      error: err.message,
    });
  }
};

//@ Delete action - Kept as standalone due to special handling
//@method: delete
//@endpoint: api/delete/:entityType/:entityId...
export const deleteEntity = async (req, res) => {
  try {
    const { entityType, entityId, storedId } = req.params;
    // Validate entity type
    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
    }
    // Find the entity first to get its details
    const entity = await model.findById(storedId);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    // For files, delete physical file
    if (entityType === "file") {
      try {
        if (fs.existsSync(entity.path)) {
          fs.unlinkSync(entity.path);
          console.log(`Physical file deleted: ${entity.path}`);
        } else {
          console.warn(`File not found at path: ${entity.path}`);
        }
      } catch (fileErr) {
        console.error("Error deleting physical file:", fileErr);
        // Continue with DB deletion even if file deletion fails
      }
    }

    await History.findByIdAndDelete(entityId);
    // Delete from database
    await model.findByIdAndDelete(storedId);

    return res.status(200).json({
      success: true,
      message: `${entityType} deleted successfully`,
      deletedEntity: {
        id: entityId,
        name: entity.name || entity.title,
        type: entityType,
      },
    });
  } catch (err) {
    console.error("Error in deleteEntity:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete entity",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// Share action - Kept as standalone due to social media integration
const validatePhoneNumber = (phone) => {
  return phone.replace(/[^\d+]/g, "");
};

const validateTelegramId = (id) => {
  return id.replace(/[^\w@]/g, "");
};

export const generateShareData = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user._id;

    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
    }

    const entity = await model.findById(entityId);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    if (!entity.userId.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const baseUrl =
      process.env.APP_BASE_URL ||
      "https://storage-management-fronend.onrender.com";
    let sharePath, title, description;

    switch (entityType) {
      case "file":
        sharePath = `/file/${entity._id}`;
        title = `Check out this file: ${entity.name}`;
        description = `A file shared with you from ${req.user.name}`;
        break;
      case "history":
        sharePath = `/history/${entity._id}`;
        title = `Check out this file: ${entity.entityName}`;
        description = `A file shared with you from ${req.user.name}`;
        break;
      case "note":
        sharePath = `/note/${entity._id}`;
        title = `Check out this note: ${entity.title}`;
        description =
          entity.description.substring(0, 100) +
          (entity.description.length > 100 ? "..." : "");
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported entity type",
        });
    }
    const shareUrl = `${baseUrl}${sharePath}`;

    res.status(200).json({
      success: true,
      data: {
        url: shareUrl,
        title,
        description,
        entityType,
        entityId: entity._id,
        entityName: entity.name || entity.title || entity.entityName,
        thumbnail: entityType === "file" ? entity.thumbnailUrl : null,
      },
    });
  } catch (err) {
    console.error("Error generating share data:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const shareViaPlatform = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { platform, recipient } = req.body;
    const userId = req.user._id;

    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
    }

    const entity = await model.findById(entityId);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    if (!entity.userId.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const baseUrl =
      process.env.APP_BASE_URL ||
      "https://storage-management-fronend.onrender.com";
    const sharePath = `/${entityType}/${entity._id}`;
    const shareUrl = `${baseUrl}${sharePath}`;
    const title = `Check out this ${entityType}: ${
      entity.name || entity.title || entity.entityName
    }`;

    let shareLink;
    switch (platform) {
      case "whatsapp":
        const phone = recipient ? validatePhoneNumber(recipient) : "";
        shareLink = phone
          ? `https://wa.me/${phone}?text=${encodeURIComponent(
              title
            )}%20${encodeURIComponent(shareUrl)}`
          : `https://wa.me/?text=${encodeURIComponent(
              title
            )}%20${encodeURIComponent(shareUrl)}`;
        break;
      case "telegram":
        const tgUser = recipient ? validateTelegramId(recipient) : "";
        shareLink = tgUser
          ? `https://t.me/share/url?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(title)}&to=${tgUser}`
          : `https://t.me/share/url?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "messenger":
        // Use the newer Facebook Messenger sharing endpoint
        shareLink = `https://www.facebook.com/dialog/send?app_id=${
          process.env.FB_APP_ID
        }&link=${encodeURIComponent(
          shareUrl
        )}&redirect_uri=${encodeURIComponent(baseUrl)}`;
        break;

      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "email":
        shareLink = `mailto:${recipient || ""}?subject=${encodeURIComponent(
          title
        )}&body=${encodeURIComponent(`${title}\n\n${shareUrl}`)}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported platform",
        });
    }

    // Log the share action
    await ShareLog.create({
      entityType,
      entityId: entity._id,
      sharedBy: userId,
      platform,
      recipient,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      data: {
        shareLink,
        platform,
        requiresExternal: !["facebook", "messenger"].includes(platform),
      },
    });
  } catch (err) {
    console.error("Error sharing via platform:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
