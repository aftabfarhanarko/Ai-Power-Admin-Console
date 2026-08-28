import { apiSlice } from "../api/apiSlice";

export const promocodeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create promocode
    createPromocode: builder.mutation({
      query: (body) => ({
        url: "/promocode",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "promocode", id: "LIST" }],
    }),

    // Get all promocodes
    getPromocodes: builder.query({
      query: (params) => ({ url: "/promocode", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "promocode", id: "LIST" }],
    }),

    // Get single promocode by id
    getPromocode: builder.query({
      query: (id) => ({ url: `/promocode/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "promocode", id }],
    }),

    // Update promocode by id
    updatePromocode: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/promocode/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "promocode", id },
        { type: "promocode", id: "LIST" },
      ],
    }),

    // Delete promocode by id
    deletePromocode: builder.mutation({
      query: (id) => ({
        url: `/promocode/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "promocode", id: "LIST" }],
    }),

    // Toggle active state with explicit target state
    togglePromocodeActive: builder.mutation({
      query: ({ id, active }) => ({
        url: `/promocode/${id}/toggle-active?active=${active}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "promocode", id },
        { type: "promocode", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPromocodesQuery,
  useGetPromocodeQuery,
  useCreatePromocodeMutation,
  useUpdatePromocodeMutation,
  useDeletePromocodeMutation,
  useTogglePromocodeActiveMutation,
} = promocodeApiSlice;