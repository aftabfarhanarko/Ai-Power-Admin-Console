import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSuperadminTokens } from "@/features/superadminAuth/superadminAuthSlice";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL;

// Base query with superadmin Authorization header
const superadminBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getSuperadminTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

export const superadminApiSlice = createApi({
  reducerPath: "superadminApi",
  baseQuery: superadminBaseQuery,
  tagTypes: ["superadmin", "superadminHelp"],
  endpoints: (builder) => ({
    // List all superadmins
    getSuperadmins: builder.query({
      query: () => ({ url: "/superadmin", method: "GET" }),
      transformResponse: (res) => res || [],
      providesTags: [{ type: "superadmin", id: "LIST" }],
    }),

    // Get single superadmin
    getSuperadmin: builder.query({
      query: (id) => ({ url: `/superadmin/${id}`, method: "GET" }),
      transformResponse: (res) => res,
      providesTags: (result, error, id) => [{ type: "superadmin", id }],
    }),

    // Create superadmin
    createSuperadmin: builder.mutation({
      query: (body) => ({
        url: "/superadmin",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "superadmin", id: "LIST" }],
    }),

    // Update superadmin
    updateSuperadmin: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/superadmin/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "superadmin", id },
        { type: "superadmin", id: "LIST" },
      ],
    }),

    // Delete superadmin
    deleteSuperadmin: builder.mutation({
      query: (id) => ({ url: `/superadmin/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "superadmin", id: "LIST" }],
    }),

    // Superadmin Help/Support
    getSuperadminHelp: builder.query({
      query: () => ({ url: "/superadmin-support", method: "GET" }),
      transformResponse: (res) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "superadminHelp", id: "LIST" }],
    }),
    getSuperadminHelpById: builder.query({
      query: (id) => ({ url: `/superadmin-support/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [
        { type: "superadminHelp", id },
        { type: "superadminHelp", id: "LIST" },
      ],
    }),
    addSuperadminHelpReply: builder.mutation({
      query: ({ id, body }) => ({
        url: `/superadmin-support/${id}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "superadminHelp", id },
        { type: "superadminHelp", id: "LIST" },
      ],
    }),
    updateSuperadminHelp: builder.mutation({
      query: ({ id, body }) => ({
        url: `/superadmin-support/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "superadminHelp", id },
        { type: "superadminHelp", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSuperadminsQuery,
  useGetSuperadminQuery,
  useCreateSuperadminMutation,
  useUpdateSuperadminMutation,
  useDeleteSuperadminMutation,
  useGetSuperadminHelpQuery,
  useGetSuperadminHelpByIdQuery,
  useAddSuperadminHelpReplyMutation,
  useUpdateSuperadminHelpMutation,
} = superadminApiSlice;
