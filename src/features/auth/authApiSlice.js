import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userLogin: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/login`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
          credentials: "include",
        };
      },
      invalidatesTags: ["auth", "my-profile"],
    }),

    userRegister: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/signup`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },
          body: data,
        };
      },
      invalidatesTags: ["auth"],
    }),

    forgotPassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/forget-password`,
          method: "POST",
          body: payload,
        };
      },
    }),

    resetPassword: builder.mutation({
      query: (payload) => {
        const { bodyData, userId, token } = payload;
        return {
          url: `auth/forget-password/${userId}/${token}`,
          method: "POST",
          body: bodyData,
        };
      },
    }),

    changePassword: builder.mutation({
      query: (payload) => {
        return {
          url: `/auth/reset-password`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    // Get current user profile data
    getCurrentUser: builder.query({
      query: () => ({
        url: `/auth/me`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["my-profile"],
      transformResponse: (response) => {
        // Return the user data directly
        return response?.data || response;
      },
    }),
  }),
});

export const {
  useUserLoginMutation,
  useUserRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
} = authApiSlice;
