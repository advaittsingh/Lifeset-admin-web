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

export const cmsApi = {
  // Current Affairs
  getCurrentAffairs: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/current-affairs', { params });
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
  getPersonalityQuestions: async () => {
    const response = await apiClient.get('/admin/cms/personality/questions');
    return response.data.data || response.data;
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

  // College Events
  getCollegeEvents: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/college-events', { params });
    return response.data.data || response.data;
  },
  createCollegeEvent: async (data: any) => {
    const response = await apiClient.post('/admin/cms/college-events', data);
    return response.data.data || response.data;
  },

  // Govt Vacancies
  getGovtVacancies: async (params?: any) => {
    const response = await apiClient.get('/admin/cms/govt-vacancies', { params });
    return response.data.data || response.data;
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
};

