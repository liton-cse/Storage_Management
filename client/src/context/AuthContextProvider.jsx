import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext"; // Import AuthContext from the new file
import {
  signupUser,
  loginUser,
  logoutUser,
  sendResetCode,
  verifyUserCode,
  resetUserPassword,
} from "./AuthFunction";
import { getStorage, recentData, searchItem } from "../context/MenuFunction";
import { deleteAction } from "../utility/api";
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Search-related state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  useEffect(() => {
    const checkUser = () => {
      const userToken = localStorage.getItem("token");
      if (userToken) {
        setUser(userToken);
      }
      setLoading(false);
    };

    checkUser(); // Calling the async function inside useEffect
  }, []);

  //Handle the Searching logic....
  const handleSearch = async (query, lastpath) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Replace this with your actual search API call
      const response = await searchItem(query, lastpath);
      if (!response.success) {
        throw new Error("Searching data is found!");
      }
      const data = response.message;
      setSearchResults(data);
    } catch (error) {
      setSearchError(error.message);
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to clear search results

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  // Function to handle login
  const handleLogin = async ({ email, password }) => {
    const loggedInUser = await loginUser({ email, password });
    if (loggedInUser.success) {
      setUser(loggedInUser.userData.token);
      return { loggedInUser }; // Update state immediately
    } else {
      console.error("Login failed:", loggedInUser.message);
    }
  };
  // Function for Signing...

  const handleSignup = async (formDataToSend, config) => {
    const signInUser = await signupUser(formDataToSend, config);
    if (signInUser.success) {
      setUser(signInUser);
      return { signInUser }; // Update state immediately
    } else {
      return signInUser.message;
    }
  };

  // by the google login section....
  const handleGoogleLogin = (userData) => {
    setUser(userData);
  };

  // Function to handle the logout
  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };
  const value = {
    user,
    handleSignup,
    handleLogin,
    handleLogout,
    sendResetCode,
    verifyUserCode,
    resetUserPassword,
    handleGoogleLogin,
    getStorage,
    recentData,
    deleteAction,
    //searching
    searchResults,
    isSearching,
    searchError,
    handleSearch,
    clearSearch,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
