import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

// Determine API base URL
// Priority 1: Environment variable (VITE_API_URL)
// Priority 2: Auto-detect subdomain (admin.domain.com -> api.domain.com)
// Priority 3: Localhost fallback
// Priority 4: Default relative path
const getApiBaseUrl = () => {
  // Priority 1: Environment variable (explicit configuration)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Auto-detect subdomain (admin.domain.com -> api.domain.com)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check if we're on admin subdomain
    if (hostname.startsWith('admin.')) {
      const baseDomain = hostname.replace('admin.', '');
      return `https://api.${baseDomain}/v1`;
    }
    
    // Check if we're on Vercel admin deployment (lifeset-admin-web.vercel.app -> lifeset-backend.vercel.app)
    if (hostname.includes('lifeset-admin-web.vercel.app')) {
      return 'https://lifeset-backend.vercel.app/api/v1';
    }
    
    // Check if we're on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/v1';
    }
  }
  
  // Priority 3: Default fallback (relative path for same-domain deployments)
  return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Get token from store first, fallback to localStorage if store is not initialized
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Remove Authorization header if no token exists
    delete config.headers.Authorization;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: apiClient.defaults.baseURL,
        url: error.config?.url,
      });
    } else if (error.response) {
      // Log server errors with full details
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
        requestData: error.config?.data,
      });
      
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        // Don't redirect if already on login page
        if (window.location.pathname !== '/login') {
          const authStore = useAuthStore.getState();
          // Clear auth state
          authStore.logout();
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

