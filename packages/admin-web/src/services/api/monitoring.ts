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

  // Error Logs & Crash Reports
  getErrorLogs: async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const response = await apiClient.get(`/admin/monitoring/errors?${params.toString()}`);
    return response.data.data || response.data;
  },
  getCrashReports: async () => {
    const response = await apiClient.get('/admin/monitoring/crashes');
    return response.data.data || response.data;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await apiClient.get('/admin/monitoring/health');
    return response.data.data || response.data;
  },

  // Recovery Actions
  performRecoveryAction: async (action: string, params?: Record<string, any>) => {
    const response = await apiClient.post('/admin/monitoring/recovery', { action, params });
    return response.data.data || response.data;
  },

  // Alerts
  getAlerts: async () => {
    const response = await apiClient.get('/admin/monitoring/alerts');
    return response.data.data || response.data;
  },

  // Performance History
  getPerformanceHistory: async (hours?: number) => {
    const params = hours ? `?hours=${hours}` : '';
    const response = await apiClient.get(`/admin/monitoring/performance/history${params}`);
    return response.data.data || response.data;
  },
};

