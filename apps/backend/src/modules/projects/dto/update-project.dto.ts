import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  name?: string;

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
  @IsOptional()
  street1?: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

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
