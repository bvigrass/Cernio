import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MarketplaceAuthService } from './marketplace-auth.service';
import { MarketplaceAuthController } from './marketplace-auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
  ],
  controllers: [MarketplaceAuthController],
  providers: [MarketplaceAuthService],
  exports: [MarketplaceAuthService],
})
export class MarketplaceAuthModule {}
