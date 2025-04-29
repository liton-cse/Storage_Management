import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Backend base URL
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Auth Api for Start..
export const signup = (formDataToSend, config) =>
  API.post("/auth/signup", formDataToSend, config);
export const login = (data) => API.post("/auth/login", data);
export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });
export const verifyResetCode = (email, resetCode) =>
  API.post("/auth/verify-code", { email, resetCode });
export const resetPassword = (data) => API.post("/auth/reset-password", data);
export const googleAuth = (code) => API.get(`/auth/google?code=${code}`);
//Auth Api for End..

// Searching content deom anywhere.....
export const getSearchItem = (query, lastpath) =>
  API.get(`/search?query=${query}&section=${lastpath}`);

//MenuController Route.. for the  home Page Start

export const getStorageStats = () => API.get(`/storage/stats`);
export const recentHistory = () => API.get(`/history`);
export const getFilesInFolder = (id) => API.get(`folder/${id}/files`);
export const getFolder = () => API.get("/folder");

export const getImages = () => API.get(`/images`);
export const getPdf = () => API.get(`/pdf`);
export const getNote = () => API.get(`/notes`);
//MenuController Route.. for the  home Page End

//Butom Naviggation bar Routes start
export const getFavorite = () => API.get(`/favorite`);
//Butom Naviggation bar Routes end

// action controller Route.. for the action of documents...start
export const deleteAction = (entityType, entityId, storedId) =>
  API.delete(`/delete/${entityType}/${entityId}/${storedId}`);

export const favouriteAction = (entityType, entityId, storedId) =>
  API.put(`/favourite/${entityType}/${entityId}/${storedId}`);

// action controller Route.. for the action of documents...end...
