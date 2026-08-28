import { useState } from "react";
import toast from "react-hot-toast";
import { getTokens } from "./useToken";

const API_BASE_URL = 'https://squadlog-cdn.up.railway.app';

/**
 * Custom hook for uploading images to backend server
 * @returns {Object} { uploadImage, isUploading, error }
 */
const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload image to backend server
   * @param {File} file - The image file to upload
   * @returns {Promise<string|null>} The image URL or null if upload fails
   */
  const uploadImage = async (file) => {
    if (!file) {
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      setError("Invalid file type");
      return null;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      setError("File too large");
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imgbbKey =
        process.env.VITE_IMGBB_API_KEY ||
        import.meta.env?.VITE_IMGBB_API_KEY ||
        "a6c948ab64f7987bbf9e5477cde3a1cb";

      // If ImgBB API Key is available, upload to ImgBB directly
      if (imgbbKey) {
        try {
          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (response.ok && data.success && data.data?.url) {
            toast.success("Image uploaded successfully");
            return data.data.url;
          }
        } catch (imgbbErr) {
          console.warn("ImgBB API error, using Data URL fallback:", imgbbErr);
        }
      }

      // Base64 Data URL fallback for standalone client image rendering
      const base64Url = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (base64Url) {
        toast.success("Image uploaded successfully");
        return base64Url;
      }

      // Fallback: Upload to backend server
      const formData = new FormData();
      formData.append("file", file);

      const { accessToken } = getTokens();

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      if (!response.ok) {
        const errorMessage = errorData?.message || errorData?.error || `Upload failed: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (errorData.success && errorData.url) {
        toast.success(errorData.message || "Image uploaded successfully");
        return errorData.url;
      } else {
        throw new Error(errorData.message || errorData.error || "Upload failed");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to upload image";
      console.error("Image upload error:", err);
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
  };
};

export default useImageUpload;

