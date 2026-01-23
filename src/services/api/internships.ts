import { apiClient } from './client';
import { JobPost, JobsResponse } from './jobs';
import { jobsApi } from './jobs';

export const internshipsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; companyId?: string }) => {
    // Use posts API to filter by jobType: INTERNSHIP
    const response = await apiClient.get('/admin/posts', {
      params: {
        ...params,
        postType: 'JOB',
        jobType: 'INTERNSHIP', // Filter by internship type
      },
    });
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/feeds/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: Parameters<typeof jobsApi.create>[0]) => {
    // Force jobType to Internship
    return jobsApi.create({
      ...data,
      jobType: 'Internship', // Always set to Internship
    });
  },

  update: async (id: string, data: Partial<JobPost>) => {
    // Use posts API for updates
    const response = await apiClient.patch(`/admin/posts/${id}`, {
      ...data,
      jobType: 'INTERNSHIP', // Ensure it stays as internship
    });
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    return jobsApi.delete(id);
  },

  getApplications: async (internshipId: string) => {
    const response = await apiClient.get(`/jobs/${internshipId}/applications`);
    return response.data.data || response.data;
  },
};
