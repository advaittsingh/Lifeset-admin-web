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
    companyName?: string;
    industry?: string;
    selectRole?: string;
    clientToManage?: string;
    workingDays?: string;
    yearlySalary?: string;
    function?: string;
    jobType?: string;
    capacity?: string;
    workTime?: string;
    perksAndBenefits?: string;
    candidateQualities?: string[];
    isPublic?: boolean;
    isPrivate?: boolean;
    privateFilters?: {
      selectCollege?: string;
      selectCourse?: string;
      selectCourseCategory?: string;
      selectYear?: string;
    };
  }) => {
    // Helper function to remove empty/undefined values
    const cleanValue = (value: any): any => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      if (Array.isArray(value)) {
        const filtered = value.filter(v => v !== undefined && v !== null && v !== '');
        return filtered.length > 0 ? filtered : undefined;
      }
      if (typeof value === 'object') {
        const cleaned: any = {};
        for (const key in value) {
          const cleanedVal = cleanValue(value[key]);
          if (cleanedVal !== undefined) {
            cleaned[key] = cleanedVal;
          }
        }
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
      return value;
    };

    // Convert string fields to numbers where appropriate
    const parseNumber = (value: string | undefined): number | undefined => {
      if (!value || value === '') return undefined;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    // Build metadata object and clean it
    const metadata: any = {
      location: data.location,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      experience: data.experience ? (parseNumber(data.experience) ?? data.experience) : undefined,
      skills: data.skills && data.skills.length > 0 ? data.skills : undefined,
      applicationDeadline: data.applicationDeadline,
      companyName: data.companyName,
      industry: data.industry,
      selectRole: data.selectRole,
      clientToManage: data.clientToManage,
      workingDays: data.workingDays,
      yearlySalary: data.yearlySalary,
      function: data.function,
      jobType: data.jobType,
      capacity: data.capacity ? (parseNumber(data.capacity) ?? data.capacity) : undefined,
      workTime: data.workTime,
      perksAndBenefits: data.perksAndBenefits,
      candidateQualities: data.candidateQualities && data.candidateQualities.length > 0 ? data.candidateQualities : undefined,
      isPublic: data.isPublic,
      isPrivate: data.isPrivate,
      privateFilters: data.isPrivate && data.privateFilters ? data.privateFilters : undefined,
    };

    // Clean the metadata object
    const cleanedMetadata = cleanValue(metadata);

    // Build the request payload
    const payload: any = {
      title: data.jobTitle.trim(),
      description: data.jobDescription.trim(),
      postType: 'JOB',
    };

    // Only include metadata if it has values
    if (cleanedMetadata && Object.keys(cleanedMetadata).length > 0) {
      payload.metadata = cleanedMetadata;
    }

    // Log the payload in development for debugging
    if (import.meta.env.DEV) {
      console.log('Creating job with payload:', JSON.stringify(payload, null, 2));
    }

    try {
      const response = await apiClient.post('/feeds', payload);
      return response.data.data || response.data;
    } catch (error: any) {
      // Enhanced error logging
      const errorDetails = {
        error: error.response?.data || error.message,
        payload: payload,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fullError: error.response?.data,
      };
      console.error('Job creation error:', errorDetails);
      
      // Log the full error response for debugging
      if (error.response?.data) {
        console.error('Backend error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw error;
    }
  },

  update: async (id: string, data: Partial<JobPost>) => {
    const response = await apiClient.put(`/jobs/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string) => {
    // Jobs are stored as posts with postType: 'JOB', so delete via posts endpoint
    console.log('Attempting to delete job/post with ID:', id);
    
    try {
      const response = await apiClient.delete(`/admin/posts/${id}`);
      console.log('Delete response from /admin/posts:', response.data);
      
      // Check if the response indicates success
      if (response.status === 200 || response.status === 204) {
        return response.data;
      }
      
      // If response has a success field, check it
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Delete failed');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Delete error from /admin/posts:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      // If admin/posts endpoint fails, try the jobs endpoint as fallback
      if (error.response?.status === 404) {
        console.log('Trying fallback endpoint /jobs');
        try {
          const response = await apiClient.delete(`/jobs/${id}`);
          console.log('Delete response from /jobs:', response.data);
          return response.data;
        } catch (fallbackError: any) {
          console.error('Fallback delete also failed:', fallbackError);
          // If both fail, throw the original error
          throw error;
        }
      }
      throw error;
    }
  },

  getApplications: async (jobId: string) => {
    const response = await apiClient.get(`/jobs/${jobId}/applications`);
    return response.data.data || response.data;
  },
};

