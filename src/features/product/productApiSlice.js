import { apiSlice } from "../api/apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create product
    createProduct: builder.mutation({
      query: ({ body, params }) => ({
        url: "/products",
        method: "POST",
        body,
        params,
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "DRAFTS" },
      ],
    }),

    // Get all products
    getProducts: builder.query({
      query: (params) => ({ url: "/products", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "products", id: "LIST" }],
    }),

    // Get draft products
    getDraftProducts: builder.query({
      query: (params) => ({ url: "/products/drafts", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "products", id: "DRAFTS" }],
    }),

    // Get trashed products
    getTrashedProducts: builder.query({
      query: (params) => ({ url: "/products/trash", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "products", id: "TRASH" }],
    }),

    // Get single product by id
    getProduct: builder.query({
      query: (id) => ({ url: `/products/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "products", id }],
    }),

    // Update product by id
    updateProduct: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "products", id },
        { type: "products", id: "LIST" },
        { type: "products", id: "DRAFTS" },
        { type: "products", id: "TRASH" },
      ],
    }),

    // Delete product by id (moves to trash)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "TRASH" },
      ],
    }),

    // Recover product from trash
    recoverProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/recover`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "TRASH" },
      ],
    }),

    // Permanently delete product from trash
    permanentDeleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "TRASH" },
      ],
    }),

    // Publish draft product
    publishDraft: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "DRAFTS" },
      ],
    }),

    // Toggle product active status (optional, if supported by backend)
    toggleProductActive: builder.mutation({
      query: ({ id, active }) => ({
        url: `/products/${id}/toggle-active${active !== undefined ? `?active=${active}` : ""}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "products", id },
        { type: "products", id: "LIST" },
        { type: "products", id: "DRAFTS" },
      ],
    }),

    // Set flash sell for products
    setFlashSell: builder.mutation({
      query: (body) => ({
        url: "/products/flash-sell",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "FLASH_SELL" },
      ],
    }),

    // Remove flash sell from products
    removeFlashSell: builder.mutation({
      query: (body) => ({
        url: "/products/flash-sell",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        { type: "products", id: "LIST" },
        { type: "products", id: "FLASH_SELL" },
      ],
    }),

    // Get active flash sell products
    getActiveFlashSellProducts: builder.query({
      query: (params) => ({ url: "/products/flash-sell/active", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "products", id: "FLASH_SELL" }],
    }),

    // Bulk upload products
    bulkUploadProducts: builder.mutation({
      query: ({ file, params }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/products/bulk-upload",
          method: "POST",
          body: formData,
          params,
        };
      },
      invalidatesTags: [{ type: "products", id: "LIST" }],
    }),

    // Get stock adjustment history for a product
    getProductStockHistory: builder.query({
      query: ({ id, params }) => ({
        url: `/products/${id}/stock-history`,
        method: "GET",
        params,
      }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: (result, error, { id }) => [
        { type: "products", id },
        { type: "products", id: `STOCK_HISTORY_${id}` },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
  useSetFlashSellMutation,
  useRemoveFlashSellMutation,
  useGetActiveFlashSellProductsQuery,
  useBulkUploadProductsMutation,
  useGetDraftProductsQuery,
  useGetTrashedProductsQuery,
  useRecoverProductMutation,
  usePublishDraftMutation,
  usePermanentDeleteProductMutation,
  useGetProductStockHistoryQuery,
} = productApiSlice;