import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Steadfast Courier API Configuration
const STEADFAST_BASE_URL = "https://portal.packzy.com/api/v1";

// Function to get credentials from localStorage or environment variables
const getCredentials = () => {
  if (typeof window === "undefined") {
    return { API_KEY: "ynl1e3u6p3bnxqu1lspdmz4zt1lpcxd2", SECRET_KEY: "brzlqfob09jelb5g06cblbon" };
  }
  const API_KEY = localStorage.getItem("steadfastApiKey") || import.meta.env.VITE_STEADFAST_API_KEY || "ynl1e3u6p3bnxqu1lspdmz4zt1lpcxd2";
  const SECRET_KEY = localStorage.getItem("steadfastSecretKey") || import.meta.env.VITE_STEADFAST_SECRET_KEY || "brzlqfob09jelb5g06cblbon";
  return { API_KEY, SECRET_KEY };
};

// Custom base query for Steadfast API with Api-Key and Secret-Key headers
const baseQuery = fetchBaseQuery({
  baseUrl: STEADFAST_BASE_URL,
  prepareHeaders: (headers) => {
    const { API_KEY, SECRET_KEY } = getCredentials();
    headers.set("Api-Key", API_KEY);
    headers.set("Secret-Key", SECRET_KEY);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    return headers;
  },
});

// Wrapper to handle errors and rate limiting
const steadfastBaseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 429 (Too Many Requests) errors
  if (result.error && result.error.status === 429) {
    const errorData = result.error.data || {};
    return {
      error: {
        status: 429,
        data: {
          message: errorData.message || "Too many failed attempts. This client is temporarily blocked.",
          details: "Please check your API credentials (Api-Key and Secret-Key) and wait a few minutes before trying again.",
        },
      },
    };
  }

  // Handle 401 (Unauthorized) - likely invalid credentials
  if (result.error && result.error.status === 401) {
    return {
      error: {
        status: 401,
        data: {
          message: "Authentication failed. Please check your API credentials.",
          details: "Invalid Api-Key or Secret-Key. Please verify your credentials in the environment variables or API configuration.",
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

export const steadfastApiSlice = createApi({
  reducerPath: "steadfastApi",
  baseQuery: steadfastBaseQuery,
  tagTypes: ["steadfastOrders", "steadfastReturns", "steadfastPayments"],
  endpoints: (builder) => ({
    // Create a single order
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/create_order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["steadfastOrders"],
    }),

    // Create bulk orders (max 500 items)
    createBulkOrders: builder.mutation({
      query: (data) => ({
        url: "/create_order/bulk-order",
        method: "POST",
        body: { data },
      }),
      invalidatesTags: ["steadfastOrders"],
    }),

    // Check delivery status by Consignment ID
    getStatusByConsignmentId: builder.query({
      query: (id) => ({
        url: `/status_by_cid/${id}`,
        method: "GET",
      }),
    }),

    // Check delivery status by Invoice ID
    getStatusByInvoice: builder.query({
      query: (invoice) => ({
        url: `/status_by_invoice/${invoice}`,
        method: "GET",
      }),
    }),

    // Check delivery status by Tracking Code
    getStatusByTrackingCode: builder.query({
      query: (trackingCode) => ({
        url: `/status_by_trackingcode/${trackingCode}`,
        method: "GET",
      }),
    }),

    // Get current balance
    getBalance: builder.query({
      query: () => ({
        url: "/get_balance",
        method: "GET",
      }),
    }),

    // Create return request
    createReturnRequest: builder.mutation({
      query: (body) => ({
        url: "/create_return_request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["steadfastReturns"],
    }),

    // Get single return request
    getReturnRequest: builder.query({
      query: (id) => ({
        url: `/get_return_request/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "steadfastReturns", id }],
    }),

    // Get all return requests
    getReturnRequests: builder.query({
      query: () => ({
        url: "/get_return_requests",
        method: "GET",
      }),
      providesTags: ["steadfastReturns"],
    }),

    // Get payments
    getPayments: builder.query({
      query: () => ({
        url: "/payments",
        method: "GET",
      }),
      providesTags: ["steadfastPayments"],
    }),

    // Get single payment with consignments
    getPayment: builder.query({
      query: (paymentId) => ({
        url: `/payments/${paymentId}`,
        method: "GET",
      }),
      providesTags: (result, error, paymentId) => [
        { type: "steadfastPayments", id: paymentId },
      ],
    }),

    // Get police stations
    getPoliceStations: builder.query({
      query: () => ({
        url: "/police_stations",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateBulkOrdersMutation,
  useGetStatusByConsignmentIdQuery,
  useGetStatusByInvoiceQuery,
  useGetStatusByTrackingCodeQuery,
  useGetBalanceQuery,
  useCreateReturnRequestMutation,
  useGetReturnRequestQuery,
  useGetReturnRequestsQuery,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useGetPoliceStationsQuery,
} = steadfastApiSlice;
