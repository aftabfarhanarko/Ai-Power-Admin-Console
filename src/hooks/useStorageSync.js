import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn, userLoggedOut, userDetailsFetched } from "@/features/auth/authSlice";
import { superadminLoggedIn, superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import { getTokens } from "./useToken";
import { decodeJWT } from "@/utils/jwt-decoder";

/**
 * Hook to sync authentication state across browser tabs/windows in real-time
 * Listens to storage events and updates Redux state accordingly
 */
const useStorageSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleStorageChange = (event) => {
      // Handle regular auth changes
      if (event.key === "accessToken" || event.key === "refreshToken" || event.key === "auth_sync" || event.key === "restro_exp") {
        const { accessToken, refreshToken } = getTokens();

        if (!accessToken || !refreshToken) {
          // User logged out in another tab
          dispatch(userLoggedOut());
        } else {
          // User logged in or token updated in another tab
          try {
            // Validate token before decoding
            if (accessToken && typeof accessToken === 'string' && accessToken.length > 0) {
              const { payload } = decodeJWT(accessToken);
              if (payload) {
                dispatch(
                  userLoggedIn({
                    accessToken,
                    refreshToken: refreshToken || null,
                    rememberMe: event.key !== "accessToken", // if not in sessionStorage, it's from cookie
                  })
                );
              } else {
                dispatch(userLoggedOut());
              }
            } else {
              dispatch(userLoggedOut());
            }
          } catch (error) {
            // Only log if it's not a Redux error
            const errorStr = error?.message || error?.toString() || '';
            if (errorStr && !errorStr.includes('Redux') && !errorStr.includes('#3')) {
              console.error("Failed to decode token during storage sync:", error);
              dispatch(userLoggedOut());
            }
            // Don't dispatch on Redux errors to avoid infinite loops
          }
        }
      }

      // User data is now fetched from API, no localStorage sync needed

      // Handle superadmin auth changes (from sessionStorage)
      if (event.key === "superadmin_accessToken" || event.key === "superadmin_auth") {
        try {
          const accessToken = sessionStorage.getItem("superadmin_accessToken");
          
          if (accessToken && typeof accessToken === 'string' && accessToken.length > 0) {
            const refreshToken = sessionStorage.getItem("superadmin_refreshToken");
            dispatch(superadminLoggedIn({
              accessToken,
              refreshToken: refreshToken || null,
              user: null, // Will be fetched from API
            }));
          } else {
            dispatch(superadminLoggedOut());
          }
        } catch (error) {
          console.error("Failed to handle superadmin auth during storage sync:", error);
          dispatch(superadminLoggedOut());
        }
      }
    };

    // Listen for storage events (cross-tab communication)
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom events (same-tab communication)
    const handleCustomStorageChange = (event) => {
      if (event.detail?.type === "auth_change") {
        // Use setTimeout to ensure Redux store is ready
        setTimeout(() => {
          try {
            const { accessToken, refreshToken } = getTokens();

            if (!accessToken) {
              // No token means user is logged out
              dispatch(userLoggedOut());
              return;
            }

            // Only decode and dispatch if we have a valid token
            if (accessToken && typeof accessToken === 'string' && accessToken.length > 0) {
              try {
                const { payload } = decodeJWT(accessToken);
                // Only dispatch if we successfully decoded the token
                if (payload) {
                  dispatch(
                    userLoggedIn({
                      accessToken,
                      refreshToken: refreshToken || null,
                      rememberMe: event.detail?.rememberMe || false,
                    })
                  );
                }
              } catch (decodeError) {
                // Token is invalid or malformed - don't log to avoid noise
                // Only dispatch logout if token is truly invalid
                if (decodeError.message && !decodeError.message.includes('Redux')) {
                  console.error("Failed to decode token during custom storage sync:", decodeError);
                  dispatch(userLoggedOut());
                }
              }
            } else {
              // Invalid token format
              dispatch(userLoggedOut());
            }
          } catch (error) {
            // Catch any other errors (like Redux store not ready)
            // Only log if it's not a Redux error
            const errorStr = error?.message || error?.toString() || '';
            if (errorStr && !errorStr.includes('Redux') && !errorStr.includes('#3')) {
              console.error("Error in custom storage sync handler:", error);
            }
            // Don't dispatch on error to avoid Redux errors
          }
        }, 0);
      }

      // User data is now fetched from API, no custom event sync needed

      // Handle superadmin auth custom events
      if (event.detail?.type === "superadmin_auth_change") {
        // Use setTimeout to ensure Redux store is ready
        setTimeout(() => {
          try {
            const accessToken = sessionStorage.getItem("superadmin_accessToken");
            
            if (accessToken && typeof accessToken === 'string' && accessToken.length > 0) {
              const refreshToken = sessionStorage.getItem("superadmin_refreshToken");
              dispatch(superadminLoggedIn({
                accessToken,
                refreshToken: refreshToken || null,
                user: null, // Will be fetched from API
              }));
            } else {
              dispatch(superadminLoggedOut());
            }
          } catch (error) {
            // Only log if it's not a Redux error
            const errorStr = error?.message || error?.toString() || '';
            if (errorStr && !errorStr.includes('Redux') && !errorStr.includes('#3')) {
              console.error("Failed to handle superadmin auth:", error);
            }
            // Don't dispatch on error to avoid Redux errors
          }
        }, 0);
      }
    };

    window.addEventListener("storage_sync", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_sync", handleCustomStorageChange);
    };
  }, [dispatch]);
};

export default useStorageSync;

/**
 * Trigger a custom storage sync event for same-tab updates
 * Call this after setting/removing items from storage
 */
export const triggerStorageSync = (rememberMe = false, type = "auth_change") => {
  // Dispatch custom event for same-tab updates
  const event = new CustomEvent("storage_sync", {
    detail: { type, rememberMe },
  });
  window.dispatchEvent(event);

  // Use localStorage as a bridge for cross-tab communication
  // (since sessionStorage events don't work across tabs)
  localStorage.setItem("auth_sync", Date.now().toString());
  localStorage.removeItem("auth_sync");
};
