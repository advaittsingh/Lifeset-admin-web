import { apiClient } from './client';

export interface CurrentAffair {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface McqQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  categoryId: string;
  explanation?: string;
  createdAt: string;
}

export interface PersonalityQuestion {
  id: string;
  question: string;
  options: any[];
  order: number;
  isActive: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  description: string | null;
  subCategoryId: string;
  isActive: boolean;
  order: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const cmsApi = {
  // Current Affairs
  getCurrentAffairs: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/current-affairs', { params });
    // Backend returns: { data: { data: [...], pagination: {...} } } or { data: [...], pagination: {...} }
    // Preserve the full structure including pagination
    if (response.data?.data && (response.data?.pagination || Array.isArray(response.data.data))) {
      return response.data; // Return { data: [...], pagination: {...} }
    }
    if (response.data?.data) {
      return response.data.data; // Fallback for array-only responses
    }
    return response.data;
  },
  getCurrentAffairById: async (id: string) => {
    const response = await apiClient.get(`/admin/cms/current-affairs/${id}`);
    return response.data.data || response.data;
  },
  createCurrentAffair: async (data: any) => {
    const response = await apiClient.post('/admin/cms/current-affairs', data);
    return response.data.data || response.data;
  },
  updateCurrentAffair: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/cms/current-affairs/${id}`, data);
    return response.data.data || response.data;
  },
  deleteCurrentAffair: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/current-affairs/${id}`);
    return response.data;
  },

  // General Knowledge
  getGeneralKnowledge: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/general-knowledge', { params });
    // Backend returns: { data: { data: [...], pagination: {...} } } or { data: [...], pagination: {...} }
    // Preserve the full structure including pagination
    if (response.data?.data && (response.data?.pagination || Array.isArray(response.data.data))) {
      return response.data; // Return { data: [...], pagination: {...} }
    }
    if (response.data?.data) {
      return response.data.data; // Fallback for array-only responses
    }
    return response.data;
  },
  getGeneralKnowledgeById: async (id: string) => {
    const response = await apiClient.get(`/admin/cms/general-knowledge/${id}`);
    return response.data.data || response.data;
  },
  createGeneralKnowledge: async (data: any) => {
    const response = await apiClient.post('/admin/cms/general-knowledge', data);
    return response.data.data || response.data;
  },
  updateGeneralKnowledge: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/cms/general-knowledge/${id}`, data);
    return response.data.data || response.data;
  },
  deleteGeneralKnowledge: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/general-knowledge/${id}`);
    return response.data;
  },

  // MCQ
  getMcqQuestions: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/mcq/questions', { params });
    return response.data.data || response.data;
  },
  createMcqQuestion: async (data: any) => {
    const response = await apiClient.post('/admin/cms/mcq/questions', data);
    return response.data.data || response.data;
  },
  updateMcqQuestion: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/cms/mcq/questions/${id}`, data);
    return response.data.data || response.data;
  },
  deleteMcqQuestion: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/mcq/questions/${id}`);
    return response.data;
  },
  getMcqCategories: async () => {
    const response = await apiClient.get('/admin/cms/mcq/categories');
    return response.data.data || response.data;
  },
  createMcqCategory: async (data: any) => {
    const response = await apiClient.post('/admin/cms/mcq/categories', data);
    return response.data.data || response.data;
  },

  // Personality Quiz
  getPersonalityQuestions: async (params?: { includeInactive?: boolean; page?: number; limit?: number }) => {
    const queryParams: any = {};
    if (params?.includeInactive) {
      queryParams.includeInactive = true;
    }
    if (params?.page) {
      queryParams.page = params.page;
    }
    if (params?.limit) {
      queryParams.limit = params.limit;
    }
    
    const response = await apiClient.get('/admin/cms/personality/questions', { params: queryParams });
    
    // Backend returns array directly or wrapped in { data: [...], pagination: {...} }
    // Handle both cases
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    // Fallback: return empty array if structure is unexpected
    console.warn('Unexpected response structure for personality questions:', response.data);
    return { data: [], pagination: { page: 1, limit: params?.limit || 20, total: 0, totalPages: 0 } };
  },
  createPersonalityQuestion: async (data: any) => {
    const response = await apiClient.post('/admin/cms/personality/questions', data);
    return response.data.data || response.data;
  },
  updatePersonalityQuestion: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/cms/personality/questions/${id}`, data);
    return response.data.data || response.data;
  },
  deletePersonalityQuestion: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/personality/questions/${id}`);
    return response.data;
  },

  // Daily Digest
  getDailyDigests: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/daily-digest', { params });
    return response.data.data || response.data;
  },
  createDailyDigest: async (data: any) => {
    const response = await apiClient.post('/admin/cms/daily-digest', data);
    return response.data.data || response.data;
  },

  // College Events (Admin endpoints)
  getCollegeEvents: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/college-events', { params });
    return response.data.data || response.data;
  },
  createCollegeEvent: async (data: any) => {
    const response = await apiClient.post('/admin/cms/college-events', data);
    return response.data.data || response.data;
  },
  updateCollegeEvent: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/cms/college-events/${id}`, data);
    return response.data.data || response.data;
  },
  deleteCollegeEvent: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/college-events/${id}`);
    return response.data;
  },

  // College Events (Public endpoints)
  getPublicCollegeEvents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    collegeId?: string;
    isPublished?: boolean;
  }) => {
    const response = await apiClient.get('/cms/college-events', { params });
    // Handle pagination response structure
    if (response.data?.data && response.data?.pagination) {
      return response.data; // Return { data: [...], pagination: {...} }
    }
    if (response.data?.data) {
      return response.data.data; // Fallback for array-only responses
    }
    return response.data;
  },
  getPublicCollegeEventById: async (id: string) => {
    const response = await apiClient.get(`/cms/college-events/${id}`);
    return response.data.data || response.data;
  },
  markEventInterested: async (id: string) => {
    const response = await apiClient.post(`/cms/college-events/${id}/interested`);
    return response.data.data || response.data;
  },

  // Govt Vacancies
  getGovtVacancies: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/govt-vacancies', { params });
    return response.data.data || response.data;
  },
  getGovtVacancyById: async (id: string) => {
    const response = await apiClient.get(`/admin/cms/govt-vacancies/${id}`);
    return response.data.data || response.data;
  },
  createGovtVacancy: async (data: any) => {
    const response = await apiClient.post('/admin/cms/govt-vacancies', data);
    return response.data.data || response.data;
  },
  updateGovtVacancy: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/cms/govt-vacancies/${id}`, data);
    return response.data.data || response.data;
  },
  deleteGovtVacancy: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/govt-vacancies/${id}`);
    return response.data;
  },

  // College Feeds
  getCollegeFeeds: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/college-feeds', { params });
    return response.data.data || response.data;
  },

  // Community
  getCommunityPosts: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/community', { params });
    return response.data.data || response.data;
  },
  moderateCommunityPost: async (id: string, action: 'approve' | 'reject' | 'delete') => {
    const response = await apiClient.post(`/admin/cms/community/${id}/moderate`, { action });
    return response.data.data || response.data;
  },

  // Chapters
  getChapters: async (params?: { subCategoryId?: string; isActive?: boolean }): Promise<Chapter[]> => {
    const response = await apiClient.get('/admin/cms/chapters', { params });
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? (result as Chapter[]) : (result?.data ?? []);
  },
  getChapterById: async (id: string): Promise<Chapter> => {
    const response = await apiClient.get(`/admin/cms/chapters/${id}`);
    return response.data.data || response.data;
  },
  getChaptersBySubCategory: async (subCategoryId: string): Promise<Chapter[]> => {
    const response = await apiClient.get('/admin/cms/chapters', {
      params: { subCategoryId },
    });
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? (result as Chapter[]) : (result?.data ?? []);
  },

  // Cascading dropdown endpoints for General Knowledge and Current Affairs
  // Get all top-level categories (where parentCategoryId IS NULL)
  getCategories: async (articleType: 'general-knowledge' | 'current-affairs' = 'general-knowledge') => {
    const response = await apiClient.get(`/cms/${articleType}/categories`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : (result?.data ?? []);
  },

  // Get subcategories for a specific category
  getSubCategories: async (categoryId: string, articleType: 'general-knowledge' | 'current-affairs' = 'general-knowledge') => {
    const response = await apiClient.get(`/cms/${articleType}/categories/${categoryId}/subcategories`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : (result?.data ?? []);
  },

  // Get chapters (sections) for a specific subcategory
  getChaptersBySubCategoryNew: async (subCategoryId: string, articleType: 'general-knowledge' | 'current-affairs' = 'general-knowledge') => {
    const response = await apiClient.get(`/cms/${articleType}/subcategories/${subCategoryId}/sections`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? (result as Chapter[]) : (result?.data ?? []);
  },
  createChapter: async (data: {
    name: string;
    description?: string;
    subCategoryId: string;
    isActive?: boolean;
    order?: number;
  }): Promise<Chapter> => {
    const response = await apiClient.post('/admin/cms/chapters', data);
    return response.data.data || response.data;
  },
  updateChapter: async (id: string, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    order?: number;
  }): Promise<Chapter> => {
    const response = await apiClient.put(`/admin/cms/chapters/${id}`, data);
    return response.data.data || response.data;
  },
  deleteChapter: async (id: string) => {
    const response = await apiClient.delete(`/admin/cms/chapters/${id}`);
    return response.data;
  },
};

