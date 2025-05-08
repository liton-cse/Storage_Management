import { Folder, File, Note, History } from "../models/Storage.js";
import mongoose from "mongoose";
// Enhanced performAction with pre-action callback support
export const performAction = async (
  model,
  entityId,
  storedId,
  actionData,
  res,
  preActionCallback
) => {
  try {
    const entity = await model.findById(storedId);
    const history = await History.findById(entityId);
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }
    // Execute any pre-action logic if provided
    if (preActionCallback) {
      await preActionCallback(entity);
      await preActionCallback(history);
    }
    // Add the action to the entity's actions array
    entity.actions.push(actionData);

    await history.save();
    await entity.save();
    return res.status(200).json({ entity });
  } catch (err) {
    console.error(`Error performing action on ${model.modelName}:`, err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const performRenameAction = async (
  model,
  entityId,
  storedId,
  actionData,
  res,
  preActionCallback
) => {
  try {
    const entity = await model.findById(storedId);
    const history = await History.findById(entityId);
    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }
    // Execute any pre-action logic if provided
    if (preActionCallback) {
      await preActionCallback(entity);
      if (history) {
        const currentName = entity.name || entity.title || entity.entityName;
        const previousName = history.entityName;

        // Update current name
        history.entityName = currentName;
      }
    }
    // Add the action to the entity's actions array
    entity.actions.push(actionData);

    await history.save();
    await entity.save();
    return res.status(200).json({ entity });
  } catch (err) {
    console.error(`Error performing action on ${model.modelName}:`, err);
    return res.status(500).json({ message: "Server error" });
  }
};
// Helper function to get model by type
export const getModelByType = (entityType) => {
  const models = {
    folder: Folder,
    file: mongoose.model("File") || File, // Explicitly get Mongoose model
    note: Note,
    history: History,
  };

  return models[entityType.toLowerCase()] || null;
};
