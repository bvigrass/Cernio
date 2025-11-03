import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const mockResponse = {
      user: {
        id: 'user-id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.COMPANY_ADMIN,
        companyId: 'company-id',
        company: {
          id: 'company-id',
          name: 'Test Company',
        },
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('should successfully register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(controller.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });

    it('should call authService.register with correct parameters', async () => {
      mockAuthService.register.mockResolvedValue(mockResponse);

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith({
        companyName: 'Test Company',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockResponse = {
      user: {
        id: 'user-id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.COMPANY_ADMIN,
        isActive: true,
        companyId: 'company-id',
        company: {
          id: 'company-id',
          name: 'Test Company',
        },
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    it('should successfully login with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Account is deactivated'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Account is deactivated',
      );
    });

    it('should call authService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      });
    });

    it('should return user without password field', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
    });
  });

  describe('POST /auth/refresh', () => {
    const refreshToken = 'valid-refresh-token';

    const mockResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should successfully refresh tokens with valid refresh token', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockResponse);

      const result = await controller.refresh(refreshToken);

      expect(result).toEqual(mockResponse);
      expect(authService.refreshTokens).toHaveBeenCalledWith(refreshToken);
      expect(authService.refreshTokens).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.refresh('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Refresh token expired'),
      );

      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        'Refresh token expired',
      );
    });

    it('should call authService.refreshTokens with correct parameters', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockResponse);

      await controller.refresh(refreshToken);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });
  });

  describe('POST /auth/logout', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully logout', async () => {
      const mockResponse = { message: 'Logged out successfully' };
      mockAuthService.logout.mockResolvedValue(mockResponse);

      const result = await controller.logout(refreshToken);

      expect(result).toEqual(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('should call authService.logout with correct parameters', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      await controller.logout(refreshToken);

      expect(authService.logout).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should handle logout even if token does not exist', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await controller.logout('non-existent-token');

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('GET /auth/me', () => {
    const mockUser = {
      id: 'user-id',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.COMPANY_ADMIN,
      isActive: true,
      companyId: 'company-id',
      company: {
        id: 'company-id',
        name: 'Test Company',
      },
    };

    it('should return the authenticated user profile', async () => {
      const mockRequest = {
        user: mockUser,
      };

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });

    it('should return user without password field', async () => {
      const mockRequest = {
        user: mockUser,
      };

      const result = await controller.getProfile(mockRequest);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('role');
    });

    it('should return user with company information', async () => {
      const mockRequest = {
        user: mockUser,
      };

      const result = await controller.getProfile(mockRequest);

      expect(result).toHaveProperty('company');
      expect(result.company).toHaveProperty('id');
      expect(result.company).toHaveProperty('name');
    });
  });
});
