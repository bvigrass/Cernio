import axios from 'axios';
import {
  MarketplaceAuthResponse,
  MarketplaceLoginCredentials,
  MarketplaceRegisterData,
} from '../types/marketplaceAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Marketplace auth service - uses separate endpoints and token storage
export const marketplaceAuthService = {
  /**
   * Check if email is available for registration
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    const response = await axios.get<{ available: boolean }>(
      `${API_URL}/marketplace-auth/check-email`,
      { params: { email } }
    );
    return response.data.available;
  },

  /**
   * Register a new marketplace customer
   */
  async register(data: MarketplaceRegisterData): Promise<MarketplaceAuthResponse> {
    const response = await axios.post<MarketplaceAuthResponse>(
      `${API_URL}/marketplace-auth/register`,
      data
    );
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(credentials: MarketplaceLoginCredentials): Promise<MarketplaceAuthResponse> {
    const response = await axios.post<MarketplaceAuthResponse>(
      `${API_URL}/marketplace-auth/login`,
      credentials
    );
    return response.data;
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('marketplaceRefreshToken');
    if (refreshToken) {
      try {
        await axios.post(`${API_URL}/marketplace-auth/logout`, { refreshToken });
      } catch (error) {
        // Ignore logout errors, clear tokens anyway
        console.error('Marketplace logout error:', error);
      }
    }
    localStorage.removeItem('marketplaceAccessToken');
    localStorage.removeItem('marketplaceRefreshToken');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await axios.post(`${API_URL}/marketplace-auth/refresh`, { refreshToken });
    return response.data;
  },
};
