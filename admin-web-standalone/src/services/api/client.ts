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
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
    }
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

