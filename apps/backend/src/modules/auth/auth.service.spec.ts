import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

// Mock bcrypt at module level
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should successfully register a new user and company', async () => {
      const mockCompany = {
        id: 'company-id',
        name: 'Test Company',
      };

      const mockUser = {
        id: 'user-id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.COMPANY_ADMIN,
        companyId: 'company-id',
        company: mockCompany,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          company: {
            create: jest.fn().mockResolvedValue(mockCompany),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
        });
      });

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'john@example.com',
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-id',
      email: 'john@example.com',
      password: 'hashed-password',
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

    it('should successfully login with valid credentials', async () => {
      const bcrypt = require('bcrypt');
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
      });

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const bcrypt = require('bcrypt');
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is deactivated',
      );
    });
  });

  describe('validateUser', () => {
    it('should return user without password if user is active', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'john@example.com',
        password: 'hashed-password',
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

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-id');

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', 'user-id');
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('user-id');

      expect(result).toBeNull();
    });

    it('should return null if user is not active', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        isActive: false,
      });

      const result = await service.validateUser('user-id');

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should delete session with refresh token', async () => {
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('refresh-token');

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh-token' },
      });
    });
  });
});
