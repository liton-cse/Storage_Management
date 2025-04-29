import {
  getFilesInFolder,
  getFolder,
  getStorageStats,
  recentHistory,
  getImages,
  getPdf,
  getFavorite,
  getSearchItem,
  getNote,
} from "../utility/api";
//get storage for home...
export const getStorage = async () => {
  try {
    const storageData = await getStorageStats();
    return {
      success: true,
      message: storageData.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.storageData?.data?.message ||
        "Storage Data are fatch by this function not found",
    };
  }
};
// recent data  history from backend atleast 10 data.
export const recentData = async () => {
  try {
    const response = await recentHistory();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

//get All File in a folder from backend to frontend data

export const getAllFileInFolder = async (id) => {
  try {
    const response = await getFilesInFolder(id);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message,
    };
  }
};

//Get All folder from the database ...

export const getAllFolder = async () => {
  try {
    const response = await getFolder();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: true,
      message: error?.response?.data?.message,
    };
  }
};

//get All images in front end from backend...

export const getImagesFunction = async () => {
  try {
    const response = await getImages();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: true,
      message: error?.response?.data?.message,
    };
  }
};

// get Pdf from Backend to front end ......

export const getPdfFunction = async () => {
  try {
    const response = await getPdf();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: true,
      message: error?.response?.data?.message,
    };
  }
};
//Get All notes from backend to frontend...
export const getNoteFunction = async () => {
  try {
    const response = await getNote();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: true,
      message: error?.response?.data?.message,
    };
  }
};

// for Buttom navigation Bar Favourite data are fatch by this function..

export const getFavoriteFunction = async () => {
  try {
    const response = await getFavorite();
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: true,
      message: error?.response?.data?.message,
    };
  }
};

//Searching content from anywhare....

export const searchItem = async (query, lastpath) => {
  try {
    const response = await getSearchItem(query, lastpath);
    return {
      success: true,
      message: response.data,
    };
  } catch (error) {
    return {
      success: true,
      message: error?.response?.data?.message,
    };
  }
};
