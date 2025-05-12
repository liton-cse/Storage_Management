import {
  copyAction,
  deleteAction,
  favouriteAction,
  generateShareData,
  renameAction,
  shareViaPlatform,
} from "../utility/api";

export const deleteActionFunction = async (entityType, entityId, storedId) => {
  if (["image", "pdf", "txt"].includes(entityType)) {
    entityType = "file";
  }

  try {
    const response = await deleteAction(entityType, entityId, storedId);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

export const favouriteActionFunction = async (
  entityType,
  entityId,
  storedId
) => {
  if (["image", "pdf", "txt"].includes(entityType)) {
    entityType = "file";
  }
  try {
    const response = await favouriteAction(entityType, entityId, storedId);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    console.error("Favorite action failed:", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

export const copyActionFunction = async (
  entityType,
  entityId,
  storedId,
  type = null
) => {
  let apiType = type;
  if (["image", "pdf"].includes(entityType)) {
    apiType = entityType;
    entityType = "file";
  }
  try {
    const response = await copyAction(entityType, entityId, storedId, apiType);
    return {
      success: true,
      message: response.data.copy,
    };
  } catch (error) {
    console.error("Copy action failed:", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

export const renameActionFunction = async (
  entityType,
  entityId,
  storedId,
  newName
) => {
  if (["image", "pdf", "txt"].includes(entityType)) {
    entityType = "file";
  }

  try {
    const response = await renameAction(
      entityType,
      entityId,
      storedId,
      newName
    );

    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    console.error("Rename action failed:", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

export const generateShareDataFunction = async (entityType, entityId) => {
  if (["image", "pdf"].includes(entityType)) {
    entityType = "file";
  }
  try {
    const response = await generateShareData(entityType, entityId);

    return {
      success: true,
      message: response.data.data,
    };
  } catch (error) {
    console.error("Rename action failed:", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

export const shareViaPlatformFunction = async (
  entityType,
  entityId,
  platform,
  recipient
) => {
  if (["image", "pdf"].includes(entityType)) {
    entityType = "file";
  }

  try {
    const response = await shareViaPlatform(
      entityType,
      entityId,
      platform,
      recipient
    );

    return {
      success: true,
      message: response.data.data,
    };
  } catch (error) {
    console.error("Rename action failed:", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};
