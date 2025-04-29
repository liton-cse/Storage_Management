import { createContext, useContext } from "react";

// Create context to be used throughout the a
export const AuthContext = createContext();
export const useAuth = () => {
  return useContext(AuthContext);
};
