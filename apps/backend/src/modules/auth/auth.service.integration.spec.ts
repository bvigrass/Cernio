import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Integration tests for AuthService
 * These tests use a real test database to verify the service works correctly
 * with actual database operations (not mocked)
 */
describe('AuthService Integration Tests', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let moduleRef: TestingModule;

  // Counter for generating unique tokens
  let tokenCounter = 0;

  // Setup test environment before all tests
  beforeAll(async () => {
    // Load test environment variables
    process.env.DATABASE_URL =
      'postgresql://postgres:ThisIsMyKey22!@localhost:5432/cernio_test';
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '30d';

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      providers: [
        AuthService,
        PrismaService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload, options) => {
              // Generate unique tokens using a counter to avoid duplicates
              tokenCounter++;
              if (options?.secret === process.env.JWT_REFRESH_SECRET) {
                return `refresh-token-${payload.sub}-${tokenCounter}`;
              }
              return `access-token-${payload.sub}-${tokenCounter}`;
            }),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    // Connect to test database
    await prisma.$connect();
  });

  // Clean database before each test
  beforeEach(async () => {
    await prisma.auditEvent.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
  });

  // Disconnect after all tests
  afterAll(async () => {
    await prisma.auditEvent.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.$disconnect();
    await moduleRef.close();
  });

  describe('register', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should successfully register a new user and company in database', async () => {
      const result = await service.register(registerDto);

      // Verify response structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      // Verify user data
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.firstName).toBe(registerDto.firstName);
      expect(result.user.lastName).toBe(registerDto.lastName);
      expect(result.user.role).toBe(UserRole.COMPANY_ADMIN);
      expect(result.user).not.toHaveProperty('password');

      // Verify company was created in database
      const company = await prisma.company.findUnique({
        where: { id: result.user.companyId },
      });
      expect(company).toBeDefined();
      expect(company?.name).toBe(registerDto.companyName);

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: registerDto.email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(registerDto.email);
      expect(user?.companyId).toBe(company?.id);

      // Verify password was hashed
      expect(user?.password).not.toBe(registerDto.password);
      const isPasswordValid = await bcrypt.compare(
        registerDto.password,
        user?.password || '',
      );
      expect(isPasswordValid).toBe(true);

      // Verify session was created
      const session = await prisma.session.findFirst({
        where: { userId: user?.id },
      });
      expect(session).toBeDefined();
      expect(session?.refreshToken).toContain('refresh-token');
    });

    it('should throw ConflictException if user already exists in database', async () => {
      // First registration
      await service.register(registerDto);

      // Try to register same email again
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );

      // Verify only one user exists
      const users = await prisma.user.findMany({
        where: { email: registerDto.email },
      });
      expect(users).toHaveLength(1);
    });

    it('should create company and user in a transaction', async () => {
      const result = await service.register(registerDto);

      // Verify user's companyId matches created company
      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
        include: { company: true },
      });

      expect(user?.companyId).toBe(user?.company.id);
      expect(user?.company.name).toBe(registerDto.companyName);
    });
  });

  describe('login', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Register a user before each login test
      await service.register(registerDto);
    });

    it('should successfully login with valid credentials', async () => {
      const result = await service.login(loginDto);

      // Verify response structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      // Verify user data
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user).not.toHaveProperty('password');

      // Verify new session was created in database
      const sessions = await prisma.session.findMany({
        where: { userId: result.user.id },
      });
      expect(sessions.length).toBeGreaterThan(0);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      await expect(
        service.login({
          email: loginDto.email,
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      // Deactivate the user
      const user = await prisma.user.findUnique({
        where: { email: loginDto.email },
      });
      await prisma.user.update({
        where: { id: user?.id },
        data: { isActive: false },
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is deactivated',
      );
    });

    it('should create multiple sessions for same user on multiple logins', async () => {
      // Login multiple times
      await service.login(loginDto);
      await service.login(loginDto);
      const result = await service.login(loginDto);

      // Verify multiple sessions exist
      const sessions = await prisma.session.findMany({
        where: { userId: result.user.id },
      });
      expect(sessions.length).toBe(4); // 1 from register + 3 from logins
    });
  });

  describe('refreshTokens', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const result = await service.register(registerDto);
      refreshToken = result.refreshToken;
      userId = result.user.id;

      // Mock JWT verify to validate the refresh token
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: userId,
        email: registerDto.email,
      });
    });

    it('should successfully refresh tokens with valid refresh token', async () => {
      const result = await service.refreshTokens(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      // Verify old session was deleted
      const oldSession = await prisma.session.findUnique({
        where: { refreshToken },
      });
      expect(oldSession).toBeNull();

      // Verify new session was created
      const newSession = await prisma.session.findUnique({
        where: { refreshToken: result.refreshToken },
      });
      expect(newSession).toBeDefined();
      expect(newSession?.userId).toBe(userId);
    });

    it('should throw UnauthorizedException if refresh token not found in database', async () => {
      await expect(
        service.refreshTokens('non-existent-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      // Create an expired session
      await prisma.session.update({
        where: { refreshToken },
        data: {
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    let refreshToken: string;

    beforeEach(async () => {
      const result = await service.register(registerDto);
      refreshToken = result.refreshToken;
    });

    it('should successfully logout and delete session from database', async () => {
      // Verify session exists
      const sessionBefore = await prisma.session.findUnique({
        where: { refreshToken },
      });
      expect(sessionBefore).toBeDefined();

      // Logout
      const result = await service.logout(refreshToken);
      expect(result).toEqual({ message: 'Logged out successfully' });

      // Verify session was deleted
      const sessionAfter = await prisma.session.findUnique({
        where: { refreshToken },
      });
      expect(sessionAfter).toBeNull();
    });

    it('should handle logout with non-existent token gracefully', async () => {
      const result = await service.logout('non-existent-token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('validateUser', () => {
    const registerDto = {
      companyName: 'Test Company',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    let userId: string;

    beforeEach(async () => {
      const result = await service.register(registerDto);
      userId = result.user.id;
    });

    it('should return user without password if user exists and is active', async () => {
      const user = await service.validateUser(userId);

      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
      expect(user?.email).toBe(registerDto.email);
      expect(user).not.toHaveProperty('password');
      expect(user?.company).toBeDefined();
    });

    it('should return null if user does not exist', async () => {
      const user = await service.validateUser('non-existent-id');
      expect(user).toBeNull();
    });

    it('should return null if user is not active', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      const user = await service.validateUser(userId);
      expect(user).toBeNull();
    });
  });
});
