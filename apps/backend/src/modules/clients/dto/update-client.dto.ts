import { IsString, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientType } from '@prisma/client';

export class UpdateClientContactDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ClientType)
  @IsOptional()
  type?: ClientType;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateClientContactDto)
  @IsOptional()
  contacts?: UpdateClientContactDto[];
}
