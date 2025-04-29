import { deleteAction, favouriteAction } from "../utility/api";

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
