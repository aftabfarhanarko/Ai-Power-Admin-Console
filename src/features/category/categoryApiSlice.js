import { apiSlice } from "../api/apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      
    // createCategory 
    createCategory: builder.mutation({
      query: ({ body, params }) => ({
        url: "/categories",
        method: "POST",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: [{ type: "categories", id: "LIST" }],
    }),
        
    getCategories: builder.query({
      query: (params) => ({ url: "/categories", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [], // ✅ safe response
      providesTags: [{ type: "categories", id: "LIST" }],
    }),

    // Get trashed categories
    getTrashedCategories: builder.query({
      query: (params) => ({ url: "/categories/trash", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "categories", id: "TRASH" }],
    }),

    getCategory: builder.query({
      query: (id) => ({ url: `/categories/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "categories", id }],
    }),

    updateCategory: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "categories", id },
        { type: "categories", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "categories", id: "LIST" },
        { type: "categories", id: "TRASH" },
      ],
    }),

    restoreCategory: builder.mutation({
      query: ({ id, params }) => ({
        url: `/categories/${id}/restore`,
        method: "PATCH",
        params,
      }),
      invalidatesTags: [
        { type: "categories", id: "LIST" },
        { type: "categories", id: "TRASH" },
      ],
    }),

    toggleCategoryActive: builder.mutation({
      query: ({ id, active }) => ({
        url: `/categories/${id}/toggle-active${
          active !== undefined ? `?active=${active}` : ""
        }`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "categories", id },
        { type: "categories", id: "LIST" },
      ],
    }),
    }),
    

});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
  useGetTrashedCategoriesQuery,
  useRestoreCategoryMutation,
} = categoryApiSlice;
