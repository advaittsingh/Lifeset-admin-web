import { apiClient } from './client';

export interface NotificationJob {
  id: string;
  messageType: string;
  title: string;
  content: string;
  image?: string;
  redirectionLink?: string;
  scheduledAt: string;
  language: 'ALL' | 'ENGLISH' | 'HINDI';
  frequency: 'ONCE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastSentAt?: string;
  nextSendAt?: string;
  totalSent: number;
  totalFailed: number;
  filterConditions?: any;
  _count?: {
    notifications: number;
  };
}

export interface NotificationJobsResponse {
  data: NotificationJob[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationJobsApi = {
  getAll: async (params?: {
    status?: string;
    messageType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/notification-jobs', { params });
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/admin/notification-jobs/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: {
    messageType: string;
    title: string;
    content: string;
    image?: string;
    redirectionLink?: string;
    scheduledAt: string; // ISO date string
    language: 'ALL' | 'ENGLISH' | 'HINDI';
    frequency: 'ONCE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    filterConditions?: any;
  }) => {
    const response = await apiClient.post('/admin/notification-jobs', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<{
    messageType: string;
    title: string;
    content: string;
    image: string;
    redirectionLink: string;
    scheduledAt: string;
    language: 'ALL' | 'ENGLISH' | 'HINDI';
    frequency: 'ONCE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    filterConditions: any;
    status: string;
  }>) => {
    const response = await apiClient.put(`/admin/notification-jobs/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/notification-jobs/${id}`);
    return response.data;
  },

  execute: async (id: string) => {
    const response = await apiClient.post(`/admin/notification-jobs/${id}/execute`);
    return response.data.data || response.data;
  },
};
