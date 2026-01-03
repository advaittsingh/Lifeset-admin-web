import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

// Determine API base URL
// Priority 1: Runtime detection (CloudFront, subdomains, etc.)
// Priority 2: Environment variable (VITE_API_URL) - only if not on CloudFront
// Priority 3: Localhost fallback
// Priority 4: Default relative path
const getApiBaseUrl = () => {
  // Priority 1: Runtime detection - CloudFront MUST override everything to avoid mixed content
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check if we're on CloudFront (use relative path - CloudFront proxies /api/* to backend)
    // This MUST override environment variables to prevent mixed content errors
    if (hostname.includes('cloudfront.net')) {
      return '/api/v1';
    }
    
    // Check if we're on S3 website (s3-website-*.amazonaws.com)
    if (hostname.includes('s3-website-') || hostname.includes('.s3.amazonaws.com')) {
      // Use HTTP for now (ALB doesn't have HTTPS listener configured yet)
      // TODO: Configure HTTPS listener on ALB and change this to HTTPS
      return 'http://lifeset-production-alb-1834668951.ap-south-1.elb.amazonaws.com/api/v1';
    }
    
    // Check if we're on admin subdomain
    if (hostname.startsWith('admin.')) {
      const baseDomain = hostname.replace('admin.', '');
      return `https://api.${baseDomain}/v1`;
    }
    
    // Check if we're on Vercel admin deployment (lifeset-admin-web.vercel.app -> lifeset-backend.vercel.app)
    if (hostname.includes('lifeset-admin-web.vercel.app') || hostname.includes('lifeset-admin-web')) {
      return 'https://lifeset-backend.vercel.app/api/v1';
    }
    
    // Check if we're on any Vercel deployment (production)
    if (hostname.includes('.vercel.app') && !hostname.includes('localhost')) {
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

// Log API base URL for debugging (only in browser)
if (typeof window !== 'undefined') {
  console.log('API Base URL configured:', API_BASE_URL);
  console.log('Current hostname:', window.location.hostname);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expose token debugging utility to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = () => {
    const authStore = useAuthStore.getState();
    const storeToken = authStore.token;
    const localToken = localStorage.getItem('token');
    const refreshToken = authStore.refreshToken || localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    const expiration = authStore.getTokenExpiration();
    const isExpired = authStore.isTokenExpired();
    const timeUntilExpiry = expiration ? Math.max(0, expiration - Date.now()) : null;
    
    console.log('=== Auth Debug Info ===');
    console.log('Store Token:', storeToken ? `${storeToken.substring(0, 20)}... (${storeToken.length} chars)` : 'Not found');
    console.log('LocalStorage Token:', localToken ? `${localToken.substring(0, 20)}... (${localToken.length} chars)` : 'Not found');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}... (${refreshToken.length} chars)` : 'Not found');
    console.log('User:', user ? JSON.parse(user) : 'Not found');
    console.log('Token Expired:', isExpired);
    console.log('Token Expiration:', expiration ? new Date(expiration).toLocaleString() : 'Unknown');
    console.log('Time Until Expiry:', timeUntilExpiry ? `${Math.round(timeUntilExpiry / 1000 / 60)} minutes` : 'Unknown');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Current URL:', window.location.href);
    console.log('=====================');
    
    return {
      storeToken: storeToken ? `${storeToken.substring(0, 20)}...` : null,
      localToken: localToken ? `${localToken.substring(0, 20)}...` : null,
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
      user: user ? JSON.parse(user) : null,
      isExpired,
      expiration: expiration ? new Date(expiration).toISOString() : null,
      timeUntilExpiry: timeUntilExpiry ? Math.round(timeUntilExpiry / 1000 / 60) : null,
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

// Token refresh function
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = useAuthStore.getState().refreshToken || localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.warn('No refresh token available');
    return null;
  }

  try {
    // Try to refresh the token
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const apiResponse = response.data;
    const refreshData = apiResponse.data || apiResponse;
    const newToken = refreshData.accessToken || refreshData.token || refreshData.access_token;
    const newRefreshToken = refreshData.refreshToken || refreshData.refresh_token;

    if (newToken) {
      useAuthStore.getState().setToken(newToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user,
          newToken,
          newRefreshToken
        );
      }
      console.log('Token refreshed successfully');
      return newToken;
    }
  } catch (error: any) {
    console.error('Token refresh failed:', error);
    // If refresh fails, logout user
    if (window.location.pathname !== '/login') {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return null;
  }

  return null;
};

apiClient.interceptors.request.use(async (config) => {
  // Skip token check for login and refresh endpoints
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
    return config;
  }

  // Check if token is expired or about to expire
  const authStore = useAuthStore.getState();
  if (authStore.isTokenExpired()) {
    console.log('Token expired or about to expire, attempting refresh...');
    
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      processQueue(null, newToken);
      
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }
    } else {
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
    }
  }

  // Get token from store first, fallback to localStorage if store is not initialized
  const storeToken = authStore.token;
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
        const expiration = authStore.getTokenExpiration();
        const timeUntilExpiry = expiration ? Math.max(0, expiration - Date.now()) : null;
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!cleanToken,
          tokenLength: cleanToken.length,
          tokenPreview: cleanToken.substring(0, 20) + '...',
          timeUntilExpiry: timeUntilExpiry ? `${Math.round(timeUntilExpiry / 1000 / 60)} minutes` : 'unknown',
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
  async (error) => {
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
        const originalRequest = error.config;
        const authStore = useAuthStore.getState();
        const refreshToken = authStore.refreshToken || localStorage.getItem('refreshToken');
        
        // Don't try to refresh if this is already a refresh request or login request
        if (
          originalRequest?.url?.includes('/auth/refresh') ||
          originalRequest?.url?.includes('/auth/login')
        ) {
          // Refresh failed or login failed, redirect to login
          if (window.location.pathname !== '/login') {
            authStore.logout();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Try to refresh token if we have a refresh token
        if (refreshToken && !isRefreshing) {
          isRefreshing = true;
          
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            processQueue(null, newToken);
            
            if (newToken && originalRequest) {
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError, null);
            
            // Refresh failed, logout and redirect
            if (window.location.pathname !== '/login') {
              authStore.logout();
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else if (isRefreshing) {
          // Already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token && originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              }
              return Promise.reject(error);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        } else {
          // No refresh token available, logout
          const currentToken = authStore.token || localStorage.getItem('token');
          console.error('401 Unauthorized - No refresh token available:', {
            hasToken: !!currentToken,
            tokenLength: currentToken?.length || 0,
            authHeader: originalRequest?.headers?.Authorization ? 'Present' : 'Missing',
            url: originalRequest?.url,
          });
          
          if (window.location.pathname !== '/login') {
            authStore.logout();
            window.location.href = '/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

