import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Pathao Courier API Configuration
const PATHAO_BASE_URL = "https://hermes-api.pathao.com/api/v1";

// Function to get credentials from localStorage or environment variables
const getCredentials = () => {
  if (typeof window === "undefined") {
    return { CLIENT_ID: "pnel77jdKB", CLIENT_SECRET: "YMx6Rf6Dls4UoFNizVm2cMlhS5i0ijQacxOtxwlU" };
  }
  const CLIENT_ID = localStorage.getItem("pathaoClientId") || import.meta.env.VITE_PATHAO_CLIENT_ID || "pnel77jdKB";
  const CLIENT_SECRET = localStorage.getItem("pathaoClientSecret") || import.meta.env.VITE_PATHAO_CLIENT_SECRET || "YMx6Rf6Dls4UoFNizVm2cMlhS5i0ijQacxOtxwlU";
  return { CLIENT_ID, CLIENT_SECRET };
};

// Store access token in memory
let accessToken = null;
let tokenExpiry = null;

// Function to get access token
const getAccessToken = async () => {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // Request new token
  try {
    const { CLIENT_ID, CLIENT_SECRET } = getCredentials();
    
    const response = await fetch("https://hermes-api.pathao.com/api/v1/issue-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to obtain access token");
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set token expiry (default 1 hour, minus 5 minutes for safety)
    tokenExpiry = Date.now() + (55 * 60 * 1000);
    return accessToken;
  } catch (error) {
    console.error("Token fetch error:", error);
    throw error;
  }
};

// Custom base query for Pathao API with Bearer token
const baseQuery = fetchBaseQuery({
  baseUrl: PATHAO_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    return headers;
  },
});

// Wrapper to handle errors
const pathaoBaseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 (Unauthorized) - token expired or invalid
  if (result.error && result.error.status === 401) {
    // Clear cached token and retry
    accessToken = null;
    tokenExpiry = null;
    
    return {
      error: {
        status: 401,
        data: {
          message: "Authentication failed. Please check your API credentials.",
          details: "Invalid Client ID or Client Secret. Token may have expired.",
        },
      },
    };
  }

  // Handle 429 (Too Many Requests)
  if (result.error && result.error.status === 429) {
    return {
      error: {
        status: 429,
        data: {
          message: "Too many requests. Please wait a moment and try again.",
          details: "Rate limit exceeded. Please slow down your requests.",
        },
      },
    };
  }

  // Handle other errors
  if (result.error) {
    const errorData = result.error.data || {};
    return {
      error: {
        ...result.error,
        data: {
          message: errorData.message || result.error.statusText || "An error occurred",
          ...errorData,
        },
      },
    };
  }

  return result;
};

export const pathaoApiSlice = createApi({
  reducerPath: "pathaoApi",
  baseQuery: pathaoBaseQuery,
  tagTypes: ["pathaoOrders", "pathaoStores"],
  endpoints: (builder) => ({
    // Get cities
    getCities: builder.query({
      query: () => ({
        url: "/countries/1/city-list",
        method: "GET",
      }),
    }),

    // Get zones by city
    getZones: builder.query({
      query: (cityId) => ({
        url: `/cities/${cityId}/zone-list`,
        method: "GET",
      }),
    }),

    // Get areas by zone
    getAreas: builder.query({
      query: (zoneId) => ({
        url: `/zones/${zoneId}/area-list`,
        method: "GET",
      }),
    }),

    // Get stores
    getStores: builder.query({
      query: () => ({
        url: "/stores",
        method: "GET",
      }),
      providesTags: ["pathaoStores"],
    }),

    // Create store
    createStore: builder.mutation({
      query: (body) => ({
        url: "/stores",
        method: "POST",
        body,
      }),
      invalidatesTags: ["pathaoStores"],
    }),

    // Create order
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["pathaoOrders"],
    }),

    // Create bulk orders
    createBulkOrders: builder.mutation({
      query: (body) => ({
        url: "/orders/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["pathaoOrders"],
    }),

    // Get order price calculation
    getPriceCalculation: builder.mutation({
      query: (body) => ({
        url: "/merchant/price-plan",
        method: "POST",
        body,
      }),
    }),

    // View order by consignment ID
    viewOrder: builder.query({
      query: (consignmentId) => ({
        url: `/orders/${consignmentId}`,
        method: "GET",
      }),
      providesTags: (result, error, consignmentId) => [
        { type: "pathaoOrders", id: consignmentId },
      ],
    }),

    // Get all orders
    getOrders: builder.query({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
      providesTags: ["pathaoOrders"],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useGetStoresQuery,
  useCreateStoreMutation,
  useCreateOrderMutation,
  useCreateBulkOrdersMutation,
  useGetPriceCalculationMutation,
  useViewOrderQuery,
  useGetOrdersQuery,
} = pathaoApiSlice;
