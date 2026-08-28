import { apiSlice } from "../api/apiSlice";

export const creditNoteApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all credit notes for a specific company
     */
    getCreditNotes: builder.query({
      query: (companyId) => ({
        url: `/credit-notes?companyId=${companyId}`,
        method: "GET",
      }),
      providesTags: ["CreditNote"],
    }),

    /**
     * Get a single credit note detail
     */
    getCreditNote: builder.query({
      query: ({ id, companyId }) => ({
        url: `/credit-notes/${id}?companyId=${companyId}`,
        method: "GET",
      }),
      providesTags: (result, error, { id }) => [{ type: "CreditNote", id }],
    }),

    /**
     * Create a new credit note
     */
    createCreditNote: builder.mutation({
      query: (data) => ({
        url: "/credit-notes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CreditNote"],
    }),

    /**
     * Delete a credit note
     */
    deleteCreditNote: builder.mutation({
      query: ({ id, companyId }) => ({
        url: `/credit-notes/${id}?companyId=${companyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CreditNote"],
    }),
  }),
});

export const {
  useGetCreditNotesQuery,
  useGetCreditNoteQuery,
  useCreateCreditNoteMutation,
  useDeleteCreditNoteMutation,
} = creditNoteApiSlice;
