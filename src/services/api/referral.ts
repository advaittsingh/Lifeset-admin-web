import { apiClient } from './client';

export const referralApi = {
  getAnalytics: async () => {
    const response = await apiClient.get('/referral/analytics');
    return response.data.data || response.data;
  },
};
