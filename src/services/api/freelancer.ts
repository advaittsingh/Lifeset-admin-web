import { apiClient } from './client';
import { JobPost, JobsResponse } from './jobs';
import { jobsApi } from './jobs';

export const freelancerApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; companyId?: string }) => {
    // Use posts API to get all jobs, then filter by jobType: FREELANCE or CONTRACT
    const response = await apiClient.get('/admin/posts', {
      params: {
        ...params,
        postType: 'JOB',
      },
    });
    // Filter to only show FREELANCE or CONTRACT jobs
    const posts = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
    const filteredPosts = posts.filter((post: any) => {
      const metadata = post.metadata || {};
      const jobType = post.jobType || metadata.jobType;
      return jobType === 'FREELANCE' || jobType === 'CONTRACT' || jobType === 'Freelance' || jobType === 'Contract' || jobType === 'Contractual';
    });
    return { data: filteredPosts, pagination: response.data?.pagination };
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/feeds/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: Parameters<typeof jobsApi.create>[0]) => {
    // Allow jobType to be Freelance or Contractual (which maps to Contract)
    // Map Contractual to Contract for the API
    const jobTypeForApi = data.jobType === 'Contractual' ? 'Contract' : (data.jobType || 'Freelance');
    return jobsApi.create({
      ...data,
      jobType: jobTypeForApi,
    });
  },

  update: async (id: string, data: Partial<JobPost>) => {
    // Use posts API for updates
    // jobType should already be in enum format (FREELANCE or CONTRACT) from the page
    const response = await apiClient.patch(`/admin/posts/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    return jobsApi.delete(id);
  },

  getApplications: async (freelancerId: string) => {
    const response = await apiClient.get(`/jobs/${freelancerId}/applications`);
    return response.data.data || response.data;
  },
};
