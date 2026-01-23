import { apiClient } from './client';

export interface SponsorAd {
  id: string;
  sponsorBacklink: string;
  sponsorAdImage: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SponsorAdsResponse {
  data: SponsorAd[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sponsorAdsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await apiClient.get('/admin/sponsor-ads', { params });
    // Handle different response structures
    if (response.data?.data) {
      // Ensure data is an array
      const dataArray = Array.isArray(response.data.data) ? response.data.data : [];
      return { 
        data: dataArray, 
        pagination: response.data.pagination 
      };
    }
    if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    // Fallback: return empty array if structure is unexpected
    console.warn('Unexpected sponsor ads response structure:', response.data);
    return { data: [], pagination: undefined };
  },

  getById: async (id: string): Promise<SponsorAd> => {
    const response = await apiClient.get(`/admin/sponsor-ads/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: {
    sponsorBacklink: string;
    sponsorAdImage: string;
    status?: 'active' | 'inactive';
  }): Promise<SponsorAd> => {
    const response = await apiClient.post('/admin/sponsor-ads', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: {
    sponsorBacklink?: string;
    sponsorAdImage?: string;
    status?: 'active' | 'inactive';
  }): Promise<SponsorAd> => {
    const response = await apiClient.put(`/admin/sponsor-ads/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/sponsor-ads/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await apiClient.patch(`/admin/sponsor-ads/${id}`, { status });
    return response.data.data || response.data;
  },
};
