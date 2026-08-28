import { apiSlice } from "../api/apiSlice";

export const systemuserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List system users
    getSystemusers: builder.query({
      query: () => ({ url: "/systemuser", method: "GET" }),
      transformResponse: (res) => res,
      providesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Get single system user
    getSystemuser: builder.query({
      query: (id) => ({ url: `/systemuser/${id}`, method: "GET" }),
      transformResponse: (res) => res,
      providesTags: (result, error, id) => [{ type: "systemuser", id }],
    }),

    // Create system user
    createSystemuser: builder.mutation({
      query: (body) => ({
        url: "/systemuser",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Update system user
    updateSystemuser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/systemuser/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "systemuser", id },
        { type: "systemuser", id: "LIST" },
        "my-profile",
      ],
    }),

    // Delete system user
    deleteSystemuser: builder.mutation({
      query: (id) => ({ url: `/systemuser/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Optional: login endpoint if needed
    loginSystemuser: builder.mutation({
      query: (body) => ({
        url: "/systemuser/login",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
    }),

    // Revert package to previous (fallback when payment fails/cancelled)
    revertPackage: builder.mutation({
      query: (id) => ({
        url: `/systemuser/${id}/revert-package`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "systemuser", id },
        { type: "systemuser", id: "LIST" },
        "my-profile",
      ],
    }),

    // Assign permissions to system user
    assignPermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/systemuser/${id}/permissions`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: { permissions },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "systemuser", id },
        { type: "systemuser", id: "LIST" },
      ],
    }),

    // Get permissions for system user
    getPermissions: builder.query({
      query: (id) => ({ url: `/systemuser/${id}/permissions`, method: "GET" }),
      transformResponse: (res) => res.data,
      providesTags: (result, error, id) => [{ type: "systemuser", id: `permissions-${id}` }],
    }),

    // System Owner: Create System Owner
    createSystemOwner: builder.mutation({
      query: (body) => ({
        url: "/systemuser/create-system-owner",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Get activity logs
    getActivityLogs: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.performedByUserId) queryParams.append('performedByUserId', params.performedByUserId);
        if (params.targetUserId) queryParams.append('targetUserId', params.targetUserId);
        if (params.action) queryParams.append('action', params.action);
        if (params.entity) queryParams.append('entity', params.entity);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.offset) queryParams.append('offset', params.offset);
        const queryString = queryParams.toString();
        return {
          url: `/systemuser/activity-logs${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
      transformResponse: (res) => res,
      providesTags: [{ type: "activityLog", id: "LIST" }],
    }),

    // Get single activity log
    getActivityLogById: builder.query({
      query: (id) => ({ url: `/systemuser/activity-logs/${id}`, method: "GET" }),
      transformResponse: (res) => res,
      providesTags: (result, error, id) => [{ type: "activityLog", id }],
    }),
  }),
});

export const {
  useGetSystemusersQuery,
  useGetSystemuserQuery,
  useCreateSystemuserMutation,
  useUpdateSystemuserMutation,
  useDeleteSystemuserMutation,
  useLoginSystemuserMutation,
  useRevertPackageMutation,
  useAssignPermissionsMutation,
  useGetPermissionsQuery,
  useCreateSystemOwnerMutation,
  useGetActivityLogsQuery,
  useGetActivityLogByIdQuery,
} = systemuserApiSlice;