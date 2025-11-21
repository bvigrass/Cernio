export interface MarketplaceUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
}

export interface MarketplaceAuthResponse {
  user: MarketplaceUser;
  accessToken: string;
  refreshToken: string;
}

export interface MarketplaceLoginCredentials {
  email: string;
  password: string;
}

export interface MarketplaceRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}
