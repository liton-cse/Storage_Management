import { getCalendar } from "../utility/api";

export const calanderFinction = async (date) => {
  try {
    const response = await getCalendar(date);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    console.log("Data Cannot pass", error);
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};
