import { apiSlice } from "../api/apiSlice";

export const termsConditionsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create terms & conditions
        createTermsConditions: builder.mutation({
            query: ({ body, params }) => ({
                url: "/trems-condetions",
                method: "POST",
                body,
                params,
            }),
            invalidatesTags: [{ type: "termsConditions", id: "LIST" }],
        }),

        // Get all terms & conditions
        getTermsConditions: builder.query({
            query: (params) => ({ url: "/trems-condetions", method: "GET", params }),
            transformResponse: (res) => res?.data ?? [],
            providesTags: [{ type: "termsConditions", id: "LIST" }],
        }),

        // Get single terms & conditions by id
        getTermsCondition: builder.query({
            query: (id) => ({ url: `/trems-condetions/${id}`, method: "GET" }),
            transformResponse: (res) => res?.data,
            providesTags: (result, error, id) => [{ type: "termsConditions", id }],
        }),

        // Update terms & conditions by id
        updateTermsConditions: builder.mutation({
            query: ({ id, body, params }) => ({
                url: `/trems-condetions/${id}`,
                method: "PATCH",
                body,
                params,
                headers: { "Content-Type": "application/json;charset=UTF-8" },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "termsConditions", id },
                { type: "termsConditions", id: "LIST" },
            ],
        }),

        // Delete terms & conditions by id
        deleteTermsConditions: builder.mutation({
            query: (id) => ({
                url: `/trems-condetions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "termsConditions", id: "LIST" }],
        }),
    }),
});

export const {
    useGetTermsConditionsQuery,
    useGetTermsConditionQuery,
    useCreateTermsConditionsMutation,
    useUpdateTermsConditionsMutation,
    useDeleteTermsConditionsMutation,
} = termsConditionsApiSlice;




