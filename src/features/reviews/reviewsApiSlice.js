import { apiSlice } from "../api/apiSlice";

export const reviewsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: (params) => ({ url: "/reviews", method: "GET", params }),
      transformResponse: (res) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "reviews", id: "LIST" }],
    }),
    getReviewById: builder.query({
      query: ({ id, companyId }) => ({
        url: `/reviews/${id}`,
        method: "GET",
        params: { companyId },
      }),
      providesTags: (result, error, { id }) => [
        { type: "reviews", id },
        { type: "reviews", id: "LIST" },
      ],
    }),
    replyReview: builder.mutation({
      query: ({ id, body }) => ({
        url: `/reviews/${id}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "reviews", id },
        { type: "reviews", id: "LIST" },
      ],
    }),
    createReview: builder.mutation({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "reviews", id: "LIST" }],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useReplyReviewMutation,
  useCreateReviewMutation,
} = reviewsApiSlice;
