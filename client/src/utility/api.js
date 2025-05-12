import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`, // Backend base URL
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/********      Auth Api       ******** */
//Auth Api for Start..
export const signup = (formDataToSend) =>
  API.post("/auth/signup", formDataToSend);
export const login = (data) => API.post("/auth/login", data);
export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });
export const verifyResetCode = (email, resetCode) =>
  API.post("/auth/verify-code", { email, resetCode });
export const resetPassword = (data) => API.post("/auth/reset-password", data);
// export const googleAuth = (code) => API.get(`/auth/google?code=${code}`);
export const googleAuth = (code) => API.post(`/auth/google`, { code });
export const EditProfile = (formData) =>
  API.put(`/auth/update/profile`, formData);
export const getProfile = () => API.get(`/auth/profile`);
export const changePassword = (formData) =>
  API.put(`/auth/change/password`, formData);
export const deleteAccount = () => API.delete(`/auth/delete/profile`);
//Auth Api for End..

// Searching content deom anywhere.....
export const getSearchItem = (query, lastpath) =>
  API.get(`/search?query=${query}&section=${lastpath}`);

/********     Menu Api    ******** */

//MenuController Route.. for the  home Page Start
export const getStorageStats = () => API.get(`/storage/stats`);
export const recentHistory = () => API.get(`/history`);
export const getFilesInFolder = (id) => API.get(`folder/${id}/files`);
export const getFolder = () => API.get("/folder");

export const getImages = () => API.get(`/images`);
export const getPdf = () => API.get(`/pdf`);
export const getNote = () => API.get(`/notes`);
export const createFolder = (name) => API.post(`/folder`, { name });
export const createNoteApi = (title, description) =>
  API.post(`/notes`, { title, description });
export const updateNoteApi = (id, title, description) =>
  API.put(`/notes/${id}`, { title, description });
export const getNoteApi = (id) => API.get(`/notes/${id}`);
export const uploadFileApi = (formData) => API.post(`/file/upload`, formData);
//MenuController Route.. for the  home Page End

//Butom Naviggation bar Routes start
export const getFavorite = () => API.get(`/favorite`);
export const getCalendar = (date) => API.post(`/calendar`, { date });
//Butom Naviggation bar Routes end

// --------------*****Action Api******-------

// action controller Route.. for the action of documents...start
export const deleteAction = (entityType, entityId, storedId) =>
  API.delete(`/delete/${entityType}/${entityId}/${storedId}`);

export const favouriteAction = (entityType, entityId, storedId) =>
  API.put(`/favourite/${entityType}/${entityId}/${storedId}`);
export const copyAction = (entityType, entityId, storedId, apiType) =>
  API.post(
    `/copy/${entityType}/${entityId}/${storedId}`,
    apiType ? { type: apiType } : {}
  );
export const renameAction = (entityType, entityId, storedId, newName) =>
  API.put(`/rename/${entityType}/${entityId}/${storedId}`, { newName });

export const generateShareData = (entityType, entityId) =>
  API.get(`/share/data/${entityType}/${entityId}`);
export const shareViaPlatform = (entityType, entityId, platform, recipient) =>
  API.post(`/share/platform/${entityType}/${entityId}`, {
    platform,
    recipient,
  });
// action controller Route.. for the action of documents...end...

//ShareActrion content......start....
export const getShareContent = (entityType, id) =>
  API.get(`/shared/${entityType}${id}`);

//ShareContent .....end ....
