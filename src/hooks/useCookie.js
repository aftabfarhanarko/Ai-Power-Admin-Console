import { triggerStorageSync } from "./useStorageSync";

export const setAuthCookie = (auth, name = "restro", path = "/") => {
  if (typeof window === "undefined") return;
  const { accessToken, refreshToken } = auth;

  if (!accessToken) {
    throw new Error("Access token is required to set authentication.");
  }

  try {
    // Calculate 24 days expiration
    const expirationTime = Date.now() + (24 * 24 * 60 * 60 * 1000); // 24 days in milliseconds
    
    // Store tokens in localStorage with 24-day expiration
    localStorage.setItem(`${name}_access`, accessToken);
    localStorage.setItem(`${name}_exp`, expirationTime.toString());
    
    if (refreshToken) {
      localStorage.setItem(`${name}_refresh`, refreshToken);
    }
    
    // Trigger storage sync to notify other tabs about token update
    triggerStorageSync(true);
  } catch (error) {
    console.error("Failed to set authentication tokens:", error);
    throw error;
  }
};

export const getAuthCookie = (name = "restro") => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, isExpired: false };
  }
  // Get tokens from localStorage
  const accessToken = localStorage.getItem(`${name}_access`);
  const refreshToken = localStorage.getItem(`${name}_refresh`);
  const tokenExp = localStorage.getItem(`${name}_exp`);

  // Check if token is expired (24 days expiration)
  const isExpired = tokenExp && parseInt(tokenExp) < Date.now();

  return {
    accessToken: isExpired ? null : accessToken,
    refreshToken: isExpired ? null : refreshToken,
    isExpired,
  };
};

export const removeAuthCookie = (name = "restro", path = "/") => {
  if (typeof window === "undefined") return;
  // Remove tokens from localStorage
  localStorage.removeItem(`${name}_access`);
  localStorage.removeItem(`${name}_refresh`);
  localStorage.removeItem(`${name}_exp`);
  
  // Trigger storage sync to notify other tabs about token removal
  triggerStorageSync(false);
};

// New function to check if user is authenticated
export const isAuthenticated = (name = "restro") => {
  const { accessToken, refreshToken, isExpired } = getAuthCookie(name);

  if (!accessToken && !refreshToken) {
    return false;
  }

  if (isExpired && !refreshToken) {
    return false;
  }

  return true;
};
