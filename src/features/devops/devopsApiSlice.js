import { apiSlice } from "../api/apiSlice";

export const devopsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTenant: builder.mutation({
      query: (data) => ({
        url: "/devops/tenant",
        method: "POST",
        body: data,
      }),
    }),
    addCustomDomain: builder.mutation({
      query: ({ id, domain }) => ({
        url: `/settings/domain`,
        method: "POST",
        body: { customDomain: domain },
      }),
    }),
    getDomain: builder.query({
      query: () => ({
        url: `/settings/domain`,
        method: "GET",
      }),
    }),
    verifyDomain: builder.mutation({
      query: () => ({
        url: `/settings/domain/verify`,
        method: "POST",
      }),
    }),
    toggleSubdomain: builder.mutation({
      query: (enabled) => ({
        url: `/settings/domain/subdomain/toggle`,
        method: "POST",
        body: { enabled },
      }),
    }),
  }),
});

export const { 
  useCreateTenantMutation, 
  useAddCustomDomainMutation,
  useGetDomainQuery,
  useVerifyDomainMutation,
  useToggleSubdomainMutation,
} = devopsApiSlice;
