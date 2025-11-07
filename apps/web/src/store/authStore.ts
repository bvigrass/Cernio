import { create } from 'zustand';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    localStorage.setItem('DEBUG_LOGIN', 'Login started');
    console.log('[AuthStore] Login started, clearing error');
    set({ isLoading: true, error: null });
    try {
      localStorage.setItem('DEBUG_LOGIN', 'Calling authService.login');
      const response = await authService.login(credentials);

      // Store tokens
      localStorage.setItem('DEBUG_LOGIN', 'Login successful, storing tokens');
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      console.log('[AuthStore] Login successful');
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      localStorage.removeItem('DEBUG_LOGIN');
    } catch (error: any) {
      localStorage.setItem('DEBUG_LOGIN', 'Login error caught');

      // Extract error message from various possible formats
      let errorMessage = 'Login failed. Please try again.';

      console.log('[AuthStore] Login error caught:', error);
      console.log('[AuthStore] Error response:', error.response);
      console.log('[AuthStore] Error response data:', error.response?.data);

      if (error.response?.data?.message) {
        // NestJS format: { statusCode, message, error }
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      localStorage.setItem('DEBUG_ERROR_MESSAGE', errorMessage);
      console.log('[AuthStore] Setting error message:', errorMessage);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      localStorage.setItem('DEBUG_LOGIN', 'Error set in store: ' + errorMessage);
      console.log('[AuthStore] Error state after set. Checking store:', useAuthStore.getState().error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Extract error message from various possible formats
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.message) {
        // NestJS format: { statusCode, message, error }
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Token invalid or expired, clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
