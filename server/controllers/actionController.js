import { Folder, File, Note, History } from "../models/Storage.js";
import { performAction, getModelByType } from "../utils/performAction.js";
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
//@end-point:api/rename/:entityType/:entityId.
export const renameEntity = async (req, res) => {
  const { entityType, entityId } = req.params;
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
    performedBy: req.user._id,
    timestamp: new Date(),
  };

  const preAction = async (entity) => {
    try {
      // Safely get current name with fallbacks
      const currentName = entity.name || entity.title || entity.filename;
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

  return performAction(model, entityId, actionData, res, preAction);
};

//@ Copy action - Kept as standalone due to complex logic
//@method: post
//@endpoint:api/copy/:entityType/:entityId

export const copyEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { targetFolderId } = req.body;

    // Validate entity type
    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({ message: "Invalid entity type" });
    }

    // Find the original entity
    const entity = await model.findById(entityId);
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
          type: entity.type,
          folder: targetFolderId || entity.folder,
          owner: req.user._id,
          createdAt: new Date(),
          actions: [],
        });

        await copy.save();

        // Log action on original
        const actionData = {
          userId: req.user._id,
          type: "copy",
          performedBy: req.user._id,
          timestamp: new Date(),
          sourceId: entityId,
          targetLocation: targetFolderId || entity.folder,
          copyId: copy._id,
        };
        entity.actions.push(actionData);
        await entity.save();

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
    }

    // Handle folders and notes
    try {
      const copy = new model({
        ...entity.toObject(),
        _id: undefined,
        name: `${entity.name} (Copy)`,
        title: entityType === "note" ? `${entity.title} (Copy)` : undefined,
        isFavorite: false,
        createdAt: new Date(),
        parentFolder:
          entityType === "folder"
            ? targetFolderId || entity.parentFolder
            : undefined,
        actions: [],
      });

      await copy.save();

      // Log action on original
      const actionData = {
        userId: req.user._id,
        type: "copy",
        performedBy: req.user._id,
        timestamp: new Date(),
        sourceId: entityId,
        targetLocation:
          targetFolderId ||
          (entityType === "folder" ? entity.parentFolder : null),
        copyId: copy._id,
      };
      entity.actions.push(actionData);
      await entity.save();

      return res.status(201).json({
        success: true,
        message: `${entityType} copied successfully`,
        copy,
      });
    } catch (dbErr) {
      console.error("Database copy error:", dbErr);
      return res.status(500).json({
        message: `Error copying ${entityType}`,
        error: dbErr.message,
      });
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

//@ Duplicate action - Kept as standalone due to complex logic
//@method:post
//@end-point: api/duplicate/:entityType/:entityId

export const duplicateEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    // Validate entity type
    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
    }

    // Find the original entity
    const entity = await model.findById(entityId);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    let duplicate;

    // Handle file duplication
    if (entityType === "file") {
      try {
        const ext = path.extname(entity.path);
        const baseName = path.basename(entity.path, ext);

        // Generate unique filename
        let counter = 1;
        let newFileName = `${baseName}_copy${ext}`;
        let newPath = path.join(path.dirname(entity.path), newFileName);

        while (fs.existsSync(newPath)) {
          newFileName = `${baseName}_copy_${counter}${ext}`;
          newPath = path.join(path.dirname(entity.path), newFileName);
          counter++;
        }

        // Create physical copy
        fs.copyFileSync(entity.path, newPath);

        duplicate = new File({
          userId: req.user._id,
          name: `${entity.name}_copy${counter > 1 ? `_${counter - 1}` : ""}`,
          path: newPath,
          size: entity.size,
          type: entity.type,
          folder: entity.folder,
          createdAt: new Date(),
          isFavorite: false,
          actions: [],
        });
      } catch (fileErr) {
        console.error("File duplication error:", fileErr);
        return res.status(500).json({
          success: false,
          message: "Error creating file copy",
          error: fileErr.message,
        });
      }
    }
    // Handle folders and notes
    else {
      duplicate = new model({
        ...entity.toObject(),
        _id: undefined,
        name: `${entity.name}_copy`,
        title: entityType === "note" ? `${entity.title}_copy` : undefined,
        isFavorite: false,
        createdAt: new Date(),
        actions: [],
      });
    }

    // Save the duplicate
    await duplicate.save();

    // Log action on original
    entity.actions.push({
      type: "duplicate",
      performedBy: req.user._id,
      timestamp: new Date(),
      duplicateId: duplicate._id,
    });
    await entity.save();

    return res.status(201).json({
      success: true,
      message: `${entityType} duplicated successfully`,
      duplicate,
    });
  } catch (err) {
    console.error("Error in duplicateEntity:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during duplication",
      error: err.message,
    });
  }
};

// Share action - Kept as standalone due to social media integration
export const shareEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { shareMethod, recipientId } = req.body;

    // Validate entity type
    const model = getModelByType(entityType);
    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
    }

    // Find the entity
    const entity = await model.findById(entityId);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    // Generate shareable link
    const baseUrl = process.env.APP_BASE_URL || "https://storage-management-backend.onrender.com";
    let sharePath, message;

    switch (entityType) {
      case "file":
        sharePath = `/files/${entity._id}`;
        message = `Check out this file: ${entity.name}`;
        break;
      case "note":
        sharePath = `/notes/${entity._id}`;
        message = `Check out this note: ${entity.title}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "This entity type cannot be shared externally",
        });
    }

    const shareUrl = `${baseUrl}${sharePath}`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(shareUrl);

    // Platform-specific share URLs
    const platformUrls = {
      whatsapp: {
        general: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
        specific: recipientId
          ? `https://wa.me/${recipientId}?text=${encodedMessage}%20${encodedUrl}`
          : null,
      },
      telegram: {
        general: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
        specific: recipientId
          ? `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}&to=${recipientId}`
          : null,
      },
      messenger: {
        general: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=${process.env.FB_APP_ID}&redirect_uri=${baseUrl}`,
        specific: recipientId
          ? `https://m.me/${recipientId}?text=${encodedMessage}%20${encodedUrl}`
          : null,
      },
    };

    // Handle the share action
    if (shareMethod) {
      const platform = platformUrls[shareMethod];
      if (!platform) {
        return res.status(400).json({
          success: false,
          message: "Unsupported share method",
          supportedMethods: Object.keys(platformUrls),
        });
      }

      // Return the appropriate URL based on whether recipient is specified
      const shareLink = recipientId ? platform.specific : platform.general;

      return res.status(200).json({
        success: true,
        message: "Share link generated",
        action: "open_external", // Frontend should handle opening this URL
        shareLink,
        entity: {
          id: entity._id,
          name: entity.name || entity.title,
          type: entityType,
        },
      });
    }

    // If no share method specified, just return the basic share URL
    return res.status(200).json({
      success: true,
      message: "Share URL generated",
      shareUrl,
      entity: {
        id: entity._id,
        name: entity.name || entity.title,
        type: entityType,
      },
    });
  } catch (err) {
    console.error("Error sharing entity:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate share link",
      error: err ? err.message : undefined,
    });
  }
};
