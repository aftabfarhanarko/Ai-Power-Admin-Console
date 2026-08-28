import { apiSlice } from "../api/apiSlice";

export const securityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Audit Logs
    getAuditLogs: builder.query({
      query: ({ page = 1, limit = 20, search = "" } = {}) => ({
        url: `/superadmin/security/audit-logs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
        method: "GET",
      }),
      providesTags: [{ type: "security", id: "AUDIT" }],
    }),

    // IP Whitelist
    getIpWhitelist: builder.query({
      query: () => ({ url: "/superadmin/security/ip-whitelist", method: "GET" }),
      providesTags: [{ type: "security", id: "WHITELIST" }],
    }),

    addIpToWhitelist: builder.mutation({
      query: (body) => ({
        url: "/superadmin/security/ip-whitelist",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "security", id: "WHITELIST" }],
    }),

    removeIpFromWhitelist: builder.mutation({
      query: (id) => ({
        url: `/superadmin/security/ip-whitelist/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "security", id: "WHITELIST" }],
    }),

    // GDPR Requests
    getGdprRequests: builder.query({
      query: ({ status = "" } = {}) => ({
        url: `/superadmin/security/gdpr-requests${status ? `?status=${status}` : ""}`,
        method: "GET",
      }),
      providesTags: [{ type: "security", id: "GDPR" }],
    }),

    createGdprRequest: builder.mutation({
      query: (body) => ({
        url: "/superadmin/security/gdpr-requests",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "security", id: "GDPR" }],
    }),

    updateGdprRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/superadmin/security/gdpr-requests/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [{ type: "security", id: "GDPR" }],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetIpWhitelistQuery,
  useAddIpToWhitelistMutation,
  useRemoveIpFromWhitelistMutation,
  useGetGdprRequestsQuery,
  useCreateGdprRequestMutation,
  useUpdateGdprRequestMutation,
} = securityApiSlice;
