import { apiSlice } from "../api/apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: (params) => ({ url: "/dashboard", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "DATA" }],
    }),
    getStats: builder.query({
      query: (params) => ({ url: "/dashboard/stats", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "STATS" }],
    }),
    getCategoryStats: builder.query({
      query: (params) => ({ url: "/dashboard/categories-stats", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "CATEGORY_STATS" }],
    }),
    getAiReport: builder.query({
      query: (params) => ({ url: "/dashboard/ai-report", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "AI_REPORT" }],
    }),
    translateReport: builder.mutation({
      query: (body) => ({
        url: "/dashboard/ai-report/translate",
        method: "POST",
        body,
      }),
      transformResponse: (res) => res?.data ?? {},
    }),
    getAiLiveMessages: builder.query({
      query: (params) => ({ url: "/dashboard/ai-messages", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "AI_LIVE" }],
    }),
    getAiSalesDirection: builder.query({
      query: (params) => ({ url: "/dashboard/ai-sales-direction", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "AI_SALES" }],
    }),
    getStatistics: builder.query({
      query: (params) => ({ url: "/dashboard/statistics", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "STATISTICS" }],
    }),
    suggestDescription: builder.mutation({
      query: ({ body, params }) => ({
        url: "/dashboard/ai-suggest-description",
        method: "POST",
        body: body || {},
        params,
      }),
      transformResponse: (res) => res?.data ?? {},
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetStatsQuery,
  useGetCategoryStatsQuery,
  useGetAiReportQuery,
  useGetAiLiveMessagesQuery,
  useGetAiSalesDirectionQuery,
  useGetStatisticsQuery,
  useSuggestDescriptionMutation,
  useTranslateReportMutation,
} = dashboardApiSlice;





