import { createSlice } from "@reduxjs/toolkit";
import { triggerStorageSync } from "@/hooks/useStorageSync";

// Helper functions for superadmin token management
const getSuperadminTokens = () => {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }
  try {
    const sessionAccessToken = sessionStorage.getItem("superadmin_accessToken");
    const sessionRefreshToken = sessionStorage.getItem("superadmin_refreshToken");
    
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
    };
  } catch (error) {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }
};

const setSuperadminTokens = (accessToken, refreshToken) => {
  try {
    if (!accessToken || typeof accessToken !== 'string' || accessToken.length < 10) {
      console.error("setSuperadminTokens: Invalid accessToken provided", typeof accessToken, accessToken?.length);
      return;
    }
    
    sessionStorage.setItem("superadmin_accessToken", accessToken);
    
    if (refreshToken && typeof refreshToken === 'string' && refreshToken.length > 10) {
      sessionStorage.setItem("superadmin_refreshToken", refreshToken);
    }
    
    // Verify the token was saved
    const savedToken = sessionStorage.getItem("superadmin_accessToken");
    if (savedToken !== accessToken) {
      console.error("setSuperadminTokens: Token verification failed! Expected:", accessToken.substring(0, 20), "Got:", savedToken?.substring(0, 20));
    }
    
    triggerStorageSync(false, "superadmin_auth_change");
  } catch (error) {
    console.error("setSuperadminTokens: Error saving tokens to sessionStorage:", error);
    throw error;
  }
};

const clearSuperadminTokens = () => {
  sessionStorage.removeItem("superadmin_accessToken");
  sessionStorage.removeItem("superadmin_refreshToken");
  triggerStorageSync(false, "superadmin_auth_change");
};

// Check if superadmin is already logged in (from sessionStorage)
const getSuperAdminAuth = () => {
    try {
        const { accessToken } = getSuperadminTokens();
        return {
            isAuthenticated: !!accessToken,
            accessToken: accessToken || null,
        };
    } catch {
        return { isAuthenticated: false, accessToken: null };
    }
};

const initialState = {
    ...getSuperAdminAuth(),
    user: null, // Will be fetched from API
};

export const superadminAuthSlice = createSlice({
    name: "superadminAuth",
    initialState,
    reducers: {
        superadminLoggedIn: (state, action) => {
            const { accessToken, refreshToken, user } = action.payload;
            
            if (!accessToken) {
                console.error("superadminLoggedIn: accessToken is missing from payload", action.payload);
                return;
            }

            if (typeof accessToken !== 'string' || accessToken.length < 10) {
                console.error("superadminLoggedIn: Invalid accessToken format", typeof accessToken, accessToken?.length);
                return;
            }

            state.accessToken = accessToken;
            state.isAuthenticated = true;
            state.user = user || null;
            
            // Save tokens to sessionStorage
            setSuperadminTokens(accessToken, refreshToken);
            
            // Verify token was saved
            const savedToken = sessionStorage.getItem("superadmin_accessToken");
            if (!savedToken || savedToken !== accessToken) {
                console.error("superadminLoggedIn: Token was not saved correctly to sessionStorage!");
                // Try to save again as fallback
                try {
                    sessionStorage.setItem("superadmin_accessToken", accessToken);
                    if (refreshToken) {
                        sessionStorage.setItem("superadmin_refreshToken", refreshToken);
                    }
                } catch (error) {
                    console.error("superadminLoggedIn: Failed to save token on retry:", error);
                }
            }
            
            // Trigger storage sync to notify other tabs about superadmin login
            triggerStorageSync(false, "superadmin_auth_change");
        },
        superadminUserFetched: (state, action) => {
            // Merge new details with existing user data
            // This is used when user data is fetched from API
            state.user = { ...state.user, ...action.payload };
        },
        superadminLoggedOut: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isAuthenticated = false;
            
            clearSuperadminTokens();
            
            // Trigger storage sync to notify other tabs about superadmin logout
            triggerStorageSync(false, "superadmin_auth_change");
        },
    },
});

export const { superadminLoggedIn, superadminUserFetched, superadminLoggedOut } =
    superadminAuthSlice.actions;

// Export token helpers for use in API slice
export { getSuperadminTokens, setSuperadminTokens, clearSuperadminTokens };

export default superadminAuthSlice.reducer;
