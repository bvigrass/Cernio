import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { MarketplaceAuthModule } from './modules/marketplace-auth/marketplace-auth.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    PrismaModule,

    // Feature modules
    HealthModule,
    AuthModule,
    ClientsModule,
    ProjectsModule,
    InventoryModule,
    MarketplaceModule,
    MarketplaceAuthModule,
  ],
})
export class AppModule {}
