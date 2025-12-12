import { apiClient } from './client';

export interface JobPost {
  id: string;
  postId: string;
  companyId?: string;
  jobTitle: string;
  jobDescription: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  skills: string[];
  applicationDeadline?: string;
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
  post?: any;
  company?: any;
}

export interface JobsResponse {
  data: JobPost[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const jobsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; companyId?: string }) => {
    const response = await apiClient.get('/admin/jobs', { params });
    return response.data.data || response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: {
    jobTitle: string;
    jobDescription: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    experience?: string;
    skills: string[];
    applicationDeadline?: string;
  }) => {
    // For admin, we'll create via feeds endpoint which handles both post and job creation
    const response = await apiClient.post('/feeds', {
      title: data.jobTitle,
      description: data.jobDescription,
      postType: 'JOB',
      metadata: {
        location: data.location,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        experience: data.experience,
        skills: data.skills,
        applicationDeadline: data.applicationDeadline,
      },
    });
    return response.data.data || response.data;
  },

  update: async (id: string, data: Partial<JobPost>) => {
    const response = await apiClient.put(`/jobs/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },

  getApplications: async (jobId: string) => {
    const response = await apiClient.get(`/jobs/${jobId}/applications`);
    return response.data.data || response.data;
  },
};

