import { apiSlice } from "../api/apiSlice";

export const invoiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all invoices
    getInvoices: builder.query({
      query: (params) => ({ url: "/invoice", method: "GET", params }),
      transformResponse: (res) => res?.data || res,
      providesTags: [{ type: "invoice", id: "LIST" }],
    }),

    // Get single invoice
    getInvoice: builder.query({
      query: (id) => ({ url: `/invoice/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "invoice", id }],
    }),

    // Create invoice
    createInvoice: builder.mutation({
      query: (body) => ({
        url: "/invoice",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "invoice", id: "LIST" }],
    }),

    // Update invoice
    updateInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/invoice/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "invoice", id },
        { type: "invoice", id: "LIST" },
      ],
    }),

    // Delete invoice
    deleteInvoice: builder.mutation({
      query: (id) => ({ url: `/invoice/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "invoice", id: "LIST" }],
    }),

    // Verify bank payment (updates invoice to PAID and applies package upgrade)
    verifyBankPayment: builder.mutation({
      query: (id) => ({
        url: `/invoice/payment/bank/verify/${id}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "invoice", id },
        { type: "invoice", id: "LIST" },
        "my-profile",
      ],
    }),

    // Reject bank payment
    rejectBankPayment: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/invoice/payment/bank/reject/${id}`,
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: reason ? { reason } : {},
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "invoice", id },
        { type: "invoice", id: "LIST" },
      ],
    }),

    // Initiate bKash payment
    initiateBkashPayment: builder.mutation({
      query: (body) => ({
        url: "/invoice/payment/bkash/initiate",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "invoice", id: invoiceId },
        { type: "invoice", id: "LIST" },
      ],
    }),

    // Execute bKash payment
    executeBkashPayment: builder.mutation({
      query: (paymentID) => ({
        url: `/invoice/payment/bkash/execute/${paymentID}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "invoice", id: "LIST" }],
    }),

    // Submit bank payment
    submitBankPayment: builder.mutation({
      query: (body) => ({
        url: "/invoice/payment/bank",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: "invoice", id: invoiceId },
        { type: "invoice", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useVerifyBankPaymentMutation,
  useRejectBankPaymentMutation,
  useInitiateBkashPaymentMutation,
  useExecuteBkashPaymentMutation,
  useSubmitBankPaymentMutation,
} = invoiceApiSlice;
