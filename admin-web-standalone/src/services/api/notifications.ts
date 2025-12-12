import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  user?: any;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const notificationsApi = {
  getAll: async (params?: { page?: number; limit?: number; userId?: string; type?: string; isRead?: boolean }) => {
    const response = await apiClient.get('/admin/notifications', { params });
    return response.data.data || response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data.data || response.data;
  },

  create: async (data: {
    userId?: string;
    title: string;
    message: string;
    type: string;
    sendToAll?: boolean;
    filters?: {
      userType?: string;
      collegeId?: string;
      courseId?: string;
      city?: string;
      state?: string;
      isActive?: boolean;
      isVerified?: boolean;
      registrationDateFrom?: string;
      registrationDateTo?: string;
    };
  }) => {
    const response = await apiClient.post('/admin/notifications', data);
    return response.data.data || response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data.data || response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/read-all');
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },
};

