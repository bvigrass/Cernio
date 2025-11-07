import { IsString, IsNotEmpty, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ClientType } from '@prisma/client';

export class CreateClientContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsOptional()
  isPrimary?: boolean;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ClientType)
  type: ClientType;

  @IsString()
  @IsNotEmpty()
  billingAddress: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClientContactDto)
  @IsOptional()
  contacts?: CreateClientContactDto[];
}
