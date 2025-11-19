import { apiClient } from './client';

export const monitoringApi = {
  // Server Metrics
  getServerMetrics: async () => {
    const response = await apiClient.get('/admin/monitoring/server');
    return response.data.data || response.data;
  },
  getApiLatency: async () => {
    const response = await apiClient.get('/admin/monitoring/api-latency');
    return response.data.data || response.data;
  },
  getRedisStats: async () => {
    const response = await apiClient.get('/admin/monitoring/redis');
    return response.data.data || response.data;
  },
  getDbPerformance: async () => {
    const response = await apiClient.get('/admin/monitoring/database');
    return response.data.data || response.data;
  },
  getQueueStats: async () => {
    const response = await apiClient.get('/admin/monitoring/queue');
    return response.data.data || response.data;
  },

  // App Metrics
  getAppMetrics: async () => {
    const response = await apiClient.get('/admin/monitoring/app');
    return response.data.data || response.data;
  },

  // Web Metrics
  getWebMetrics: async () => {
    const response = await apiClient.get('/admin/monitoring/web');
    return response.data.data || response.data;
  },

  // User Behavior
  getUserBehaviorMetrics: async () => {
    const response = await apiClient.get('/admin/monitoring/user-behavior');
    return response.data.data || response.data;
  },

  // Engagement
  getEngagementMetrics: async () => {
    const response = await apiClient.get('/admin/monitoring/engagement');
    return response.data.data || response.data;
  },

  // Cache Management
  getCacheStats: async () => {
    const response = await apiClient.get('/admin/monitoring/cache/stats');
    return response.data.data || response.data;
  },
  clearCache: async (pattern?: string) => {
    const response = await apiClient.post('/admin/monitoring/cache/clear', { pattern });
    return response.data.data || response.data;
  },
};

