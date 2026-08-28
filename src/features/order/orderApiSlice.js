import { apiSlice } from "../api/apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      // expects { body, params }
      query: ({ body, params }) => ({
        url: "/orders",
        method: "POST",
        body,
        params,
      }),
      invalidatesTags: [{ type: "orders", id: "LIST" }, { type: "orders", id: "STATS" }, "Notifications"],
    }),
    getOrders: builder.query({
      query: (params) => ({ url: "/orders", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "orders", id: "LIST" }],
    }),
    getOrdersByCustomer: builder.query({
      // expects { customerId, params }
      query: ({ customerId, params }) => ({
        url: `/orders/customer/${customerId}`,
        method: "GET",
        params,
      }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result, error, { customerId }) => [
        { type: "orders", id: `customer-${customerId}` },
      ],
    }),
    getOrderStats: builder.query({
      query: (params) => ({ url: "/orders/stats", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "orders", id: "STATS" }],
    }),
    getOrder: builder.query({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "orders", id }],
    }),
    // Public order tracking by tracking number (no auth required)
    trackOrder: builder.query({
      query: (trackingId) => ({
        url: `/orders/track/${encodeURIComponent(trackingId)}`,
        method: "GET",
      }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, trackingId) => [
        { type: "orders", id: `track-${trackingId}` },
      ],
    }),
    // Unified tracking: RedX → Steadfast → Pathao → SquadCart
    trackOrderUnified: builder.query({
      query: (trackingId) => ({
        url: `/track/${encodeURIComponent(trackingId)}`,
        method: "GET",
      }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, trackingId) => [
        { type: "orders", id: `track-unified-${trackingId}` },
      ],
    }),
    completeOrder: builder.mutation({
      // expects { id, body, params }
      query: ({ id, body, params }) => ({
        url: `/orders/${id}/complete`,
        method: "PATCH",
        body,
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    recordPartialPayment: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/orders/${id}/partial-payment`,
        method: "PATCH",
        body,
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    processOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}/process`, method: "PATCH", params }),
      invalidatesTags: (result, error, arg) => [
        { type: "orders", id: arg?.id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    deliverOrder: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/orders/${id}/deliver`,
        method: "PATCH",
        body,
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    shipOrder: builder.mutation({
      // expects { id, body, params }
      query: ({ id, body, params }) => ({
        url: `/orders/${id}/ship`,
        method: "PATCH",
        body,
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    cancelOrder: builder.mutation({
      query: ({ id, body, params }) => ({ url: `/orders/${id}/cancel`, method: "PATCH", body, params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    refundOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}/refund`, method: "PATCH", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    deleteOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}`, method: "DELETE", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
        { type: "orders", id: "STATS" },
      ],
    }),
    barcodeScan: builder.mutation({
      query: ({ body, params }) => ({
        url: "/orders/barcode-scan",
        method: "POST",
        body: body || {},
        params,
      }),
      invalidatesTags: [{ type: "orders", id: "LIST" }, { type: "activityLog", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersByCustomerQuery,
  useGetOrderStatsQuery,
  useGetOrderQuery,
  useTrackOrderQuery,
  useLazyTrackOrderQuery,
  useTrackOrderUnifiedQuery,
  useLazyTrackOrderUnifiedQuery,
  useCreateOrderMutation,
  useCompleteOrderMutation,
  useRecordPartialPaymentMutation,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
  useBarcodeScanMutation,
} = orderApiSlice;