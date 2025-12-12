import { apiClient } from './client';

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalPosts: number;
  totalJobs: number;
  totalApplications: number;
  engagementRate: number;
  retentionRate: number;
}

export interface EventStats {
  eventType: string;
  count: number;
  percentage: number;
}

export const analyticsApi = {
  getOverview: async () => {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data.data || response.data;
  },

  getUserGrowth: async (period: 'day' | 'week' | 'month' = 'month') => {
    const response = await apiClient.get('/admin/analytics/user-growth', { params: { period } });
    return response.data.data || response.data;
  },

  getEventStats: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/analytics/events', { params: { startDate, endDate } });
    return response.data.data || response.data;
  },

  getEngagement: async (period: 'day' | 'week' | 'month' = 'week') => {
    const response = await apiClient.get('/analytics/engagement', { params: { period } });
    return response.data.data || response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data.data || response.data;
  },
};

