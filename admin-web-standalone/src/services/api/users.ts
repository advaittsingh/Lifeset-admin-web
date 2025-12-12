import { apiClient } from './client';

export interface User {
  id: string;
  email?: string;
  mobile?: string;
  userType: string;
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  studentProfile?: any;
  companyProfile?: any;
  collegeProfile?: any;
}

export interface UsersResponse {
  data: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; userType?: string }) => {
    const response = await apiClient.get('/admin/users', { 
      params: {
        ...params,
        limit: params?.limit || 100, // Increase default limit
      }
    });
    // Backend returns: { success: true, data: { data: users, pagination: {...} } }
    // So response.data.data is { data: users, pagination: {...} }
    const result = response.data.data || response.data;
    return result;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await apiClient.put(`/admin/cms/users/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await apiClient.patch(`/admin/users/${id}/activate`);
    return response.data.data || response.data;
  },

  deactivate: async (id: string) => {
    const response = await apiClient.patch(`/admin/users/${id}/deactivate`);
    return response.data.data || response.data;
  },
};

