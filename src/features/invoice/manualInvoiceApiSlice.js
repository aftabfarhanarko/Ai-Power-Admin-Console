import { apiSlice } from "../api/apiSlice";

export const manualInvoiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all manual invoices
    getManualInvoices: builder.query({
      query: (params) => ({
        url: "/manual-invoice",
        method: "GET",
        params,
      }),
      transformResponse: (res) => res?.data || res,
      providesTags: [{ type: "manualInvoice", id: "LIST" }],
    }),

    // Get single manual invoice
    getManualInvoice: builder.query({
      query: ({ id, ...params }) => ({
        url: `/manual-invoice/${id}`,
        method: "GET",
        params,
      }),
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, { id }) => [{ type: "manualInvoice", id }],
    }),

    // Create manual invoice
    createManualInvoice: builder.mutation({
      query: ({ companyId, ...body }) => ({
        url: "/manual-invoice",
        method: "POST",
        params: { companyId },
        body,
      }),
      invalidatesTags: [{ type: "manualInvoice", id: "LIST" }],
    }),

    // Update manual invoice
    updateManualInvoice: builder.mutation({
      query: ({ id, companyId, ...body }) => ({
        url: `/manual-invoice/${id}`,
        method: "PATCH",
        params: { companyId },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "manualInvoice", id: "LIST" },
        { type: "manualInvoice", id },
      ],
    }),

    // Delete manual invoice
    deleteManualInvoice: builder.mutation({
      query: ({ id, companyId }) => ({
        url: `/manual-invoice/${id}`,
        method: "DELETE",
        params: { companyId },
      }),
      invalidatesTags: [{ type: "manualInvoice", id: "LIST" }],
    }),
  }),
});

export const {
  useGetManualInvoicesQuery,
  useGetManualInvoiceQuery,
  useCreateManualInvoiceMutation,
  useUpdateManualInvoiceMutation,
  useDeleteManualInvoiceMutation,
} = manualInvoiceApiSlice;
