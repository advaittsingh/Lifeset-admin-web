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

// Expose token debugging utility to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = () => {
    const storeToken = useAuthStore.getState().token;
    const localToken = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('=== Auth Debug Info ===');
    console.log('Store Token:', storeToken ? `${storeToken.substring(0, 20)}... (${storeToken.length} chars)` : 'Not found');
    console.log('LocalStorage Token:', localToken ? `${localToken.substring(0, 20)}... (${localToken.length} chars)` : 'Not found');
    console.log('User:', user ? JSON.parse(user) : 'Not found');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Current URL:', window.location.href);
    console.log('=====================');
    
    return {
      storeToken: storeToken ? `${storeToken.substring(0, 20)}...` : null,
      localToken: localToken ? `${localToken.substring(0, 20)}...` : null,
      user: user ? JSON.parse(user) : null,
      apiBaseUrl: API_BASE_URL,
    };
  };
  
  (window as any).testToken = async (endpoint = '/admin/institutes') => {
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Token Test Result:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      const data = await response.json();
      console.log('Response Data:', data);
      
      return { status: response.status, data };
    } catch (error) {
      console.error('Token test failed:', error);
      return { error };
    }
  };
}

apiClient.interceptors.request.use((config) => {
  // Get token from store first, fallback to localStorage if store is not initialized
  const storeToken = useAuthStore.getState().token;
  const localToken = localStorage.getItem('token');
  const token = storeToken || localToken;
  
  if (token) {
    // Ensure token is a string and trim any whitespace
    const cleanToken = String(token).trim();
    if (cleanToken) {
      // Set Authorization header - axios will normalize this to 'Authorization'
      config.headers.Authorization = `Bearer ${cleanToken}`;
      
      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!cleanToken,
          tokenLength: cleanToken.length,
          tokenPreview: cleanToken.substring(0, 20) + '...',
          authHeader: config.headers.Authorization?.substring(0, 30) + '...',
        });
      }
    } else {
      console.warn('Token exists but is empty, removing Authorization header');
      delete config.headers.Authorization;
    }
  } else {
    // Log warning if we're making an authenticated request without a token
    if (config.url && !config.url.includes('/auth/login')) {
      console.warn('No token found for authenticated request:', {
        url: config.url,
        method: config.method,
        storeToken: !!storeToken,
        localToken: !!localToken,
      });
    }
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
      const errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
        requestData: error.config?.data,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.url ? `${error.config.baseURL}${error.config.url}` : undefined,
      };
      
      console.error('API Error:', errorDetails);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        const currentToken = useAuthStore.getState().token || localStorage.getItem('token');
        console.error('401 Unauthorized - Authentication failed:', {
          hasToken: !!currentToken,
          tokenLength: currentToken?.length || 0,
          authHeader: error.config?.headers?.Authorization ? 'Present' : 'Missing',
          url: error.config?.url,
        });
        
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

