import { getShareContent } from "../utility/api";

export const getShareContentFunction = async (entityType, id) => {
  console.log(entityType, id);
  try {
    const response = await getShareContent(entityType, id);
    return {
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to get the share data",
    };
  }
};
