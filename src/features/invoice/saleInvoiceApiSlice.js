import { apiSlice } from "../api/apiSlice";

export const saleInvoiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all sale invoices
    getSaleInvoices: builder.query({
      query: (params) => ({ url: "/sale-invoices", method: "GET", params }),
      transformResponse: (res) => res?.data || res,
      providesTags: [{ type: "saleInvoice", id: "LIST" }],
    }),

    // Get single sale invoice
    getSaleInvoice: builder.query({
      query: ({ id, ...params }) => ({ url: `/sale-invoices/${id}`, method: "GET", params }),
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, { id }) => [{ type: "saleInvoice", id }],
    }),

    // Create sale invoice
    createSaleInvoice: builder.mutation({
      query: ({ companyId, ...body }) => ({
        url: "/sale-invoices",
        method: "POST",
        params: { companyId },
        body,
      }),
      invalidatesTags: [{ type: "saleInvoice", id: "LIST" }],
    }),

    // Send invoice as PDF to customer email
    sendInvoiceEmail: builder.mutation({
      query: ({ id, companyId, pdfBase64 }) => ({
        url: `/sale-invoices/${id}/send-email`,
        method: "POST",
        params: { companyId },
        body: { pdfBase64 },
      }),
    }),

    // Update sale invoice (status, deliveryStatus, fulfillmentStatus)
    updateSaleInvoice: builder.mutation({
      query: ({ id, companyId, ...body }) => ({
        url: `/sale-invoices/${id}`,
        method: "PATCH",
        params: { companyId },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "saleInvoice", id: "LIST" },
        { type: "saleInvoice", id },
      ],
    }),

    // Delete sale invoice
    deleteSaleInvoice: builder.mutation({
      query: ({ id, companyId }) => ({
        url: `/sale-invoices/${id}`,
        method: "DELETE",
        params: { companyId },
      }),
      invalidatesTags: [{ type: "saleInvoice", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSaleInvoicesQuery,
  useGetSaleInvoiceQuery,
  useCreateSaleInvoiceMutation,
  useUpdateSaleInvoiceMutation,
  useSendInvoiceEmailMutation,
  useDeleteSaleInvoiceMutation,
} = saleInvoiceApiSlice;
