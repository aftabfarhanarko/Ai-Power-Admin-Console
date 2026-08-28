import { apiSlice } from "../api/apiSlice";

export const bannersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBanner: builder.mutation({
      query: ({ body, params }) => ({
        url: "/banners",
        method: "POST",
        body,
        params,
      }),
      invalidatesTags: [{ type: "banners", id: "LIST" }],
    }),

    getBanners: builder.query({
      query: (params) => ({ url: "/banners", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "banners", id: "LIST" }],
    }),

    getBanner: builder.query({
      query: (id) => ({ url: `/banners/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "banners", id }],
    }),

    updateBanner: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/banners/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "banners", id },
        { type: "banners", id: "LIST" },
      ],
    }),

    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "banners", id: "LIST" }],
    }),

  }),
});

export const {
  useGetBannersQuery,
  useGetBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannersApiSlice;
