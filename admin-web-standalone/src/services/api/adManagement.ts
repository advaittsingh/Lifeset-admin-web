import { apiClient } from './client';

export interface AdCampaign {
  id?: string;
  title?: string;
  imageUrl?: string;
  supportingText?: string;
  threeLineText?: string;
  buttonType?: 'interested' | 'readMore' | 'download';
  buttonLink?: string;
  country?: string;
  state?: string;
  city?: string;
  courseCategory?: string;
  gender?: string;
  age?: string;
  userGroup?: string;
  dailyBudget?: number;
  impressions?: number;
  estimatedUsers?: number;
  startDate?: string;
  endDate?: string;
  advertiserStartDay?: string;
  advertiserEndDay?: string;
  dailyAllocation?: number;
  slotAllocation?: number;
  hourlyAllocations?: Record<string, Record<string, number>>;
  advertiserState?: string;
  advertiserDistrict?: string;
  advertiserLocation?: string;
  advertiserSubject?: string;
  advertiserGender?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdPerformance {
  dailyPrediction: number;
  adOpportunityDaily: number;
  slotAdOpportunity: number;
  selectedSlot: string;
  ads: Array<{
    id: string;
    money: number;
    percentageShare: string;
    visibilityPrediction: number;
  }>;
}

export interface EstimateUsersResponse {
  estimatedUsers: number;
}

export const adManagementApi = {
  // Get all campaigns
  getCampaigns: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/admin/ad-campaigns', { params });
    return response.data;
  },

  // Get campaign by ID
  getCampaign: async (id: string) => {
    const response = await apiClient.get(`/admin/ad-campaigns/${id}`);
    return response.data;
  },

  // Create campaign
  createCampaign: async (data: Partial<AdCampaign>) => {
    const response = await apiClient.post('/admin/ad-campaigns', data);
    return response.data;
  },

  // Update campaign
  updateCampaign: async (id: string, data: Partial<AdCampaign>) => {
    const response = await apiClient.put(`/admin/ad-campaigns/${id}`, data);
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (id: string) => {
    const response = await apiClient.delete(`/admin/ad-campaigns/${id}`);
    return response.data;
  },

  // Publish campaign
  publishCampaign: async (id: string) => {
    const response = await apiClient.post(`/admin/ad-campaigns/${id}/publish`);
    return response.data;
  },

  // Get performance predictions
  getPerformancePredictions: async (slot?: string) => {
    const response = await apiClient.get('/admin/ad-campaigns/performance/predictions', {
      params: { slot },
    });
    return response.data as AdPerformance;
  },

  // Estimate users based on filters
  estimateUsers: async (filters: {
    country?: string;
    state?: string;
    city?: string;
    courseCategory?: string;
    gender?: string;
    age?: string;
    userGroup?: string;
  }) => {
    const response = await apiClient.post('/admin/ad-campaigns/estimate-users', filters);
    return response.data as EstimateUsersResponse;
  },

  // Upload image
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url || response.data.data?.url || '';
  },

  // Get active users by hour for each day
  getActiveUsersByHour: async () => {
    const response = await apiClient.get('/admin/ad-campaigns/active-users');
    return response.data;
  },
};

