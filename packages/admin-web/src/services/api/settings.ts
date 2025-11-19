import { apiClient } from './client';

export interface Settings {
  security: {
    sessionTimeout: number;
    passwordPolicy: {
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      minLength: number;
    };
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  system: {
    platformName: string;
    maintenanceMode: boolean;
  };
}

export const settingsApi = {
  get: async () => {
    try {
      const response = await apiClient.get('/admin/settings');
      return response.data.data || response.data;
    } catch (error) {
      // Return default settings if endpoint doesn't exist
      return {
        security: {
          sessionTimeout: 60,
          passwordPolicy: {
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            minLength: 8,
          },
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        system: {
          platformName: 'LifeSet Platform',
          maintenanceMode: false,
        },
      };
    }
  },

  update: async (data: Partial<Settings>) => {
    try {
      const response = await apiClient.patch('/admin/settings', data);
      return response.data.data || response.data;
    } catch (error) {
      // Just return the data if endpoint doesn't exist
      return data;
    }
  },
};

