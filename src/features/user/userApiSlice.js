import { apiSlice } from "../api/apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List users
    getUsers: builder.query({
      query: (params) => ({ url: "/users", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "users", id: "LIST" }],
    }),

    // Get single user
    getUser: builder.query({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "users", id }],
    }),

    // Create user
    createUser: builder.mutation({
      query: ({ body, params }) => ({
        url: "/users",
        method: "POST",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: [{ type: "users", id: "LIST" }],
    }),

    // Update user
    updateUser: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "users", id },
        { type: "users", id: "LIST" },
      ],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "users", id: "LIST" }],
    }),

    // Ban user
    banUser: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/users/${id}/ban`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "users", id },
        { type: "users", id: "LIST" },
      ],
    }),

    // Unban user
    unbanUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/unban`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "users", id },
        { type: "users", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
} = userApiSlice;