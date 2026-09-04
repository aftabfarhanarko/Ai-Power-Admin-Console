import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "@/features/auth/authSlice";
import { getTokens } from "@/hooks/useToken";
import { getSuperadminTokens } from "@/features/superadminAuth/superadminAuthSlice";
import { API_BASE_URL, API_CONFIG } from "@/config/api";

const BASE_URL = API_BASE_URL;
const MAX_RETRY_COUNT = API_CONFIG.retryCount;

// 🔹 Base query with Authorization header
// Priority: superadmin tokens > regular user tokens
const baseQuery = (args, api, extraOptions) => {
  const formattedArgs = typeof args === 'string'
    ? (args.startsWith('/') ? args.slice(1) : args)
    : { ...args, url: args.url && args.url.startsWith('/') ? args.url.slice(1) : args.url };
    
  const resolvedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
  
  return fetchBaseQuery({
    baseUrl: resolvedBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const isSuperadmin = state?.superadminAuth?.isAuthenticated;
      const isMerchant = state?.auth?.isAuthenticated;

      let token = null;

      if (isSuperadmin) {
        const { accessToken } = getSuperadminTokens();
        token = accessToken;
      } else if (isMerchant) {
        const { accessToken } = getTokens();
        token = accessToken;
      } else {
        const { accessToken: merchantToken } = getTokens();
        const { accessToken: superadminToken } = getSuperadminTokens();
        token = merchantToken || superadminToken;
      }

      if (token && typeof token === 'string' && token.length > 10) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Accept", "application/json");
      return headers;
    },
  })(formattedArgs, api, extraOptions);
};

// 🔹 Wrapper for auto reauth (refresh token logic)
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Check if superadmin is logged in first
  const { accessToken: superadminToken, refreshToken: superadminRefreshToken } = getSuperadminTokens();
  const isSuperadmin = superadminToken && typeof superadminToken === 'string' && superadminToken.length > 10;
  
  // Get regular user tokens as fallback
  const { accessToken, refreshToken, rememberMe } = getTokens();
  let retryCount = 0;

  // Try refreshing token if unauthorized (401)
  // Note: Superadmin tokens don't have refresh logic yet, so we only retry for regular users
  while (
    !isSuperadmin && // Don't retry refresh for superadmin (no refresh endpoint yet)
    result.error &&
    result.error.status === 401 &&
    retryCount < MAX_RETRY_COUNT
  ) {
    retryCount++;
    try {
      if (refreshToken) {
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
            credentials: "include",
          },
          api,
          extraOptions
        );

        if (refreshResult.data?.success) {
          const newAccessToken = refreshResult.data.data?.accessToken;
          const newRefreshToken = refreshResult.data.data?.refreshToken;

          if (newAccessToken) {
            // ✅ Store new tokens
            api.dispatch(
              userLoggedIn({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                rememberMe,
              })
            );

            // Retry original request with new token
            result = await baseQuery(args, api, extraOptions);
            break;
          } else {
            console.error("Refresh token response missing accessToken");
            api.dispatch(userLoggedOut());
            break;
          }
        } else {
          api.dispatch(userLoggedOut());
          break;
        }
      } else {
        api.dispatch(userLoggedOut());
        break;
      }
    } catch (error) {
      console.error("Refresh token failed:", error);
      api.dispatch(userLoggedOut());
      break;
    }
  }

  return result;
};

// 🔹 Middleware to clear cache when user changes
const customMiddleware = (api) => (next) => (action) => {
  if (action.type === "auth/userLoggedIn") {
    api.dispatch(apiSlice.util.resetApiState());
  }
  return next(action);
};

// 🔹 The main API slice
export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "auth",
    "my-profile",
    "categories",
    "products",
    "users",
    "orders",
    "ordersitem",
    "fraudchecker",
    "promocode",
    "settings",
    "help",
    "systemuser",
    "activityLog",
    "earnings",
    "overview",
    "dashboard",
    "privacyPolicy",
    "termsConditions",
    "refundPolicy",
    "package",
    "invoice",
    "reviews",
    "saleInvoice",
    "manualInvoice",
    "CreditNote",
    "media",
    "banners",
    "status",
    "security"
  ],

  // ✅ Keep cache for 60s (avoid data disappearing)
  keepUnusedDataFor: 60,

  // ✅ Auto refetch on mount/reconnect
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,

  endpoints: (builder) => ({}),

  // ✅ Add middleware for auth state changes
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(customMiddleware),
});

// ✅ Utility to reset cache when needed
export const {
  util: { resetApiState },
} = apiSlice;

// 🔹 Optional: setup store listener to clear cache on logout
export const setupApiSlice = (store) => {
  store.subscribe(() => {
    const state = store.getState();
    if (!state.auth.isAuthenticated) {
      store.dispatch(resetApiState());
    }
  });
};
