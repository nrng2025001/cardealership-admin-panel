// API Client Configuration
// This file sets up axios with interceptors for authentication and error handling

import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { getAuth } from 'firebase/auth';

/**
 * Create axios instance with base configuration
 * Sets up default settings for all API requests including base URL, timeout, and headers
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://automotive-backend-frqe.onrender.com/api',
  timeout: 60000, // 60s timeout to handle Render free tier cold starts (30-60s wake up time)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Disable credentials for CORS
});

/**
 * Request interceptor for authentication
 * Automatically refreshes and adds authentication token to all outgoing requests
 * Gets fresh token from Firebase to prevent expired token issues
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Only set Authorization if not already present (allows manual override)
      if (!config.headers.Authorization) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Get fresh Firebase ID token
          const token = await currentUser.getIdToken(true);
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 [API CLIENT] Using Firebase token for:', config.url);
        } else {
          console.warn('⚠️ [API CLIENT] No authenticated user, request will be made without token');
        }
      }
      
      return config;
    } catch (error) {
      console.error('🚨 [API CLIENT] Error getting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 * Handles common error scenarios like authentication failures
 * Automatically redirects to login on 401 unauthorized responses
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      console.warn('⚠️ [API CLIENT] 401 Unauthorized:', error.config?.url);
      
      // Clear the token but DON'T force redirect
      // Let the AuthContext and ProtectedRoute handle navigation
      localStorage.removeItem('authToken');
      
      // NOTE: We're using Firebase-only auth mode, so backend 401s are expected
      // The frontend will still work with the Firebase user data
    }
    
    // Log error for debugging (but don't spam for expected 401s)
    if (error.response?.status !== 401) {
      console.error('🚨 [API CLIENT] API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
