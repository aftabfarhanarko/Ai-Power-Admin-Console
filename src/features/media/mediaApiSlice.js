import toast from "react-hot-toast";
import { apiSlice } from "../api/apiSlice";
import { API_BASE_URL } from "@/config/api";
import { getTokens } from "@/hooks/useToken";
import { getSuperadminTokens } from "@/features/superadminAuth/superadminAuthSlice";

/**
 * Upload image via media API. Use with useUploadMediaMutation.
 * @param {Function} uploadMedia - mutation trigger from useUploadMediaMutation
 * @param {File} file - image file
 * @param {string} companyId - company ID
 * @returns {Promise<string|null>} URL or null
 */
export async function uploadImageToMedia(uploadMedia, file, companyId) {
  if (!file) return null;
  if (!file.type?.startsWith("image/")) {
    toast.error("Please select a valid image file");
    return null;
  }
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error("Image size must be less than 20MB");
    return null;
  }
  if (!companyId) {
    toast.error("Company context required for upload");
    return null;
  }
  try {
    const result = await uploadMedia({ file, companyId });
    const url = result?.data?.url ?? result?.data?.data?.url;
    if (url) {
      toast.success("Image uploaded successfully");
      return url;
    }
    toast.error(result?.error?.data ?? "Upload failed");
    return null;
  } catch (err) {
    toast.error(err?.message ?? "Upload failed");
    return null;
  }
}

export const mediaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMedia: builder.query({
      query: ({ companyId, search, sortBy, page, limit }) => ({
        url: "/media",
        method: "GET",
        params: {
          ...(companyId && { companyId }),
          ...(search && { search }),
          ...(sortBy && { sortBy }),
          ...(page && { page }),
          ...(limit && { limit }),
        },
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        total: res?.total ?? 0,
        page: res?.page ?? 1,
        totalPages: res?.totalPages ?? 1,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "media", id })),
              { type: "media", id: "LIST" },
            ]
          : [{ type: "media", id: "LIST" }],
    }),

    getMediaItem: builder.query({
      query: ({ id, companyId }) => ({
        url: `/media/${id}`,
        method: "GET",
        params: companyId ? { companyId } : undefined,
      }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, { id }) => [{ type: "media", id }],
    }),

    uploadMedia: builder.mutation({
      queryFn: async ({ file, companyId }) => {
        const formData = new FormData();
        formData.append("file", file);

        const { accessToken: superadminToken } = getSuperadminTokens();
        const { accessToken } = getTokens();
        const token = superadminToken || accessToken;

        const url = new URL(`${API_BASE_URL}/media/upload`);
        if (companyId) url.searchParams.set("companyId", companyId);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          return {
            error: {
              status: response.status,
              data: data?.message || data?.error || "Upload failed",
            },
          };
        }
        return { data };
      },
      invalidatesTags: [{ type: "media", id: "LIST" }],
    }),

    updateMedia: builder.mutation({
      query: ({ id, body, companyId }) => ({
        url: `/media/${id}`,
        method: "PATCH",
        body,
        params: companyId ? { companyId } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "media", id },
        { type: "media", id: "LIST" },
      ],
    }),

    deleteMedia: builder.mutation({
      query: ({ id, companyId }) => ({
        url: `/media/${id}`,
        method: "DELETE",
        params: companyId ? { companyId } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "media", id },
        { type: "media", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMediaQuery,
  useGetMediaItemQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = mediaApiSlice;
