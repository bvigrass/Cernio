import { create } from 'zustand';
import {
  MarketplaceUser,
  MarketplaceLoginCredentials,
  MarketplaceRegisterData,
} from '../types/marketplaceAuth';
import { marketplaceAuthService } from '../services/marketplaceAuthService';

interface MarketplaceAuthState {
  user: MarketplaceUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: MarketplaceLoginCredentials) => Promise<void>;
  register: (data: MarketplaceRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
  clearError: () => void;
}

export const useMarketplaceAuthStore = create<MarketplaceAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: MarketplaceLoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await marketplaceAuthService.login(credentials);

      // Store tokens in separate keys from contractor auth
      localStorage.setItem('marketplaceAccessToken', response.accessToken);
      localStorage.setItem('marketplaceRefreshToken', response.refreshToken);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // Extract error message from various possible formats
      let errorMessage = 'Login failed. Please try again.';

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

  register: async (data: MarketplaceRegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await marketplaceAuthService.register(data);

      // Store tokens in separate keys from contractor auth
      localStorage.setItem('marketplaceAccessToken', response.accessToken);
      localStorage.setItem('marketplaceRefreshToken', response.refreshToken);

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
      await marketplaceAuthService.logout();
    } catch (error) {
      console.error('Marketplace logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: () => {
    const token = localStorage.getItem('marketplaceAccessToken');
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    // For now, we'll just mark as authenticated if token exists
    // In a full implementation, you might want to verify the token with the backend
    // However, since marketplace endpoints are public, this is sufficient
    set({ isAuthenticated: true, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
