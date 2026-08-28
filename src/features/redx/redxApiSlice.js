import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RedX API Configuration
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return "https://openapi.redx.com.bd/v1.0.0-beta";
  }
  const sandbox = localStorage.getItem("redxSandbox") !== "false";
  return sandbox
    ? "https://sandbox.redx.com.bd/v1.0.0-beta"
    : "https://openapi.redx.com.bd/v1.0.0-beta";
};

const getToken = () => {
  if (typeof window === "undefined") {
    return "";
  }
  return (
    localStorage.getItem("redxToken") ||
    import.meta.env.VITE_REDX_TOKEN ||
    ""
  );
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set("API-ACCESS-TOKEN", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    return headers;
  },
});

const redxBaseQuery = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    return {
      error: {
        status: 401,
        data: {
          message: "Authentication failed. Please check your RedX API token.",
          details: "Invalid or expired token. Verify your credentials in Settings.",
        },
      },
    };
  }

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

export const redxApiSlice = createApi({
  reducerPath: "redxApi",
  baseQuery: redxBaseQuery,
  tagTypes: ["redxParcels", "redxStores"],
  endpoints: (builder) => ({
    // Create parcel
    createParcel: builder.mutation({
      query: (body) => ({
        url: "/parcel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["redxParcels"],
    }),

    // Track parcel - get tracking updates
    trackParcel: builder.query({
      query: (trackingId) => ({
        url: `/parcel/track/${trackingId}`,
        method: "GET",
      }),
      providesTags: (result, error, trackingId) => [
        { type: "redxParcels", id: trackingId },
      ],
    }),

    // Get parcel details
    getParcelInfo: builder.query({
      query: (trackingId) => ({
        url: `/parcel/info/${trackingId}`,
        method: "GET",
      }),
      providesTags: (result, error, trackingId) => [
        { type: "redxParcels", id: trackingId },
      ],
    }),

    // Get all areas
    getAreas: builder.query({
      query: () => ({
        url: "/areas",
        method: "GET",
      }),
    }),

    // Get areas by post code
    getAreasByPostCode: builder.query({
      query: (postCode) => ({
        url: `/areas?post_code=${postCode}`,
        method: "GET",
      }),
    }),

    // Get areas by district name
    getAreasByDistrict: builder.query({
      query: (districtName) => ({
        url: `/areas?district_name=${districtName}`,
        method: "GET",
      }),
    }),

    // Create pickup store
    createPickupStore: builder.mutation({
      query: (body) => ({
        url: "/pickup/store",
        method: "POST",
        body,
      }),
      invalidatesTags: ["redxStores"],
    }),

    // Get pickup stores
    getPickupStores: builder.query({
      query: () => ({
        url: "/pickup/stores",
        method: "GET",
      }),
      providesTags: ["redxStores"],
    }),

    // Calculate parcel charge
    calculateCharge: builder.query({
      query: ({
        deliveryAreaId,
        pickupAreaId,
        cashCollectionAmount,
        weight,
      }) => ({
        url: `/charge/charge_calculator?delivery_area_id=${deliveryAreaId}&pickup_area_id=${pickupAreaId}&cash_collection_amount=${cashCollectionAmount}&weight=${weight}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateParcelMutation,
  useTrackParcelQuery,
  useLazyTrackParcelQuery,
  useGetParcelInfoQuery,
  useLazyGetParcelInfoQuery,
  useGetAreasQuery,
  useGetAreasByPostCodeQuery,
  useGetAreasByDistrictQuery,
  useCreatePickupStoreMutation,
  useGetPickupStoresQuery,
  useLazyCalculateChargeQuery,
} = redxApiSlice;
