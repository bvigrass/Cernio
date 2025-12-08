import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MarketplaceAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Check if an email is available for registration
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    const existingUser = await this.prisma.marketplaceUser.findUnique({
      where: { email },
    });
    return !existingUser;
  }

  /**
   * Register a new marketplace customer
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.marketplaceUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create marketplace user
    const user = await this.prisma.marketplaceUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find marketplace user
    const user = await this.prisma.marketplaceUser.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string) {
    try {
      const _payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Check if session exists and is valid
      const session = await this.prisma.marketplaceSession.findUnique({
        where: { refreshToken },
        include: { marketplaceUser: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        session.marketplaceUser.id,
        session.marketplaceUser.email,
      );

      // Delete old session
      await this.prisma.marketplaceSession.delete({
        where: { id: session.id },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string) {
    await this.prisma.marketplaceSession.deleteMany({
      where: { refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email, type: 'marketplace' };

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    // Generate refresh token (long-lived)
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.marketplaceSession.create({
      data: {
        marketplaceUserId: userId,
        refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validate marketplace user by ID (used by JWT strategy if needed)
   */
  async validateUser(userId: string) {
    const user = await this.prisma.marketplaceUser.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
