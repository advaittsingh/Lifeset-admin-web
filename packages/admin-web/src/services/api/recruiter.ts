import { apiClient } from './client';

export const recruiterApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/recruiter/dashboard');
    return response.data.data || response.data;
  },
  getJobReports: async (params?: any) => {
    const response = await apiClient.get('/recruiter/reports/jobs', { params });
    return response.data.data || response.data;
  },
  getApplicationReports: async (params?: any) => {
    const response = await apiClient.get('/recruiter/reports/applications', { params });
    return response.data.data || response.data;
  },
  getCandidateAnalytics: async () => {
    const response = await apiClient.get('/recruiter/analytics/candidates');
    return response.data.data || response.data;
  },
  getJobPerformance: async (jobId?: string) => {
    const response = await apiClient.get('/recruiter/analytics/job-performance', {
      params: { jobId },
    });
    return response.data.data || response.data;
  },
};

