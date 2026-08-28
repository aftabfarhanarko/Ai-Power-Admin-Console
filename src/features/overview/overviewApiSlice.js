import { apiSlice } from "../api/apiSlice";

export const overviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get overview statistics
    getOverview: builder.query({
      query: () => ({ url: "/overview", method: "GET" }),
      transformResponse: (res) => res,
      providesTags: [{ type: "overview", id: "OVERVIEW" }],
    }),
  }),
});

export const {
  useGetOverviewQuery,
} = overviewApiSlice;

