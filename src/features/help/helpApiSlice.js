import { apiSlice } from "../api/apiSlice";

export const helpApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createHelp: builder.mutation({
      query: (body) => ({
        url: "/help",
        method: "POST",
        body,
      }),
      transformResponse: (res) => res,
      invalidatesTags: [{ type: "help", id: "LIST" }],
    }),
    getHelp: builder.query({
      query: (params) => ({ url: "/help", method: "GET", params }),
      transformResponse: (res) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "help", id: "LIST" }],
    }),
    getHelpStats: builder.query({
      query: (params) => ({ url: "/help/stats", method: "GET", params }),
      providesTags: [{ type: "help", id: "LIST" }],
    }),
    getHelpById: builder.query({
      query: (id) => ({ url: `/help/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "help", id }, { type: "help", id: "LIST" }],
    }),
    addHelpReply: builder.mutation({
      query: ({ id, body }) => ({
        url: `/help/${id}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "help", id },
        { type: "help", id: "LIST" },
      ],
    }),
    updateHelp: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/help/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      transformResponse: (res) => res,
      invalidatesTags: (result, error, { id }) => [
        { type: "help", id },
        { type: "help", id: "LIST" },
      ],
    }),
    deleteHelp: builder.mutation({
      query: (id) => ({ url: `/help/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "help", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHelpQuery,
  useGetHelpStatsQuery,
  useGetHelpByIdQuery,
  useCreateHelpMutation,
  useUpdateHelpMutation,
  useDeleteHelpMutation,
  useAddHelpReplyMutation,
} = helpApiSlice;