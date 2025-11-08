import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsDecimal } from 'class-validator';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  street1: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  estimatedCompletionDate?: string;

  @IsDateString()
  @IsOptional()
  actualCompletionDate?: string;

  @IsOptional()
  @Type(() => Number)
  estimatedBudget?: number;

  @IsOptional()
  @Type(() => Number)
  actualCost?: number;
}
