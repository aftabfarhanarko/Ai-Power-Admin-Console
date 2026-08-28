import { apiSlice } from "../api/apiSlice";

export const earningsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get earnings overview
    getEarningsOverview: builder.query({
      query: (params) => ({ url: "/earnings", method: "GET", params }),
      transformResponse: (res) => res,
      providesTags: [{ type: "earnings", id: "OVERVIEW" }],
    }),
  }),
});

export const {
  useGetEarningsOverviewQuery,
} = earningsApiSlice;








