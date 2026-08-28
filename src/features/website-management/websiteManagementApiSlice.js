import { apiSlice } from "../api/apiSlice";

/**
 * RTK Query slice for Managing Landing Page Content.
 * Used by Super Admins to make the website dynamic.
 */
export const websiteManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all landing page content sections
    getLandingPageContent: builder.query({
      query: () => ({
        url: `/landing-page/content`,
        method: "GET",
      }),
      providesTags: ["LandingPageContent"],
      transformResponse: (response) => response?.data || [],
    }),

    // Fetch a specific section by key
    getLandingPageSection: builder.query({
      query: (key) => ({
        url: `/landing-page/content/${key}`,
        method: "GET",
      }),
      providesTags: (result, error, key) => [{ type: "LandingPageContent", id: key }],
      transformResponse: (response) => response?.data?.content || response?.data || {},
    }),

    // Update landing page section content
    updateLandingPageContent: builder.mutation({
      query: (data) => ({
        url: `/landing-page/content`,
        method: "PATCH",
        body: data, // { key, content }
      }),
      invalidatesTags: (result, error, { key }) => [
        "LandingPageContent",
        { type: "LandingPageContent", id: key }
      ],
    }),
  }),
});

export const {
  useGetLandingPageContentQuery,
  useGetLandingPageSectionQuery,
  useUpdateLandingPageContentMutation,
} = websiteManagementApiSlice;
