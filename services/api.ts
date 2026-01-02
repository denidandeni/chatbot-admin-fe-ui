import axios, { InternalAxiosRequestConfig } from "axios";

// Extend AxiosRequestConfig to include _retry flag
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Function to add subscribers waiting for token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Function to notify all subscribers when token is refreshed
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token dari cookie via API route
      const response = await fetch('/api/auth/token', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          config.headers.Authorization = `Bearer ${data.token}`;
        }
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle error response dengan automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    // Jika 401 Unauthorized dan belum pernah di-retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Got 401, attempting token refresh...');
      
      if (isRefreshing) {
        // Jika sedang refresh, tunggu sampai selesai
        console.log('⏳ Token refresh in progress, queueing request...');
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          console.log('✅ Token refreshed successfully');
          isRefreshing = false;

          // Get new token
          const tokenResponse = await fetch('/api/auth/token', {
            credentials: 'include',
          });

          if (tokenResponse.ok) {
            const data = await tokenResponse.json();
            if (data.token) {
              // Update authorization header with new token
              originalRequest.headers.Authorization = `Bearer ${data.token}`;
              
              // Notify all queued requests
              onTokenRefreshed(data.token);
              
              // Retry original request
              return api(originalRequest);
            }
          }
        }

        // If refresh failed, redirect to login
        console.error('❌ Token refresh failed, redirecting to login...');
        isRefreshing = false;
        
        if (typeof window !== 'undefined') {
          // Clear session storage
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (refreshError) {
        console.error('❌ Error during token refresh:', refreshError);
        isRefreshing = false;
        
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
