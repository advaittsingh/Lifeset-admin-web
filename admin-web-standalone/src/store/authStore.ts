import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    isAuthenticated: !!token && !!user,
    user,
    token,

    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ isAuthenticated: true, user, token });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isAuthenticated: false, user: null, token: null });
    },

    checkAuth: () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        set({ isAuthenticated: true, user: JSON.parse(userStr), token });
      }
    },
  };
});

