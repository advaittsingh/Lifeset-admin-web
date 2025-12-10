import { apiClient } from './client';

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  _count?: { courses: number };
}

export interface Institute {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  pincode?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  _count?: {
    students: number;
    courses: number;
  };
}

export interface Course {
  id: string;
  name: string;
  collegeId: string;
  categoryId: string;
  duration?: string;
  description?: string;
  fees?: number;
  eligibility?: string;
  isActive: boolean;
  category?: CourseCategory;
}

export const institutesApi = {
  // Course Master Data
  getCourseMasterData: async () => {
    const response = await apiClient.get('/admin/institutes/course-master');
    return response.data.data || response.data;
  },
  createCourseCategory: async (data: any) => {
    const response = await apiClient.post('/admin/institutes/course-master/categories', data);
    return response.data.data || response.data;
  },
  updateCourseCategory: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/institutes/course-master/categories/${id}`, data);
    return response.data.data || response.data;
  },
  deleteCourseCategory: async (id: string) => {
    const response = await apiClient.delete(`/admin/institutes/course-master/categories/${id}`);
    return response.data;
  },

  // Awarded Management
  getAwardedData: async (courseCategoryId?: string) => {
    const params = courseCategoryId ? { courseCategoryId } : {};
    const response = await apiClient.get('/admin/institutes/course-master/awarded', { params });
    return response.data.data || response.data;
  },
  createAwarded: async (data: any) => {
    const response = await apiClient.post('/admin/institutes/course-master/awarded', data);
    return response.data.data || response.data;
  },
  updateAwarded: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/institutes/course-master/awarded/${id}`, data);
    return response.data.data || response.data;
  },
  deleteAwarded: async (id: string) => {
    const response = await apiClient.delete(`/admin/institutes/course-master/awarded/${id}`);
    return response.data;
  },

  // Specialisation Management
  getSpecialisationData: async (awardedId?: string) => {
    const params = awardedId ? { awardedId } : {};
    const response = await apiClient.get('/admin/institutes/course-master/specialisations', { params });
    return response.data.data || response.data;
  },
  createSpecialisation: async (data: any) => {
    const response = await apiClient.post('/admin/institutes/course-master/specialisations', data);
    return response.data.data || response.data;
  },
  updateSpecialisation: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/institutes/course-master/specialisations/${id}`, data);
    return response.data.data || response.data;
  },
  deleteSpecialisation: async (id: string) => {
    const response = await apiClient.delete(`/admin/institutes/course-master/specialisations/${id}`);
    return response.data;
  },

  // Bulk Upload
  bulkUploadAwarded: async (data: Array<{ name: string; description?: string; courseCategoryId: string; isActive?: boolean }>) => {
    const response = await apiClient.post('/admin/institutes/course-master/awarded/bulk-upload', { data });
    return response.data.data || response.data;
  },
  bulkUploadSpecialisation: async (data: Array<{ name: string; description?: string; awardedId: string; isActive?: boolean }>) => {
    const response = await apiClient.post('/admin/institutes/course-master/specialisations/bulk-upload', { data });
    return response.data.data || response.data;
  },

  // Institutes
  getInstitutes: async (params?: any) => {
    const response = await apiClient.get('/admin/institutes', { params });
    return response.data.data || response.data;
  },
  createInstitute: async (data: any) => {
    const response = await apiClient.post('/admin/institutes', data);
    return response.data.data || response.data;
  },
  updateInstitute: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/institutes/${id}`, data);
    return response.data.data || response.data;
  },
  getInstituteById: async (id: string) => {
    const response = await apiClient.get(`/admin/institutes/${id}`);
    return response.data.data || response.data;
  },
  getInstituteLandingPage: async (id: string) => {
    const response = await apiClient.get(`/admin/institutes/${id}/landing`);
    return response.data.data || response.data;
  },
  searchInstitutes: async (params?: any) => {
    const response = await apiClient.get('/admin/institutes/search/institutes', { params });
    return response.data.data || response.data;
  },

  // Courses
  getCoursesByInstitute: async (instituteId: string) => {
    const response = await apiClient.get(`/admin/institutes/${instituteId}/courses`);
    return response.data.data || response.data;
  },
  createCourse: async (instituteId: string, data: any) => {
    const response = await apiClient.post(`/admin/institutes/${instituteId}/courses`, data);
    return response.data.data || response.data;
  },
  updateCourse: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/institutes/courses/${id}`, data);
    return response.data.data || response.data;
  },

  // Dashboard & Reports
  getInstituteDashboard: async (id: string) => {
    const response = await apiClient.get(`/admin/institutes/${id}/dashboard`);
    return response.data.data || response.data;
  },
  getInstituteReports: async (id: string, params?: any) => {
    const response = await apiClient.get(`/admin/institutes/${id}/reports`, { params });
    return response.data.data || response.data;
  },
};

