import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryItemType, InventoryStatus } from '@prisma/client';

export class UpdateInventoryItemDto {
  @IsEnum(InventoryItemType)
  @IsOptional()
  type?: InventoryItemType;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;

  @IsString()
  @IsOptional()
  projectId?: string;

  // Material-specific fields
  @IsString()
  @IsOptional()
  supplier?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  purchaseCost?: number;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  materialCategory?: string;

  // Tool-specific fields
  @IsString()
  @IsOptional()
  ownership?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  rentalRate?: number;

  @IsString()
  @IsOptional()
  rentalPeriod?: string;

  @IsDateString()
  @IsOptional()
  maintenanceDate?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  // Salvage-specific fields
  @IsString()
  @IsOptional()
  condition?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  estimatedValue?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  reservePrice?: number;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsString()
  @IsOptional()
  storageLocation?: string;
}
