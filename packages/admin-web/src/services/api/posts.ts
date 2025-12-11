import { apiClient } from './client';

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  postType: string;
  categoryId?: string;
  images: string[];
  isActive: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

export interface PostsResponse {
  data: Post[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const postsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; postType?: string; isActive?: boolean }) => {
    const response = await apiClient.get('/admin/posts', { 
      params: {
        ...params,
        limit: params?.limit || 100, // Increase default limit
      }
    });
    // Backend returns: { success: true, data: { data: posts, pagination: {...} } }
    // So response.data.data is { data: posts, pagination: {...} }
    const result = response.data.data || response.data;
    return result;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/feeds/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: { title: string; description: string; postType: string; categoryId?: string; images?: string[] }) => {
    const response = await apiClient.post('/feeds', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<Post>) => {
    const response = await apiClient.patch(`/admin/posts/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/posts/${id}`);
    return response.data;
  },

  toggleActive: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/admin/posts/${id}`, { isActive });
    return response.data.data || response.data;
  },

  // Wall Categories
  getWallCategories: async () => {
    const response = await apiClient.get('/admin/wall-categories');
    return response.data.data || response.data;
  },
  createWallCategory: async (data: any) => {
    const response = await apiClient.post('/admin/wall-categories', data);
    return response.data.data || response.data;
  },
  updateWallCategory: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/wall-categories/${id}`, data);
    return response.data.data || response.data;
  },
  deleteWallCategory: async (id: string) => {
    const response = await apiClient.delete(`/admin/wall-categories/${id}`);
    return response.data;
  },
};

