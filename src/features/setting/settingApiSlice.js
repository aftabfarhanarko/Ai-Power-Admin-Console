import { apiSlice } from "../api/apiSlice";

export const settingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSetting: builder.mutation({
      query: (body) => ({
        url: "/setting",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "settings", id: "LIST" }],
    }),

    getSettings: builder.query({
      query: (params) => ({ url: "/setting", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "settings", id: "LIST" }],
    }),

    getSetting: builder.query({
      query: (id) => ({ url: `/setting/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "settings", id }],
    }),

    updateSetting: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/setting/${id}`,
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "settings", id },
        { type: "settings", id: "LIST" },
      ],
    }),

    deleteSetting: builder.mutation({
      query: (id) => ({
        url: `/setting/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "settings", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetSettingQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useDeleteSettingMutation,
} = settingApiSlice;