import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { MarketplaceAuthService } from './marketplace-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('marketplace-auth')
export class MarketplaceAuthController {
  constructor(private authService: MarketplaceAuthService) {}

  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Query('email') email: string) {
    const available = await this.authService.isEmailAvailable(email);
    return { available };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
