import { apiSlice } from "../api/apiSlice";

export const themeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all themes
    getThemes: builder.query({
      query: () => ({ url: "/theme", method: "GET" }),
      transformResponse: (res) => res?.data || res,
      providesTags: [{ type: "theme", id: "LIST" }],
    }),

    // Get single theme
    getTheme: builder.query({
      query: (id) => ({ url: `/theme/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "theme", id }],
    }),

    // Create theme
    createTheme: builder.mutation({
      query: (body) => ({
        url: "/theme",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "theme", id: "LIST" }],
    }),

    // Update theme
    updateTheme: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/theme/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "theme", id },
        { type: "theme", id: "LIST" },
      ],
    }),

    // Delete theme
    deleteTheme: builder.mutation({
      query: (id) => ({ url: `/theme/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "theme", id: "LIST" }],
    }),
  }),
});

export const {
  useGetThemesQuery,
  useGetThemeQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useDeleteThemeMutation,
} = themeApiSlice;
