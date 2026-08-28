import { apiSlice } from "../api/apiSlice";

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendCustomerEmailNotification: builder.mutation({
      query: ({ subject, body, html, customerIds }) => ({
        url: "/notifications/email/customers",
        method: "POST",
        body: {
          subject,
          body,
          ...(html ? { html } : {}),
          ...(customerIds?.length ? { customerIds } : {}),
        },
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
    }),
    sendCustomerSmsNotification: builder.mutation({
      query: ({ message, customerIds }) => ({
        url: "/notifications/sms/customers",
        method: "POST",
        body: {
          message,
          ...(customerIds?.length ? { customerIds } : {}),
        },
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
    }),
    getAllNotifications: builder.query({
      query: ({ type, companyId } = {}) => ({
        url: "/notifications",
        method: "GET",
        params: {
          ...(type && { type }),
          ...(companyId && { companyId }),
        },
        headers: { 
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        // Extract data array from response
        return response?.data || [];
      },
      providesTags: ['Notifications'],
    }),
    getOrderCreatedNotifications: builder.query({
      query: (companyId) => ({
        url: "/notifications/order-created",
        method: "GET",
        params: companyId ? { companyId } : {},
        headers: { 
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        // Extract data array from response and return only recent 5
        const notifications = response?.data || [];
        return notifications.slice(0, 5);
      },
      providesTags: ['Notifications'],
    }),
    getOrderStatusNotifications: builder.query({
      query: (companyId) => ({
        url: "/notifications/order-status",
        method: "GET",
        params: companyId ? { companyId } : {},
        headers: { 
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: ['Notifications'],
    }),
    getNewCustomerNotifications: builder.query({
      query: (companyId) => ({
        url: "/notifications/new-customers",
        method: "GET",
        params: companyId ? { companyId } : {},
        headers: { 
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: ['Notifications'],
    }),
    getLowStockNotifications: builder.query({
      query: (companyId) => ({
        url: "/notifications/low-stock",
        method: "GET",
        params: companyId ? { companyId } : {},
        headers: { 
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        return response?.data || [];
      },
      providesTags: ['Notifications'],
    }),
    markNotificationAsRead: builder.mutation({
      query: ({ id, companyId }) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
        params: companyId ? { companyId } : {},
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsAsRead: builder.mutation({
      query: (companyId) => ({
        url: "/notifications/mark-all-read",
        method: "PATCH",
        params: companyId ? { companyId } : {},
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useSendCustomerEmailNotificationMutation,
  useSendCustomerSmsNotificationMutation,
  useGetAllNotificationsQuery,
  useGetOrderCreatedNotificationsQuery,
  useGetOrderStatusNotificationsQuery,
  useGetNewCustomerNotificationsQuery,
  useGetLowStockNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationsApiSlice;

