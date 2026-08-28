import { setAuthCookie } from "@/hooks/useCookie";
import { clearTokens, getTokens, setSessionToken } from "@/hooks/useToken";
import { createSlice } from "@reduxjs/toolkit";

const { accessToken } = getTokens();

const initialState = (() => {
  // Only store authentication status and token
  // User data will be fetched from API using /auth/me
  if (!accessToken) {
    return {
      accessToken: null,
      user: null,
      isAuthenticated: false,
    };
  }

  return {
    accessToken,
    user: null, // Will be fetched from API
    isAuthenticated: true,
  };
})();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      const token = action.payload.accessToken;

      if (!token) {
        console.error("userLoggedIn: accessToken is missing from payload");
        return;
      }

      state.accessToken = token;
      state.isAuthenticated = true;
      // User data will be fetched from API, not stored here
      state.user = null;

      if (action.payload.rememberMe) {
        try {
          setAuthCookie(action.payload);
        } catch (error) {
          console.error("Failed to set auth cookie:", error);
        }
      } else {
        setSessionToken(
          action.payload.accessToken,
          action.payload.refreshToken
        );
      }
    },
    userDetailsFetched: (state, action) => {
      // Merge new details with existing user data
      // This is used when user data is fetched from API
      state.user = { ...state.user, ...action.payload };
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      clearTokens();
    },
  },
});

export const { userLoggedIn, userDetailsFetched, userLoggedOut } =
  authSlice.actions;

export default authSlice.reducer;
