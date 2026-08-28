import { apiSlice } from "../api/apiSlice";

const FRAUD_BASE = "/fraudchecker";

const ensureSingleParam = ({ email, name, phone }) => {
  const entries = [
    ["email", email],
    ["name", name],
    ["phone", phone],
  ].filter(([_, v]) => v && String(v).trim() !== "");
  if (entries.length !== 1) {
    throw new Error("Provide exactly one of email, name, or phone");
  }
  const [key, value] = entries[0];
  return { key, value };
};

export const fraudApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /fraudchecker/users/check?email|name|phone=...
    checkUserRisk: builder.query({
      query: ({ email, name, phone }) => {
        const { key, value } = ensureSingleParam({ email, name, phone });
        const qs = `${key}=${encodeURIComponent(value)}`;
        return { url: `${FRAUD_BASE}/users/check?${qs}`, method: "GET" };
      },
      transformResponse: (res) => res?.data ?? res,
      providesTags: [{ type: "fraudchecker", id: "CHECKS" }],
    }),

    // PATCH /fraudchecker/users/:id/flag  body: { reason }
    flagUser: builder.mutation({
      query: ({ id, reason }) => ({
        url: `${FRAUD_BASE}/users/${id}/flag`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "fraudchecker", id: "CHECKS" },
        { type: "users", id },
      ],
    }),

    // PATCH /fraudchecker/users/:id/unflag
    unflagUser: builder.mutation({
      query: ({ id }) => ({
        url: `${FRAUD_BASE}/users/${id}/unflag`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "fraudchecker", id: "CHECKS" },
        { type: "users", id },
      ],
    }),
  }),
});

export const {
  useCheckUserRiskQuery,
  useLazyCheckUserRiskQuery,
  useFlagUserMutation,
  useUnflagUserMutation,
  
} = fraudApiSlice;