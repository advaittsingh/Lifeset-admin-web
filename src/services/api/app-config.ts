import { apiClient } from './client';

export interface AppIconConfig {
  ios?: string | null;
  android?: string | null;
  default?: string | null;
  updatedAt?: string | null;
}

export interface ReferralCarouselItem {
  id?: string;
  type: 'image' | 'topPerformer';
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  redirectLink?: string;
  order?: number;
}

export interface ReferralCarouselConfig {
  items: ReferralCarouselItem[];
  updatedAt?: string | null;
}

export interface DemoVideoConfig {
  myCard?: string | null;
  networking?: string | null;
  myProfile?: string | null;
  myBookmark?: string | null;
  dailyDigest?: string | null;
  currentAffairs?: string | null;
  generalKnowledge?: string | null;
  knowYourself?: string | null;
  mcq?: string | null;
  fresherJobs?: string | null;
  internships?: string | null;
  govtVacancies?: string | null;
  updatedAt?: string | null;
}

export const appConfigApi = {
  getAppIcon: async (): Promise<AppIconConfig> => {
    const response = await apiClient.get('/app-config/icon');
    return response.data.data || response.data;
  },

  updateAppIcon: async (data: {
    ios?: string;
    android?: string;
    default?: string;
  }): Promise<AppIconConfig> => {
    const response = await apiClient.put('/app-config/icon', data);
    return response.data.data || response.data;
  },

  getReferralCarousel: async (): Promise<ReferralCarouselConfig> => {
    const response = await apiClient.get('/app-config/referral-carousel');
    return response.data.data || response.data;
  },

  updateReferralCarousel: async (data: {
    items: ReferralCarouselItem[];
  }): Promise<ReferralCarouselConfig> => {
    const response = await apiClient.put('/app-config/referral-carousel', data);
    return response.data.data || response.data;
  },

  getDemoVideos: async (): Promise<DemoVideoConfig> => {
    const response = await apiClient.get('/admin/cms/demo-videos');
    return response.data.data || response.data;
  },

  updateDemoVideos: async (data: DemoVideoConfig): Promise<DemoVideoConfig> => {
    const response = await apiClient.put('/admin/cms/demo-videos', data);
    return response.data.data || response.data;
  },
};
