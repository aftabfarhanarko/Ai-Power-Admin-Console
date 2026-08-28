/**
 * API Configuration
 * 
 * This file centralizes API configuration from environment variables.
 * In Vite, environment variables must be prefixed with VITE_ to be accessible.
 * 
 * Usage:
 *   import { API_BASE_URL } from '@/config/api';
 */

// Get API base URL from environment variable with fallback
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "/api";
// https://squadcart-backend.up.railway.app
// Export other API-related configs if needed
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
  retryCount: 3,
};
