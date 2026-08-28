import { apiSlice } from "../api/apiSlice";

export const packageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all packages
    getPackages: builder.query({
      query: () => ({ url: "/package", method: "GET" }),
      // API response: { statusCode: 200, message: "...", data: [ { id, name, description, price, discountPrice, features, ... } ] }
      transformResponse: (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray(res?.packages)) return res.packages;
        return [];
      },
      providesTags: [{ type: "package", id: "LIST" }],
    }),

    // Get single package
    getPackage: builder.query({
      query: (id) => ({ url: `/package/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "package", id }],
    }),

    // Create package
    createPackage: builder.mutation({
      query: (body) => ({
        url: "/package",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "package", id: "LIST" }],
    }),

    // Update package
    updatePackage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "package", id },
        { type: "package", id: "LIST" },
      ],
    }),

    // Delete package
    deletePackage: builder.mutation({
      query: (id) => ({ url: `/package/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "package", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageApiSlice;
