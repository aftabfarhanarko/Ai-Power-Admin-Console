import { getAuthCookie, removeAuthCookie } from "./useCookie";
import { triggerStorageSync } from "./useStorageSync";

export const getTokens = () => {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
    };
  }
  const { accessToken: cookieAccessToken, refreshToken: cookieRefreshToken } =
    getAuthCookie();

  const sessionAccessToken = sessionStorage.getItem("accessToken");
  const sessionRefreshToken = sessionStorage.getItem("refreshToken");

  if (!!cookieRefreshToken) {
    return {
      accessToken: cookieAccessToken,
      refreshToken: cookieRefreshToken,
      rememberMe: true,
    };
  } else {
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      rememberMe: false,
    };
  }
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  removeAuthCookie();
  
  // Trigger storage sync to notify other tabs about logout
  triggerStorageSync(false);
};

export const setSessionToken = (accessToken, refreshToken) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("refreshToken", refreshToken);
  
  // Trigger storage sync to notify about token update
  triggerStorageSync(false);
};
