import { getShareContent } from "../utility/api";

export const getShareContentFunction = async (entityType, id) => {
  try {
    const response = await getShareContent(entityType, id);
    return {
      success: true,
      message: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || "Failed change the password",
    };
  }
};
